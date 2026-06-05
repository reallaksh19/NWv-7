import json
from pathlib import Path

import build_quality_rankings as builder


NOW = 1_780_000_000_000


def write(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload), encoding="utf-8")


def test_builder_writes_rankings_and_history(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    write(Path("public/newsdata/source_health.json"), {
        "sources": {
            "financial_express": {
                "ok": False,
                "items": 0,
                "zeroItemRuns": 20,
                "lastError": "403 Client Error",
            },
            "gadgets360": {
                "ok": True,
                "items": 20,
                "lastNonZeroSuccess": NOW,
                "tier": "A",
            },
        }
    })
    write(Path("public/newsdata/sections_latest.json"), {
        "sections": {
            "technology": [
                {"id": f"t{i}", "title": f"Tech {i}", "sourceGroup": "gadgets360", "publishedAt": NOW - 1_000}
                for i in range(12)
            ],
            "business": [
                {"id": "b0", "title": "Biz", "sourceGroup": "financial_express", "publishedAt": NOW - 1_000}
            ],
        }
    })
    write(Path("public/newsdata/insight_latest.json"), {
        "stories": [
            {"id": f"i{i}", "sourceGroup": "gadgets360", "publishedAt": NOW - 1_000, "angleHints": [{"angle": "analysis"}]}
            for i in range(8)
        ]
    })
    write(Path("public/newsdata/insight_quality_report.json"), {
        "clusterCount": 8,
        "sourceGroupCount": 2,
        "angleDiversityScore": 70,
    })
    write(Path("public/data/weather_snapshot.json"), {
        "generatedAt": NOW,
        "provider": "open-meteo",
        "cities": {"Muscat": {}, "Chennai": {}, "Trichy": {}},
        "alerts": [],
    })
    write(Path("public/data/market_snapshot.json"), {
        "generatedAt": NOW,
        "provider": "test",
        "indices": {"NIFTY": {}, "SENSEX": {}},
        "news": [],
    })

    report = builder.build_quality_rankings(NOW)

    assert Path("public/newsdata/quality_rankings.json").exists()
    assert Path("public/newsdata/quality_rankings.md").exists()
    assert Path("public/newsdata/quality_rankings_history.json").exists()
    assert set(report["destinations"]) >= {"main", "insight", "upAhead", "planner", "weather", "market", "buzz", "newspaper", "following"}
    assert report["sources"]["financial_express"]["obsoleteCandidate"] is True
    assert "sectionPassRate" in report["destinations"]["main"]["scoreBreakdown"]
    assert "baseReportRatio" in report["destinations"]["insight"]["scoreBreakdown"]
