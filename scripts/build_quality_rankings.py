"""
Build NWv-7 data-quality rankings.

Outputs:
  public/newsdata/quality_rankings.json
  public/newsdata/quality_rankings.md
  public/newsdata/quality_rankings_history.json
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from quality_ranking_model import (
    build_comparison_statements,
    score_destination_quality,
    score_section_quality,
    score_source_health,
)

NEWS_DIR = Path("public/newsdata")
DATA_DIR = Path("public/data")

OUTPUT_JSON = NEWS_DIR / "quality_rankings.json"
OUTPUT_MD = NEWS_DIR / "quality_rankings.md"
HISTORY_JSON = NEWS_DIR / "quality_rankings_history.json"

DESTINATIONS = ["main", "insight", "upAhead", "planner", "weather", "market", "buzz", "newspaper", "following"]


def read_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False, sort_keys=True), encoding="utf-8")


def write_text(path: Path, payload: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(payload, encoding="utf-8")


def compact_history_row(report: dict[str, Any]) -> dict[str, Any]:
    return {
        "generatedAt": report.get("generatedAt"),
        "overallScore": report.get("overall", {}).get("qualityScore", 0),
        "destinationScores": {
            key: value.get("qualityScore", 0)
            for key, value in report.get("destinations", {}).items()
        },
        "sectionScores": {
            key: value.get("qualityScore", 0)
            for key, value in report.get("sections", {}).items()
        },
        "sourceScores": {
            key: value.get("qualityScore", 0)
            for key, value in report.get("sources", {}).items()
        },
        "sectionStoryCounts": {
            key: value.get("scoreBreakdown", {}).get("storyCount", 0)
            for key, value in report.get("sections", {}).items()
        },
        "sectionStaleRatios": {
            key: value.get("scoreBreakdown", {}).get("staleOrUnknownRatio", 0)
            for key, value in report.get("sections", {}).items()
        },
        "sectionSourceGroupCounts": {
            key: value.get("scoreBreakdown", {}).get("sourceGroupCount", 0)
            for key, value in report.get("sections", {}).items()
        },
        "degradedSources": [
            key for key, value in report.get("sources", {}).items()
            if value.get("qualityScore", 100) < 60 or value.get("obsoleteCandidate")
        ],
    }


def top_n(mapping: dict[str, dict[str, Any]], n: int = 5) -> list[dict[str, Any]]:
    rows = []
    for key, value in mapping.items():
        rows.append({
            "key": key,
            "qualityScore": value.get("qualityScore", 0),
            "qualityGrade": value.get("qualityGrade"),
            "qualityStatus": value.get("qualityStatus"),
            "diagnosticReasons": value.get("diagnosticReasons", []),
        })
    return sorted(rows, key=lambda row: row["qualityScore"])[:n]


def build_quality_rankings(now_ms: int | None = None) -> dict[str, Any]:
    now_ms = int(now_ms or time.time() * 1000)

    inputs = {
        "sections_latest": read_json(NEWS_DIR / "sections_latest.json", {}),
        "insight_latest": read_json(NEWS_DIR / "insight_latest.json", {}),
        "insight_quality_report": read_json(NEWS_DIR / "insight_quality_report.json", {}),
        "real_insight_quality_report": read_json(NEWS_DIR / "real_insight_quality_report.json", {}),
        "source_health": read_json(NEWS_DIR / "source_health.json", {}),
        "up_ahead": read_json(DATA_DIR / "up_ahead.json", {}),
        "up_ahead_quality_gate": read_json(DATA_DIR / "up_ahead_quality_gate.json", {}),
        "planner_latest": read_json(DATA_DIR / "planner_latest.json", {}),
        "planner_quality_gate": read_json(DATA_DIR / "planner_quality_gate.json", {}),
        "weather_snapshot": read_json(DATA_DIR / "weather_snapshot.json", {}),
        "market_snapshot": read_json(DATA_DIR / "market_snapshot.json", {}),
        "newspaper": read_json(DATA_DIR / "epaper_data.json", {}),
        "following": read_json(DATA_DIR / "following.json", {}),
    }

    source_health_doc = inputs["source_health"]
    source_health_map = source_health_doc.get("sources", source_health_doc) if isinstance(source_health_doc, dict) else {}

    sources = {
        source_group: score_source_health(source_group, record, now_ms)
        for source_group, record in source_health_map.items()
        if isinstance(record, dict)
    }

    sections_latest = inputs["sections_latest"] if isinstance(inputs["sections_latest"], dict) else {}
    section_payload = sections_latest.get("sections", {}) if isinstance(sections_latest.get("sections", {}), dict) else {}
    sections = {
        section: score_section_quality(section, stories, source_health_map, now_ms)
        for section, stories in section_payload.items()
        if isinstance(stories, list)
    }

    destinations = {
        destination: score_destination_quality(destination, inputs, now_ms)
        for destination in DESTINATIONS
    }

    score_parts = [value.get("qualityScore", 0) for value in destinations.values()]
    overall_score = round(sum(score_parts) / max(1, len(score_parts)), 2)

    critical_findings = []
    for source in top_n(sources, 5):
        if source["qualityScore"] < 60:
            reason = source["diagnosticReasons"][0] if source["diagnosticReasons"] else "weak source score"
            critical_findings.append(f"{source['key']} weak/broken: {reason}")
    for section in top_n(sections, 5):
        if section["qualityScore"] < 60:
            reason = section["diagnosticReasons"][0] if section["diagnosticReasons"] else "weak section score"
            critical_findings.append(f"{section['key']} weak: {reason}")

    report: dict[str, Any] = {
        "schemaVersion": 1,
        "collectorVersion": "quality-rankings-v1",
        "generatedAt": now_ms,
        "overall": {
            "qualityScore": overall_score,
            "qualityGrade": _grade(overall_score),
            "qualityStatus": "WARN" if overall_score < 75 or critical_findings else "PASS",
            "topFindings": critical_findings[:8],
        },
        "destinations": destinations,
        "sections": sections,
        "sources": sources,
        "comparisons": [],
        "actionableFindings": build_actionable_findings(sources, sections, destinations),
    }

    history_doc = read_json(HISTORY_JSON, {"schemaVersion": 1, "runs": []})
    history_runs = [row for row in history_doc.get("runs", []) if isinstance(row, dict)]
    current_row = compact_history_row(report)
    report["comparisons"] = build_comparison_statements(current_row, history_runs)
    report["overall"]["comparisonStatements"] = report["comparisons"][:5]

    updated_history = (history_runs + [current_row])[-20:]
    write_json(HISTORY_JSON, {"schemaVersion": 1, "generatedAt": now_ms, "runs": updated_history})
    write_json(OUTPUT_JSON, report)
    write_text(OUTPUT_MD, render_markdown(report))
    return report


def _grade(score: float) -> str:
    if score >= 90:
        return "A"
    if score >= 75:
        return "B"
    if score >= 60:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def build_actionable_findings(
    sources: dict[str, dict[str, Any]],
    sections: dict[str, dict[str, Any]],
    destinations: dict[str, dict[str, Any]],
) -> list[str]:
    actions: list[str] = []
    for source_group, row in sorted(sources.items(), key=lambda item: item[1].get("qualityScore", 100)):
        if row.get("obsoleteCandidate") or row.get("qualityScore", 100) < 40:
            actions.append(f"Replace or disable {source_group}; source score is {row.get('qualityScore')}/100.")
    for section, row in sorted(sections.items(), key=lambda item: item[1].get("qualityScore", 100)):
        if row.get("qualityScore", 100) < 60:
            actions.append(f"Review {section} feeds/backfill; section score is {row.get('qualityScore')}/100.")
    for destination, row in destinations.items():
        if row.get("qualityStatus") == "FAIL":
            actions.append(f"Fix {destination} blocker: {'; '.join(row.get('diagnosticReasons', [])[:2])}.")
    return actions[:10]


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# NWv-7 Data Quality Ranking",
        "",
        f"Overall: {report['overall']['qualityStatus']} — {report['overall']['qualityScore']}/100 ({report['overall']['qualityGrade']})",
        "",
        "## Critical Findings",
    ]
    findings = report["overall"].get("topFindings") or ["No critical findings."]
    lines.extend(f"- {finding}" for finding in findings)

    lines.extend(["", "## Destination Scores"])
    for key, row in report.get("destinations", {}).items():
        lines.append(f"- {key}: {row.get('qualityStatus')} — {row.get('qualityScore')}/100 ({row.get('qualityGrade')})")

    lines.extend(["", "## Weakest Sources"])
    for row in top_n(report.get("sources", {}), 8):
        lines.append(f"- {row['key']}: {row['qualityScore']}/100 — {'; '.join(row['diagnosticReasons'][:2])}")

    lines.extend(["", "## Weakest Sections"])
    for row in top_n(report.get("sections", {}), 8):
        lines.append(f"- {row['key']}: {row['qualityScore']}/100 — {'; '.join(row['diagnosticReasons'][:2])}")

    lines.extend(["", "## Compared with recent runs"])
    comparisons = report.get("comparisons") or ["No comparison statements yet; history will populate after repeated runs."]
    lines.extend(f"- {item}" for item in comparisons)

    lines.extend(["", "## Action List"])
    actions = report.get("actionableFindings") or ["No immediate action."]
    lines.extend(f"{i + 1}. {item}" for i, item in enumerate(actions))
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    report = build_quality_rankings()
    print(json.dumps({
        "overallScore": report["overall"]["qualityScore"],
        "overallStatus": report["overall"]["qualityStatus"],
        "destinations": {
            key: row["qualityScore"]
            for key, row in report["destinations"].items()
        },
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
