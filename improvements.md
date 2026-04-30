# Suggested Improvements for Top Stories Quality Gate

1. **Dynamic Quality Thresholds:** Instead of a hardcoded `MIN_IMPACT = 2.5`, dynamically adjust the threshold based on the daily volume of high-impact news (e.g., lower it to 2.0 on slow news days to ensure sufficient coverage).
2. **Enhanced Classification Heuristics:** Replace simple keyword matching in `classifySection` with the lightweight TF-IDF categorization already available in the app's Insight pipeline to reduce misclassification.
3. **Feed-specific Weight Modifiers:** Apply individual reliability/weight modifiers to distinct RSS feeds prior to the impact score cut-off, allowing inherently authoritative breaking news feeds to consistently surface above entertainment feeds.
