# Odds Data Pipeline Demo

Small Node.js demo that shows how changing odds data can be normalized, deduped and written as snapshots.

It uses mock data only. There are no real endpoints, bookmaker names, private headers, cookies or source-specific request details in this repo.

## What it shows

- normalize different provider payloads into one shape
- handle decimal, fractional and string odds
- keep bookmaker/source data separate from normalized market keys
- detect changed prices between snapshots
- retry flaky sources
- export current snapshot and change log as JSON

## Run

```bash
npm run once
```

Output goes to `out/`.

## Why this exists

Real odds scraping work usually cannot be public because the valuable part is the source-specific extraction layer. This repo keeps that layer mocked and shows the data pipeline around it: parse, normalize, compare, and persist.
