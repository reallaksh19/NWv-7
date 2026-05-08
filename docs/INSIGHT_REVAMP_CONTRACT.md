# Insight Revamp Contract

This document freezes the contracts and boundaries for the Insight revamp.

## Required Schemas
All generated JSON files must comply with their respective schemas in `public/newsdata/schema/`.

1. `insight_digest.json`
   - schemaVersion: "2.0.0"
   - sourceMode: "github-workflow" | "browser-pipeline" | "cached" | "stale" | "fallback" | "mock"
2. `top_story_anchors.json`
   - schemaVersion: "1.0.0"
3. `insight_diagnostics.json`
4. `insight_source_health.json`

## Policies
- **Top Story Anchors:** Do not use user-visible filtered Top Stories, read suppression, or view count suppression.
