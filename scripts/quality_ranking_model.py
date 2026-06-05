"""
quality_ranking_model.py

Data-quality scoring for NWv-7.

Architecture rule:
  - Every tab uses the same output contract.
  - Every tab has tab-specific scoring logic.
  - The generic score_destination_quality() function is a router only.

This module is intentionally tolerant of evolving JSON shapes because the
prefetch workers and quality reports have changed over time. Missing inputs
produce diagnostic reasons and lower scores; they should not crash the workflow.
"""
from __future__ import annotations

import statistics
import time
from collections import Counter
from typing import Any, Callable

DAY_MS = 24 * 60 * 60 * 1000
HOUR_MS = 60 * 60 * 1000

QUALITY_CONTRACT_KEYS = {
    "qualityScore",
    "qualityGrade",
    "qualityStatus",
    "scoreBreakdown",
    "diagnosticReasons",
    "comparisonStatements",
    "actionableFindings",
}


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    try:
        value = float(value)
    except Exception:
        value = lo
    return max(lo, min(hi, value))


def to_number(value: Any, fallback: float = 0.0) -> float:
    try:
        n = float(value)
    except Exception:
        return fallback
    return n if n == n else fallback


def as_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        # Many repo snapshots use maps keyed by section/category/topic.
        return list(value.values())
    return []


def grade_score(score: float) -> str:
    score = clamp(score)
    if score >= 90:
        return "A"
    if score >= 75:
        return "B"
    if score >= 60:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def status_from_score(score: float, warnings: list[str] | None = None, hard_errors: list[str] | None = None) -> str:
    warnings = warnings or []
    hard_errors = hard_errors or []
    if hard_errors:
        return "FAIL"
    if score < 75 or warnings:
        return "WARN"
    return "PASS"


def normalize_quality_result(
    *,
    score: float,
    breakdown: dict[str, Any] | None = None,
    reasons: list[str] | None = None,
    findings: list[str] | None = None,
    comparisons: list[str] | None = None,
    hard_errors: list[str] | None = None,
    extras: dict[str, Any] | None = None,
) -> dict[str, Any]:
    score = round(clamp(score), 2)
    reasons = list(reasons or [])
    hard_errors = list(hard_errors or [])
    result = {
        "qualityScore": score,
        "qualityGrade": grade_score(score),
        "qualityStatus": status_from_score(score, reasons, hard_errors),
        "scoreBreakdown": breakdown or {},
        "diagnosticReasons": [*hard_errors, *reasons],
        "comparisonStatements": list(comparisons or []),
        "actionableFindings": list(findings or []),
    }
    if extras:
        result.update(extras)
    return result


def ratio_score(numerator: float, denominator: float, cap: float = 1.0) -> float:
    denominator = max(1.0, float(denominator or 0))
    return clamp((float(numerator or 0) / denominator) / cap * 100)


def freshness_bucket(story: dict[str, Any], now_ms: int) -> str:
    published = story.get("publishedAt") or story.get("published_at") or story.get("dateMs") or story.get("timestamp")
    try:
        published = int(published)
    except Exception:
        return "unknown"

    # Accept seconds accidentally stored instead of ms.
    if published and published < 10_000_000_000:
        published *= 1000

    age = now_ms - published
    if age < 0:
        return "future"
    if age <= 24 * HOUR_MS:
        return "0_24h"
    if age <= 36 * HOUR_MS:
        return "24_36h"
    return "stale"


def source_group_of(item: dict[str, Any]) -> str:
    return str(item.get("sourceGroup") or item.get("source_group") or item.get("source") or "unknown").strip() or "unknown"


def is_fallback_story(story: dict[str, Any]) -> bool:
    group = source_group_of(story).lower()
    url = str(story.get("url") or story.get("link") or "").lower()
    return bool(
        story.get("backfilledFrom")
        or story.get("fallback")
        or group.startswith("google_news")
        or group in {"google_news", "google_news_alt", "google_news_oman"}
        or "news.google.com" in url
    )


def infer_provider(record: dict[str, Any]) -> str:
    explicit = str(record.get("provider") or "").lower()
    if explicit:
        return explicit
    url = str(record.get("feedUrl") or record.get("url") or "").lower()
    group = str(record.get("sourceGroup") or record.get("source") or "").lower()
    if "news.google.com" in url or group.startswith("google_news"):
        return "google_news"
    if "gdelt" in url or "gdelt" in group:
        return "gdelt"
    if record.get("static"):
        return "static"
    return "rss"


