"""
Daily Tier 1 ingestion job.

Run manually:   python run_pipeline.py
Run on a schedule: see .github/workflows/daily_ingestion.yml

This script only writes to Supabase. It has no knowledge of backend serverless deployment —
The backend functions read whatever this job leaves in the tables.
"""

import sys
import time

from config import TIER1_COMPANIES, MAX_HEADLINES_PER_COMPANY, NEWS_WINDOW_DAYS
from supabase_client import get_client
from fetch_fundamentals import fetch_fundamentals, compute_industry_pe
from fetch_news import fetch_headlines
from sentiment import score_headlines


def upsert_companies(sb):
    rows = [
        {"ticker": t, "name": name, "sector": sector, "exchange": exch, "tier": 1}
        for t, name, sector, exch in TIER1_COMPANIES
    ]
    sb.table("companies").upsert(rows, on_conflict="ticker").execute()
    print(f"companies: upserted {len(rows)} rows")


def run_fundamentals(sb):
    sector_by_ticker = {t: sector for t, _, sector, _ in TIER1_COMPANIES}
    rows = []

    for ticker, name, sector, exchange in TIER1_COMPANIES:
        data = fetch_fundamentals(ticker, exchange, search_name=name)
        if data is None:
            print(f"  skip (no data): {ticker}")
            continue
        rows.append(data)
        time.sleep(1.0)  # IndianAPI has its own documented rate limit — check your plan's limit

    rows = compute_industry_pe(rows, sector_by_ticker)

    if rows:
        sb.table("fundamentals").upsert(rows, on_conflict="ticker,as_of").execute()
    print(f"fundamentals: upserted {len(rows)} rows")


def run_sentiment(sb):
    rows = []
    for ticker, name, sector, exchange in TIER1_COMPANIES:
        headlines = fetch_headlines(name, max_items=MAX_HEADLINES_PER_COMPANY)
        scored = score_headlines(headlines)
        if scored["sentiment_label"] is None:
            print(f"  skip (no headlines): {ticker}")
            continue

        rows.append({
            "ticker": ticker,
            "sentiment_label": scored["sentiment_label"],
            "article_count": scored["article_count"],
            "window_days": NEWS_WINDOW_DAYS,
            "top_headlines": scored["top_headlines"],
            "as_of": __import__("datetime").date.today().isoformat(),
        })

    if rows:
        sb.table("news_sentiment").upsert(rows, on_conflict="ticker,as_of").execute()
    print(f"news_sentiment: upserted {len(rows)} rows")


def main():
    sb = get_client()
    print("Starting Tier 1 ingestion run...")
    upsert_companies(sb)
    run_fundamentals(sb)
    try:
        run_sentiment(sb)
    except Exception as e:
        print(f"news_sentiment step failed, skipping for now: {e!r}")
        print("(fundamentals are already saved — fix sentiment separately, doesn't block the app)")
    print("Done.")


if __name__ == "__main__":
    try:
        main()
    except KeyError as e:
        print(f"Missing environment variable: {e}. Copy .env.example to .env and fill it in.")
        sys.exit(1)
