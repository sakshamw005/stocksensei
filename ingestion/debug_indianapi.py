"""
Run this FIRST, before run_pipeline.py, to confirm two things:
1. The auth header name is correct (X-Api-Key is IndianAPI's documented
   convention, but confirm against your dashboard if this fails).
2. The actual key names inside keyMetrics/financials, so fetch_fundamentals.py
   can be corrected if the field names differ from what's guessed there.
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["INDIANAPI_KEY"]
resp = requests.get(
    "https://stock.indianapi.in/stock",
    headers={"X-Api-Key": api_key},
    params={"name": "Reliance"},
    timeout=15,
)

print("Status:", resp.status_code)
data = resp.json()

print("\nTop-level keys:", list(data.keys()))

print("\n--- currentPrice ---")
print(json.dumps(data.get("currentPrice"), indent=2))

print("\n--- keyMetrics ---")
print(json.dumps(data.get("keyMetrics"), indent=2))

print("\n--- financials (first 3000 chars) ---")
print(json.dumps(data.get("financials"), indent=2)[:3000])

print("\n--- stockTechnicalData ---")
print(json.dumps(data.get("stockTechnicalData"), indent=2)[:1500])