def provider_reliability(provider: str) -> float:
    return {
        "static": 95,
        "rss": 85,
        "google_news": 70,
        "gdelt": 65,
    }.get(str(provider or "rss").lower(), 75)


def tier_score(tier: str | None) -> float:
    return {"A": 100, "B": 75, "C": 50}.get(str(tier or "C").upper(), 50)


def source_record_age_hours(record: dict[str, Any], now_ms: int) -> float:
    checked = record.get("lastCheckedAt") or record.get("lastChecked") or record.get("lastSuccess") or 0
    try:
        checked = int(checked)
    except Exception:
        checked = 0
    if not checked:
        return 999.0
    return max(0.0, (now_ms - checked) / HOUR_MS)


def score_source_health(source_group: str, record: dict[str, Any] | None, now_ms: int | None = None) -> dict[str, Any]:
    now_ms = int(now_ms or time.time() * 1000)
    record = dict(record or {})
    reasons: list[str] = []
    findings: list[str] = []

    ok = record.get("ok")
    status = str(record.get("status") or ("ok" if ok else "fail" if ok is False else "unknown")).lower()
    items = int(to_number(record.get("acceptedItems", record.get("items", 0)), 0))
    expected = max(1, int(to_number(record.get("expectedItems", 10), 10)))
    zero_runs = int(to_number(record.get("consecutiveZeroItems", record.get("zeroItemRuns", 0)), 0))
    failure_runs = int(to_number(record.get("consecutiveFailures", 0), 0))
    if ok is False and failure_runs == 0:
        # Current repo schema does not persist consecutiveFailures yet. Treat the
        # failure-equivalent zero streak as a compatibility fallback.
        failure_runs = zero_runs

    last_non_zero = int(to_number(record.get("lastNonZeroSuccess", record.get("lastSuccess", 0)), 0))
    age_since_success_hours = (now_ms - last_non_zero) / HOUR_MS if last_non_zero else 999.0

    availability = 100 if ok is True else 0 if ok is False else 55
    yield_component = ratio_score(items, expected)
    freshness = 100 if age_since_success_hours <= 6 else 80 if age_since_success_hours <= 24 else 45 if age_since_success_hours <= 72 else 10
    stability = clamp(100 - (failure_runs * 18) - (zero_runs * 8))
    source_tier = tier_score(record.get("tier"))
    provider = infer_provider(record)
    provider_component = provider_reliability(provider)

    score = (
        availability * 0.25
        + yield_component * 0.20
        + freshness * 0.20
        + stability * 0.15
        + source_tier * 0.10
        + provider_component * 0.10
    )

    if status in {"fail", "broken"} or ok is False:
        score -= 20
        reasons.append(f"{source_group} fetch failed")
    if failure_runs >= 3:
        score -= 20
        reasons.append(f"{source_group} has {failure_runs} consecutive/equivalent failures")
    if zero_runs >= 3:
        score -= 15
        reasons.append(f"{source_group} has {zero_runs} consecutive zero-item runs")
    if age_since_success_hours > 72:
        score -= 10
        reasons.append(f"{source_group} last non-zero success is older than 72h")
    if items == 0 and ok is True:
        reasons.append(f"{source_group} is reachable but returned zero usable items")

    if failure_runs >= 3 or zero_runs >= 3 or age_since_success_hours > 7 * 24:
        findings.append(f"Review or replace {source_group}; it is a broken/obsolete-source candidate.")

    breakdown = {
        "availability": round(availability, 2),
        "yield": round(yield_component, 2),
        "freshness": round(freshness, 2),
        "stability": round(stability, 2),
        "sourceTier": round(source_tier, 2),
        "providerReliability": round(provider_component, 2),
        "provider": provider,
        "items": items,
        "zeroItemRuns": zero_runs,
        "consecutiveFailures": failure_runs,
        "ageSinceLastNonZeroSuccessHours": round(age_since_success_hours, 2),
    }

    return normalize_quality_result(
        score=score,
        breakdown=breakdown,
        reasons=reasons,
        findings=findings,
        extras={
            "sourceGroup": source_group,
            "sourceQualityScore": round(clamp(score), 2),
            "label": source_label(score),
            "obsoleteCandidate": bool(failure_runs >= 3 or zero_runs >= 3 or age_since_success_hours > 7 * 24),
            "lastError": record.get("lastError"),
            "section": record.get("section"),
        },
    )


