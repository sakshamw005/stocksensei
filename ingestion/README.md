# Stocksensei — Tier 1 Ingestion Job

Fetches fundamentals (IndianAPI, free tier, documented rate limits) and
news sentiment (Google News RSS + FinBERT, both free) for the Tier 1
company list in `config.py`, and writes the results into Supabase. No
model training — FinBERT is a pretrained financial sentiment model, run
for inference only.

## Why IndianAPI instead of yfinance

`yfinance` scrapes an unofficial Yahoo endpoint that has become unreliable
due to Yahoo's anti-bot rate limiting — some networks get blocked for
extended periods with no clear reset time. IndianAPI (indianapi.in) is a
documented, purpose-built NSE/BSE API with a free tier and predictable
limits, so it's a more dependable foundation for a scheduled job.

## Setup

1. Sign up at https://indianapi.in, subscribe to the free plan, and grab
   your API key from the dashboard.
2. ```
   cd ingestion
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env   # fill in Supabase URL/key AND your INDIANAPI_KEY
   ```
3. If your Supabase tables were created before this job existed, run
   `migration_add_constraints.sql` once in the Supabase SQL editor —
   the pipeline's upserts need a unique (ticker, as_of) constraint.

## Run the debug script first — do this before run_pipeline.py

```
python debug_indianapi.py
```

This confirms your API key/header works and prints the real JSON shape
IndianAPI returns. The field-name guesses in `fetch_fundamentals.py`
(`keyMetrics.marketCap`, `keyMetrics.peRatio`, etc.) are based on partial
public docs — compare them against what you actually see printed, and
adjust the `.get()` calls in `fetch_fundamentals.py` if any come back
`None` that shouldn't.

## Run once, manually

```
python run_pipeline.py
```

First run will download the FinBERT model weights (~450MB) — that's a
one-time download, cached locally after that.

## Run on a schedule

`.github/workflows/daily_ingestion.yml` runs this daily via GitHub Actions.
To enable it:
1. Push this `ingestion/` folder into your repo.
2. In the repo's Settings → Secrets and variables → Actions, add
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `INDIANAPI_KEY`.
3. The workflow runs automatically at 07:00 IST daily, or trigger it
   manually from the Actions tab ("Run workflow").

## What this does not do

- Does not touch Tier 2 or Tier 3 companies — this seed list is Tier 1
  only. Expand `TIER1_COMPANIES` in `config.py` from NSE's official
  master list to grow coverage.
- Does not populate `etfs` or `category_sentiment` — same pattern, next
  phase.
- Does not call any LLM — that happens in the backend's `generate-analysis`
  function, at request time, using whatever this job has already
  written to Supabase.
