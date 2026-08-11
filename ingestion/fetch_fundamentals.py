"""
Fundamentals via IndianAPI (https://indianapi.in/indian-stock-market).

Response shape (confirmed against a real call, not just the docs):
keyMetrics is a dict of categories (valuation, growth, persharedata,
mgmtEffectiveness, financialstrength, incomeStatement, priceandVolume),
each a list of {displayName, key, value} objects. IndianAPI's own `key`
field has inconsistent spacing/typos (e.g. a literal space inside one key,
a stray trailing paren on others), so we match on `displayName` text
instead of `key` — much less fragile against their data-quality quirks.
"""

from __future__ import annotations

import os
import time
import datetime as dt
import requests

BASE_URL = "https://stock.indianapi.in"


def _headers():
    return {"X-Api-Key": os.environ["INDIANAPI_KEY"]}


def _get_with_retry(params: dict, retries: int = 3, base_delay: float = 5.0):
    for attempt in range(retries):
        resp = requests.get(f"{BASE_URL}/stock", headers=_headers(), params=params, timeout=15)
        if resp.status_code == 429:
            wait = base_delay * (2 ** attempt)
            print(f"    rate limited, waiting {wait:.0f}s (attempt {attempt + 1}/{retries})")
            time.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    return None


def _find(category: list | None, display_contains: str) -> float | None:
    """Case-insensitive substring match on displayName, since IndianAPI's
    own `key` field is inconsistently formatted across entries."""
    for item in category or []:
        name = (item.get("displayName") or "")
        if display_contains.lower() in name.lower():
            try:
                return float(item.get("value"))
            except (TypeError, ValueError):
                return None
    return None


def fetch_fundamentals(ticker: str, exchange: str, search_name: str | None = None) -> dict | None:
    query = search_name or ticker
    try:
        data = _get_with_retry({"name": query})
    except Exception as e:
        print(f"    {ticker}: request failed — {e!r}")
        return None

    if not data or "companyName" not in data:
        print(f"    {ticker}: no match returned")
        return None

    price_block = data.get("currentPrice", {}) or {}
    price = price_block.get("NSE") or price_block.get("BSE")
    try:
        price = float(price) if price is not None else None
    except (TypeError, ValueError):
        price = None

    km = data.get("keyMetrics", {}) or {}
    valuation = km.get("valuation")
    growth = km.get("growth")
    per_share = km.get("persharedata")
    mgmt = km.get("mgmtEffectiveness")
    strength = km.get("financialstrength")
    income = km.get("incomeStatement")
    price_vol = km.get("priceandVolume")

    return {
        "ticker": ticker,
        "price": price,
        # Market Cap as returned is in the same units as Reliance's real cap
        # (~18 lakh crore) — i.e. INR crore. Confirm this holds for smaller
        # companies too before trusting it at scale.
        "market_cap": _find(price_vol, "Market Cap"),
        "face_value": None,  # not present in this API's response; maintain separately
        "book_value": _find(per_share, "Book value per share - most recent fiscal year"),
        "eps": _find(per_share, "EPS including extraordinary items - trailing 12 month"),
        "pe_ratio": _find(valuation, "P/E including extraordinary items - TTM"),
        "industry_pe": None,  # filled in by compute_industry_pe() after a full batch run
        "pb_ratio": _find(valuation, "Price to Book - most recent fiscal year"),
        # IndianAPI's own displayName has a typo: "EBITD", not "EBITDA"
        "ebitda": _find(income, "EBITD - trailing 12 month"),
        # No direct "profit growth" field; EPS change YoY (TTM over TTM) is
        # the closest available proxy for per-share profit growth.
        "profit_growth_yoy": _find(growth, "EPS Change %, TTM over TTM"),
        # True QoQ revenue growth isn't in keyMetrics (only YoY-by-quarter
        # is). Left null for now — would need parsing the separate
        # `financials` quarterly array to compute properly. Flagging as a
        # follow-up rather than guessing.
        "revenue_growth_qoq": None,
        "debt_to_equity": _find(strength, "Total debt/total equity - most recent fiscal year"),
        "roe": _find(mgmt, "Return on average equity - most recent fiscal year"),
        "dividend_yield": _find(valuation, "Current Dividend Yield - Common Stock Primary Issue, LTM"),
        "as_of": dt.date.today().isoformat(),
    }


def compute_industry_pe(rows: list[dict], sector_by_ticker: dict[str, str]) -> list[dict]:
    """Unchanged — self-computed sector average P/E across this batch."""
    by_sector: dict[str, list[float]] = {}
    for row in rows:
        sector = sector_by_ticker.get(row["ticker"])
        pe = row.get("pe_ratio")
        if sector and pe:
            by_sector.setdefault(sector, []).append(pe)

    sector_avg = {s: round(sum(v) / len(v), 2) for s, v in by_sector.items() if v}

    for row in rows:
        sector = sector_by_ticker.get(row["ticker"])
        row["industry_pe"] = sector_avg.get(sector)
    return rows