def source_label(score: float) -> str:
    score = clamp(score)
    if score >= 90:
        return "EXCELLENT"
    if score >= 75:
        return "GOOD"
    if score >= 60:
        return "WATCH"
    if score >= 40:
        return "WEAK"
    return "BROKEN"


def score_section_quality(
    section_name: str,
    stories: list[dict[str, Any]] | None,
    source_health: dict[str, Any] | None = None,
    now_ms: int | None = None,
    expected_count: int = 12,
) -> dict[str, Any]:
    now_ms = int(now_ms or time.time() * 1000)
    stories = [s for s in (stories or []) if isinstance(s, dict)]
    source_health = source_health or {}

    count = len(stories)
    groups = [source_group_of(s) for s in stories]
    group_count = len(set(groups))
    fallback_count = sum(1 for s in stories if is_fallback_story(s))
    buckets = Counter(freshness_bucket(s, now_ms) for s in stories)
    stale_count = buckets["24_36h"] + buckets["stale"] + buckets["unknown"]
    fresh_count = buckets["0_24h"] + buckets["future"]

    related_health = []
    for group in set(groups):
        rec = source_health.get(group, {})
        related_health.append(score_source_health(group, rec, now_ms)["qualityScore"])
    avg_source_health = statistics.mean(related_health) if related_health else 50.0

    story_volume = ratio_score(count, expected_count)
    source_diversity = ratio_score(group_count, 4)
    freshness = ratio_score(fresh_count, max(1, count))
    provider_mix = ratio_score(group_count - (1 if fallback_count else 0), 3)
    fallback_quality = clamp(100 - ratio_score(fallback_count, max(1, count)))

    score = (
        story_volume * 0.25
        + source_diversity * 0.20
        + freshness * 0.20
        + avg_source_health * 0.15
        + provider_mix * 0.10
        + fallback_quality * 0.10
    )

    reasons: list[str] = []
    findings: list[str] = []
    if count < expected_count:
        score -= 25 if count < 8 else 10
        reasons.append(f"{section_name} has low story volume: {count}/{expected_count}")
    if group_count < 2:
        score -= 20
        reasons.append(f"{section_name} has weak source diversity: {group_count} source group(s)")
    if count and stale_count / count > 0.50:
        score -= 10
        reasons.append(f"{section_name} is stale: {stale_count}/{count} stories are 24h+/unknown")
    if count and fallback_count / count > 0.70:
        score -= 15
        reasons.append(f"{section_name} is fallback-heavy: {fallback_count}/{count} fallback/backfill stories")
    if reasons:
        findings.append(f"Improve {section_name}: " + "; ".join(reasons[:2]))

    breakdown = {
        "storyCount": count,
        "expectedStoryCount": expected_count,
        "sourceGroupCount": group_count,
        "fallbackCount": fallback_count,
        "fallbackRatio": round(fallback_count / max(1, count), 4),
        "freshCount": fresh_count,
        "staleOrUnknownCount": stale_count,
        "staleOrUnknownRatio": round(stale_count / max(1, count), 4),
        "storyVolume": round(story_volume, 2),
        "sourceDiversity": round(source_diversity, 2),
        "freshness": round(freshness, 2),
        "sourceHealth": round(avg_source_health, 2),
        "providerMix": round(provider_mix, 2),
        "fallbackQuality": round(fallback_quality, 2),
        "topSources": [{"sourceGroup": g, "count": c} for g, c in Counter(groups).most_common(8)],
    }

    return normalize_quality_result(
        score=score,
        breakdown=breakdown,
        reasons=reasons,
        findings=findings,
        extras={
            "section": section_name,
            "sectionQualityScore": round(clamp(score), 2),
            "label": section_label(score),
        },
    )


def section_label(score: float) -> str:
    score = clamp(score)
    if score >= 90:
        return "RICH"
    if score >= 75:
        return "HEALTHY"
    if score >= 60:
        return "THIN"
    if score >= 40:
        return "STALE / FALLBACK-HEAVY"
    return "BROKEN"


