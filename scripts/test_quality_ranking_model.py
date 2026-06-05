import time

from quality_ranking_model import (
    QUALITY_CONTRACT_KEYS,
    score_destination_quality,
    score_insight_destination,
    score_main_destination,
    score_source_health,
)


NOW = 1_780_000_000_000


def assert_contract(result):
    assert QUALITY_CONTRACT_KEYS <= set(result)
    assert 0 <= result["qualityScore"] <= 100
    assert result["qualityGrade"] in {"A", "B", "C", "D", "F"}
    assert result["qualityStatus"] in {"PASS", "WARN", "FAIL"}


def story(i, section="technology", source="gadgets360", age_hours=2, **extra):
    return {
        "id": f"{section}-{source}-{i}",
        "title": f"Story {i}",
        "sourceGroup": source,
        "publishedAt": NOW - age_hours * 3600 * 1000,
        **extra,
    }


def test_source_health_identifies_broken_obsolete_candidate():
    result = score_source_health(
        "financial_express",
        {
            "ok": False,
            "items": 0,
            "zeroItemRuns": 20,
            "lastError": "403 Client Error",
            "feedUrl": "https://www.financialexpress.com/feed/",
        },
        NOW,
    )
    assert_contract(result)
    assert result["qualityScore"] < 40
    assert result["obsoleteCandidate"] is True
    assert "financial_express" in result["diagnosticReasons"][0]


def test_each_destination_uses_same_contract_but_different_breakdown():
    sections_latest = {
        "sections": {
            "technology": [story(i, "technology", "gadgets360") for i in range(12)],
            "entertainment": [story(i, "entertainment", "google_news", backfilledFrom="topStories") for i in range(5)],
            "topStories": [story(i, "topStories", "bbc") for i in range(12)],
        }
    }
    source_health = {
        "sources": {
            "gadgets360": {"ok": True, "items": 20, "lastNonZeroSuccess": NOW, "tier": "A"},
            "google_news": {"ok": True, "items": 15, "lastNonZeroSuccess": NOW, "feedUrl": "https://news.google.com/rss"},
            "bbc": {"ok": True, "items": 20, "lastNonZeroSuccess": NOW, "tier": "A"},
        }
    }
    inputs = {"sections_latest": sections_latest, "source_health": source_health}

    main = score_main_destination(inputs, NOW)
    insight = score_insight_destination(
        {
            "insight_latest": {
                "stories": [
                    {**story(i, "insight", "bbc"), "angleHints": [{"angle": "base_report"} if i < 8 else {"angle": "analysis"}]}
                    for i in range(10)
                ]
            },
            "insight_quality_report": {"clusterCount": 10, "sourceGroupCount": 2, "angleDiversityScore": 35},
            "source_health": source_health,
        },
        NOW,
    )

    assert_contract(main)
    assert_contract(insight)
    assert "sectionPassRate" in main["scoreBreakdown"]
    assert "baseReportRatio" in insight["scoreBreakdown"]
    assert main["scoreBreakdown"] != insight["scoreBreakdown"]


def test_router_dispatches_tab_specific_scorer_not_generic_formula():
    upahead = score_destination_quality(
        "upAhead",
        {
            "up_ahead": {
                "items": [
                    {"title": "Event", "startDateMs": NOW + 3600_000, "category": "festival", "url": "https://example.com"}
                ]
            },
            "up_ahead_quality_gate": {"plannerEligibleItems": 1},
        },
        NOW,
    )
    assert_contract(upahead)
    assert upahead["destination"] == "upAhead"
    assert "futureValidRatio" in upahead["scoreBreakdown"]
    assert "sectionPassRate" not in upahead["scoreBreakdown"]


def test_weather_is_not_scored_like_news():
    weather = score_destination_quality(
        "weather",
        {
            "weather_snapshot": {
                "generatedAt": NOW,
                "provider": "open-meteo",
                "cities": {
                    "Muscat": {},
                    "Chennai": {},
                    "Trichy": {},
                },
                "alerts": [],
            }
        },
        NOW,
    )
    assert_contract(weather)
    assert weather["qualityScore"] >= 90
    assert "coveredCities" in weather["scoreBreakdown"]
    assert "sourceGroupCount" not in weather["scoreBreakdown"]


def test_unknown_destination_fails_cleanly():
    result = score_destination_quality("unknownTab", {}, NOW)
    assert_contract(result)
    assert result["qualityStatus"] == "FAIL"
