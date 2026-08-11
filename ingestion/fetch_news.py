"""
News via Google News RSS (free, no API key). Good enough for a portfolio
project; swap in NewsAPI or a paid provider if you need broader coverage
or fewer duplicate/low-quality sources later.
"""

import datetime as dt
import feedparser
from urllib.parse import quote


def fetch_headlines(company_name: str, max_items: int = 8) -> list[dict]:
    query = quote(f"{company_name} stock")
    url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"

    feed = feedparser.parse(url)
    headlines = []
    for entry in feed.entries[:max_items]:
        headlines.append({
            "title": entry.get("title", "").strip(),
            "published": entry.get("published", ""),
        })
    return headlines