def _extract_sections(sections_latest: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    if not isinstance(sections_latest, dict):
        return {}
    sections = sections_latest.get("sections", sections_latest.get("stories", {}))
    return sections if isinstance(sections, dict) else {}


def score_main_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Main quality is section richness/freshness/source health quality."""
    now_ms = int(now_ms or time.time() * 1000)
    sections = _extract_sections(inputs.get("sections_latest", {}))
    source_health = (inputs.get("source_health", {}) or {}).get("sources", inputs.get("source_health", {}))
    reasons: list[str] = []

    if not sections:
        return normalize_quality_result(
            score=0,
            hard_errors=["Main has no sections_latest.sections payload"],
            breakdown={"sectionCount": 0},
            extras={"destination": "main", "destinationQualityScore": 0},
        )

    section_scores = {
        name: score_section_quality(name, stories, source_health, now_ms)
        for name, stories in sections.items()
    }
    scores = [row["qualityScore"] for row in section_scores.values()]
    pass_rate = sum(1 for s in scores if s >= 75) / max(1, len(scores)) * 100
    total_story_count = sum(row["scoreBreakdown"]["storyCount"] for row in section_scores.values())
    total_source_groups = len({
        src["sourceGroup"]
        for row in section_scores.values()
        for src in row["scoreBreakdown"].get("topSources", [])
    })
    freshness = statistics.mean(row["scoreBreakdown"]["freshness"] for row in section_scores.values())
    source_health_score_avg = statistics.mean(row["scoreBreakdown"]["sourceHealth"] for row in section_scores.values())

    score = (
        pass_rate * 0.30
        + ratio_score(total_story_count, 120) * 0.20
        + ratio_score(total_source_groups, 12) * 0.20
        + freshness * 0.15
        + source_health_score_avg * 0.15
    )

    weak = [name for name, row in section_scores.items() if row["qualityScore"] < 60]
    if weak:
        reasons.append("Weak main sections: " + ", ".join(weak[:5]))

    return normalize_quality_result(
        score=score,
        breakdown={
            "sectionPassRate": round(pass_rate, 2),
            "sectionCount": len(section_scores),
            "totalStoryCount": total_story_count,
            "sourceGroupCount": total_source_groups,
            "freshness": round(freshness, 2),
            "sourceHealth": round(source_health_score_avg, 2),
            "sectionScores": {name: row["qualityScore"] for name, row in section_scores.items()},
        },
        reasons=reasons,
        findings=[f"Review weak sections: {', '.join(weak[:5])}"] if weak else [],
        extras={"destination": "main", "destinationQualityScore": round(clamp(score), 2)},
    )


def _pick_primary_report(inputs: dict[str, Any]) -> dict[str, Any]:
    candidates = [
        inputs.get("real_insight_quality_report", {}),
        inputs.get("insight_quality_report", {}),
        inputs.get("insight_latest", {}),
    ]
    best = {}
    best_count = -1
    for report in candidates:
        if not isinstance(report, dict):
            continue
        count = int(to_number(
            report.get("clusterCount")
            or report.get("storyCount")
            or report.get("totalStories")
            or report.get("summary", {}).get("storyCount")
            or len(as_list(report.get("stories"))),
            0,
        ))
        if count > best_count:
            best = report
            best_count = count
    return best


def score_insight_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Insight quality is cluster/angle/source diversity, not section count."""
    now_ms = int(now_ms or time.time() * 1000)
    latest = inputs.get("insight_latest", {}) if isinstance(inputs.get("insight_latest", {}), dict) else {}
    report = _pick_primary_report(inputs)
    stories = as_list(latest.get("stories") or report.get("stories"))

    cluster_count = int(to_number(report.get("clusterCount") or report.get("parentClusterCount") or report.get("storyCount") or len(stories), 0))
    source_group_count = int(to_number(report.get("sourceGroupCount") or report.get("sourceGroups") or len({source_group_of(s) for s in stories if isinstance(s, dict)}), 0))
    angle_diversity = to_number(report.get("angleDiversityScore") or report.get("angleDiversity") or 0, 0)
    if 0 < angle_diversity <= 1:
        angle_diversity *= 100
    angle_diversity = clamp(angle_diversity)

    angle_values = []
    for story in stories:
        if isinstance(story, dict):
            hints = story.get("angleHints") or []
            if hints and isinstance(hints, list) and isinstance(hints[0], dict):
                angle_values.append(str(hints[0].get("angle") or "base_report"))
            else:
                angle_values.append(str(story.get("angle") or "base_report"))
    base_report_ratio = angle_values.count("base_report") / max(1, len(angle_values)) if angle_values else 1.0
    fresh_count = sum(1 for s in stories if isinstance(s, dict) and freshness_bucket(s, now_ms) in {"future", "0_24h"})
    freshness = ratio_score(fresh_count, max(1, len(stories)))
    source_health_component = _average_source_health_for_items(stories, inputs.get("source_health", {}), now_ms)

    score = (
        ratio_score(cluster_count, 12) * 0.25
        + angle_diversity * 0.20
        + ratio_score(source_group_count, 8) * 0.20
        + freshness * 0.15
        + clamp(100 - base_report_ratio * 100) * 0.10
        + source_health_component * 0.10
    )

    reasons = []
    if base_report_ratio > 0.60:
        reasons.append(f"Insight is base_report-heavy: {base_report_ratio:.0%}")
    if source_group_count < 4:
        reasons.append(f"Insight source diversity is weak: {source_group_count} groups")
    if cluster_count < 6:
        reasons.append(f"Insight cluster/story volume is low: {cluster_count}")

    return normalize_quality_result(
        score=score,
        breakdown={
            "clusterCount": cluster_count,
            "angleDiversity": round(angle_diversity, 2),
            "sourceGroupCount": source_group_count,
            "freshness": round(freshness, 2),
            "baseReportRatio": round(base_report_ratio, 4),
            "sourceHealth": round(source_health_component, 2),
        },
        reasons=reasons,
        findings=["Improve angle classifier / source mix for Insight."] if reasons else [],
        extras={"destination": "insight", "destinationQualityScore": round(clamp(score), 2)},
    )


def _average_source_health_for_items(items: list[Any], source_health_doc: dict[str, Any], now_ms: int) -> float:
    health_map = (source_health_doc or {}).get("sources", source_health_doc or {})
    groups = {source_group_of(item) for item in items if isinstance(item, dict)}
    if not groups:
        return 50.0
    return statistics.mean(score_source_health(g, health_map.get(g, {}), now_ms)["qualityScore"] for g in groups)


def _events_from_payload(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    for key in ("items", "events", "stories", "cards", "data"):
        value = payload.get(key)
        if isinstance(value, list):
            return [x for x in value if isinstance(x, dict)]
        if isinstance(value, dict):
            return [x for x in value.values() if isinstance(x, dict)]
    return []


def _future_valid_ratio(items: list[dict[str, Any]], now_ms: int) -> float:
    valid = 0
    for item in items:
        raw = item.get("startDateMs") or item.get("startAt") or item.get("dateMs") or item.get("timestamp") or item.get("publishedAt")
        try:
            ts = int(raw)
        except Exception:
            continue
        if ts < 10_000_000_000:
            ts *= 1000
        if ts >= now_ms:
            valid += 1
    return valid / max(1, len(items))


def score_upahead_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Up Ahead quality is future-valid, action-valid event coverage."""
    now_ms = int(now_ms or time.time() * 1000)
    payload = inputs.get("up_ahead", {})
    gate = inputs.get("up_ahead_quality_gate", {})
    items = _events_from_payload(payload)

    visible_count = len(items)
    future_ratio = _future_valid_ratio(items, now_ms)
    actionable = sum(1 for x in items if x.get("action") or x.get("plannerEligible") or x.get("cta") or x.get("url"))
    categories = len({str(x.get("category") or x.get("type") or "unknown") for x in items})
    date_confident = sum(1 for x in items if x.get("dateConfidence", 1) not in {0, "low", "unknown"})

    score = (
        ratio_score(actionable, max(1, visible_count)) * 0.30
        + ratio_score(to_number(gate.get("plannerEligibleItems", actionable), actionable), max(1, visible_count)) * 0.20
        + ratio_score(categories, 5) * 0.20
        + ratio_score(date_confident, max(1, visible_count)) * 0.15
        + future_ratio * 100 * 0.15
    )

    reasons = []
    if visible_count == 0:
        reasons.append("Up Ahead has no visible items")
    if future_ratio < 0.80 and visible_count:
        reasons.append(f"Up Ahead has expired/uncertain visible items: future-valid ratio {future_ratio:.0%}")

    return normalize_quality_result(
        score=score,
        breakdown={
            "visibleItems": visible_count,
            "actionableItems": actionable,
            "categoryCoverage": categories,
            "dateConfidentItems": date_confident,
            "futureValidRatio": round(future_ratio, 4),
        },
        reasons=reasons,
        findings=["Remove expired items and improve planner eligibility."] if reasons else [],
        extras={"destination": "upAhead", "destinationQualityScore": round(clamp(score), 2)},
    )


def score_planner_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Planner quality is item eligibility/actionability, not news freshness."""
    payload = inputs.get("planner_latest", {})
    gate = inputs.get("planner_quality_gate", {})
    items = _events_from_payload(payload)
    total = len(items)
    eligible = sum(1 for x in items if x.get("eligible", x.get("plannerEligible", True)))
    actionable = sum(1 for x in items if x.get("action") or x.get("url") or x.get("title"))
    categorized = sum(1 for x in items if x.get("category") or x.get("type"))

    score = (
        ratio_score(eligible, max(1, total)) * 0.35
        + ratio_score(actionable, max(1, total)) * 0.30
        + ratio_score(categorized, max(1, total)) * 0.20
        + ratio_score(to_number(gate.get("validItemCount", total), total), max(1, total)) * 0.15
    )

    reasons = []
    if total == 0:
        reasons.append("Planner has no items")
    if total and eligible / total < 0.70:
        reasons.append("Planner eligibility ratio is weak")

    return normalize_quality_result(
        score=score,
        breakdown={
            "itemCount": total,
            "eligibleItems": eligible,
            "actionableItems": actionable,
            "categorizedItems": categorized,
            "gateValidItemCount": gate.get("validItemCount"),
        },
        reasons=reasons,
        extras={"destination": "planner", "destinationQualityScore": round(clamp(score), 2)},
    )


def score_weather_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Weather quality is required city coverage and forecast validity."""
    now_ms = int(now_ms or time.time() * 1000)
    snapshot = inputs.get("weather_snapshot", {}) if isinstance(inputs.get("weather_snapshot", {}), dict) else {}
    required = [str(x).lower() for x in snapshot.get("requiredCities", ["muscat", "chennai", "trichy"])]
    cities_obj = snapshot.get("cities") or snapshot.get("locations") or snapshot.get("forecasts") or {}
    if isinstance(cities_obj, list):
        city_keys = {str(x.get("city") or x.get("name") or "").lower() for x in cities_obj if isinstance(x, dict)}
        city_rows = cities_obj
    elif isinstance(cities_obj, dict):
        city_keys = {str(k).lower() for k in cities_obj.keys()}
        city_rows = [x for x in cities_obj.values() if isinstance(x, dict)]
    else:
        city_keys = set()
        city_rows = []

    covered = sum(1 for city in required if any(city in key for key in city_keys))
    provider_ok = 100 if snapshot.get("provider") or snapshot.get("source") or city_rows else 30
    generated_at = int(to_number(snapshot.get("generatedAt") or snapshot.get("fetchedAt"), 0))
    fresh = 100 if generated_at and now_ms - generated_at <= 6 * HOUR_MS else 50 if generated_at else 20
    alert_complete = 100 if snapshot.get("alerts") is not None or snapshot.get("risk") is not None else 70

    score = (
        ratio_score(covered, max(1, len(required))) * 0.40
        + fresh * 0.25
        + provider_ok * 0.20
        + alert_complete * 0.15
    )

    reasons = []
    missing = [city for city in required if not any(city in key for key in city_keys)]
    if missing:
        reasons.append("Weather missing required cities: " + ", ".join(missing))

    return normalize_quality_result(
        score=score,
        breakdown={
            "requiredCities": required,
            "coveredCities": covered,
            "missingCities": missing,
            "forecastFreshness": fresh,
            "providerHealth": provider_ok,
            "alertCompleteness": alert_complete,
        },
        reasons=reasons,
        extras={"destination": "weather", "destinationQualityScore": round(clamp(score), 2)},
    )


def score_market_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Market quality is required financial snapshot validity."""
    now_ms = int(now_ms or time.time() * 1000)
    snapshot = inputs.get("market_snapshot", {}) if isinstance(inputs.get("market_snapshot", {}), dict) else {}
    required = snapshot.get("requiredIndices", ["NIFTY", "SENSEX"])
    indices = snapshot.get("indices") or snapshot.get("markets") or snapshot.get("items") or []
    if isinstance(indices, dict):
        index_keys = {str(k).upper() for k in indices.keys()}
        index_count = len(indices)
    else:
        index_keys = {str(x.get("symbol") or x.get("name") or "").upper() for x in as_list(indices) if isinstance(x, dict)}
        index_count = len(index_keys)
    covered = sum(1 for r in required if any(str(r).upper() in k for k in index_keys))
    generated_at = int(to_number(snapshot.get("generatedAt") or snapshot.get("fetchedAt"), 0))
    fresh = 100 if generated_at and now_ms - generated_at <= 6 * HOUR_MS else 55 if generated_at else 20
    news = as_list(snapshot.get("news") or snapshot.get("marketNews"))

    score = (
        ratio_score(covered, max(1, len(required))) * 0.30
        + fresh * 0.25
        + ratio_score(len(news), 5) * 0.20
        + (100 if snapshot.get("provider") or snapshot.get("source") or index_count else 40) * 0.15
        + ratio_score(len({source_group_of(n) for n in news if isinstance(n, dict)}), 3) * 0.10
    )

    reasons = []
    if covered < len(required):
        reasons.append("Market missing required index coverage")

    return normalize_quality_result(
        score=score,
        breakdown={
            "requiredIndices": required,
            "coveredIndices": covered,
            "indexCount": index_count,
            "snapshotFreshness": fresh,
            "marketNewsCount": len(news),
        },
        reasons=reasons,
        extras={"destination": "market", "destinationQualityScore": round(clamp(score), 2)},
    )


def score_buzz_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Buzz is derived from technology + entertainment + topStories section health."""
    now_ms = int(now_ms or time.time() * 1000)
    sections = _extract_sections(inputs.get("sections_latest", {}))
    source_health = (inputs.get("source_health", {}) or {}).get("sources", inputs.get("source_health", {}))
    relevant = {k: sections.get(k, []) for k in ("technology", "entertainment", "topStories")}
    rows = {
        k: score_section_quality(k, v, source_health, now_ms)
        for k, v in relevant.items()
    }
    tech_ent_health = statistics.mean(rows[k]["qualityScore"] for k in ("technology", "entertainment"))
    freshness = statistics.mean(row["scoreBreakdown"]["freshness"] for row in rows.values())
    trend_diversity = ratio_score(
        sum(row["scoreBreakdown"]["sourceGroupCount"] for row in rows.values()),
        9,
    )
    source_diversity = trend_diversity

    score = tech_ent_health * 0.40 + freshness * 0.25 + trend_diversity * 0.20 + source_diversity * 0.15
    reasons = [f"{k} weak for Buzz" for k, row in rows.items() if row["qualityScore"] < 60]

    return normalize_quality_result(
        score=score,
        breakdown={
            "derivedSections": {k: row["qualityScore"] for k, row in rows.items()},
            "techEntertainmentHealth": round(tech_ent_health, 2),
            "freshness": round(freshness, 2),
            "trendDiversity": round(trend_diversity, 2),
            "sourceDiversity": round(source_diversity, 2),
        },
        reasons=reasons,
        extras={"destination": "buzz", "destinationQualityScore": round(clamp(score), 2)},
    )


def score_newspaper_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Newspaper quality is edition/date/publication coverage."""
    payload = inputs.get("newspaper", inputs.get("epaper_data", {}))
    items = _events_from_payload(payload)
    publication_count = len({str(x.get("publication") or x.get("source") or "unknown") for x in items})
    dated = sum(1 for x in items if x.get("date") or x.get("publishedAt") or x.get("dateMs"))
    with_url = sum(1 for x in items if x.get("url") or x.get("pdf") or x.get("link"))

    score = ratio_score(len(items), 8) * 0.35 + ratio_score(publication_count, 4) * 0.25 + ratio_score(dated, max(1, len(items))) * 0.20 + ratio_score(with_url, max(1, len(items))) * 0.20
    reasons = []
    if not items:
        reasons.append("Newspaper has no editions/cards")

    return normalize_quality_result(
        score=score,
        breakdown={
            "editionCount": len(items),
            "publicationCount": publication_count,
            "datedItems": dated,
            "linkedItems": with_url,
        },
        reasons=reasons,
        extras={"destination": "newspaper", "destinationQualityScore": round(clamp(score), 2)},
    )


def score_following_destination(inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Following quality is followed-topic coverage and freshness."""
    now_ms = int(now_ms or time.time() * 1000)
    payload = inputs.get("following", {})
    topics = payload.get("topics", payload.get("followedTopics", [])) if isinstance(payload, dict) else []
    topic_rows = as_list(topics)
    items = []
    for topic in topic_rows:
        if isinstance(topic, dict):
            items.extend(as_list(topic.get("stories") or topic.get("items")))
    if not items and isinstance(payload, dict):
        items = _events_from_payload(payload)

    topic_count = len(topic_rows)
    topics_with_items = sum(1 for t in topic_rows if isinstance(t, dict) and as_list(t.get("stories") or t.get("items")))
    fresh = sum(1 for item in items if isinstance(item, dict) and freshness_bucket(item, now_ms) in {"future", "0_24h"})
    source_groups = len({source_group_of(item) for item in items if isinstance(item, dict)})

    score = (
        ratio_score(topics_with_items, max(1, topic_count)) * 0.35
        + ratio_score(fresh, max(1, len(items))) * 0.30
        + ratio_score(source_groups, max(3, topic_count)) * 0.20
        + ratio_score(len(items), max(5, topic_count * 3)) * 0.15
    )

    reasons = []
    if topic_count and topics_with_items < topic_count:
        reasons.append(f"Following has dead/thin topics: {topic_count - topics_with_items} without items")
    if topic_count == 0:
        reasons.append("Following has no configured topics")

    return normalize_quality_result(
        score=score,
        breakdown={
            "topicCount": topic_count,
            "topicsWithItems": topics_with_items,
            "storyCount": len(items),
            "freshStoryCount": fresh,
            "sourceGroupCount": source_groups,
        },
        reasons=reasons,
        extras={"destination": "following", "destinationQualityScore": round(clamp(score), 2)},
    )


DESTINATION_SCORERS: dict[str, Callable[[dict[str, Any], int | None], dict[str, Any]]] = {
    "main": score_main_destination,
    "insight": score_insight_destination,
    "upAhead": score_upahead_destination,
    "planner": score_planner_destination,
    "weather": score_weather_destination,
    "market": score_market_destination,
    "buzz": score_buzz_destination,
    "newspaper": score_newspaper_destination,
    "following": score_following_destination,
}


def score_destination_quality(destination: str, inputs: dict[str, Any], now_ms: int | None = None) -> dict[str, Any]:
    """Router only: do not put one-size-fits-all scoring logic here."""
    if destination not in DESTINATION_SCORERS:
        return normalize_quality_result(
            score=0,
            hard_errors=[f"Unknown destination scorer: {destination}"],
            breakdown={},
            extras={"destination": destination, "destinationQualityScore": 0},
        )
    return DESTINATION_SCORERS[destination](inputs, now_ms)


def build_comparison_statements(current: dict[str, Any], history: list[dict[str, Any]]) -> list[str]:
    statements: list[str] = []
    if not history:
        return statements

    recent = history[-5:]

    def median_for(path: tuple[str, ...]) -> float | None:
        values = []
        for row in recent:
            value: Any = row
            for key in path:
                if not isinstance(value, dict) or key not in value:
                    value = None
                    break
                value = value[key]
            if isinstance(value, (int, float)):
                values.append(float(value))
        return statistics.median(values) if values else None

    section_counts = current.get("sectionStoryCounts", {})
    for section, count in section_counts.items():
        med = median_for(("sectionStoryCounts", section))
        if med and count < med * 0.75:
            pct = round((count - med) / med * 100)
            statements.append(f"{section} now returns {count} stories, down from recent median {med:g} ({pct}%).")

    stale_ratios = current.get("sectionStaleRatios", {})
    for section, ratio in stale_ratios.items():
        med = median_for(("sectionStaleRatios", section))
        if ratio > 0.50 and (med is None or ratio > med + 0.20):
            if med is None:
                statements.append(f"{section} is stale now: {ratio:.0%} stories are 24h+/unknown.")
            else:
                statements.append(f"{section} is stale now: {ratio:.0%} stories are 24h+/unknown, recent median {med:.0%}.")

    source_counts = current.get("sectionSourceGroupCounts", {})
    for section, count in source_counts.items():
        med = median_for(("sectionSourceGroupCounts", section))
        if med is not None and count >= med + 2:
            statements.append(f"{section} source diversity improved: {count} source groups now, recent median {med:g}.")

    for source in current.get("degradedSources", []):
        statements.append(f"{source} appears degraded or obsolete in the current run.")

    return statements


def assert_quality_contract(result: dict[str, Any]) -> None:
    missing = QUALITY_CONTRACT_KEYS - set(result)
    if missing:
        raise AssertionError(f"Quality result missing contract keys: {sorted(missing)}")
