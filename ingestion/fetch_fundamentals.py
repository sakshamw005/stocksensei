"""
Fundamentals fetcher using Twelve Data.

This is a minimal, best-effort mapping used by the daily ingestion pipeline
to populate the `fundamentals` table. It intentionally avoids fabricating
an `industry_pe` (left as None) — the app no longer computes sector
averages in-batch; industry-level commentary is handled by the analysis LLM.
"""

from __future__ import annotations

import os
import datetime as dt
import requests

TWELVE_KEY = os.environ.get("TWELVE_DATA_API_KEY")
BASE = "https://api.twelvedata.com"


def _get(path: str, params: dict | None = None, timeout: int = 15):
    params = params or {}
    params["apikey"] = TWELVE_KEY
    resp = requests.get(f"{BASE}/{path}", params=params, timeout=timeout)
    resp.raise_for_status()
    return resp.json()


def fetch_fundamentals(ticker: str, exchange: str, search_name: str | None = None) -> dict | None:
    symbol = ticker
    try:
        data = _get("fundamentals", {"symbol": symbol})
    except Exception as e:
        print(f"    {ticker}: Twelve Data fundamentals request failed — {e!r}")
        return None

    if not data:
        print(f"    {ticker}: no fundamentals returned")
        return None

    # map common fields where available; Twelve Data field names vary by plan
    market_cap = data.get("market_cap") or data.get("marketCapitalization")
    pe = data.get("pe_ratio") or data.get("pe") or data.get("pe_ttm")
    pb = data.get("pb_ratio") or data.get("pb")
    eps = data.get("eps") or data.get("eps_basic")
    book = data.get("book_value") or data.get("bookValue")
    ebitda = data.get("ebitda")

    price = None
    try:
        q = _get("quote", {"symbol": symbol})
        price = q.get("price") or q.get("close")
        try:
            price = float(price) if price is not None else None
        except Exception:
            price = None
    except Exception:
        price = None

    return {
        "ticker": ticker,
        "price": price,
        "market_cap": market_cap,
        "face_value": None,
        "book_value": book,
        "eps": eps,
        "pe_ratio": pe,
        "industry_pe": None,
        "pb_ratio": pb,
        "ebitda": ebitda,
        "profit_growth_yoy": None,
        "revenue_growth_qoq": None,
        "debt_to_equity": None,
        "roe": None,
        "dividend_yield": None,
        "as_of": dt.date.today().isoformat(),
    }


def compute_industry_pe(rows: list[dict], sector_by_ticker: dict[str, str]) -> list[dict]:
    # No-op: industry_pe remains None with Twelve Data live fetches.
    return rows
