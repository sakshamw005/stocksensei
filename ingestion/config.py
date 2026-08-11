"""
Tier 1 seed universe. This is a starting set of ~30 large, actively-traded
NSE names so the pipeline is testable end to end. Expand this by loading
NSE's official EQUITY_L.csv master list and tagging the top few hundred by
market cap as tier=1, the rest as tier=2 (tier=3 is handled on-demand by
the app backend, not by this job).

Fields: (ticker, name, sector, exchange)
"""

TIER1_COMPANIES = [
    ("RELIANCE", "Reliance Industries", "Energy", "NSE"),
    ("TCS", "Tata Consultancy Services", "IT", "NSE"),
    ("HDFCBANK", "HDFC Bank", "Banking", "NSE"),
    ("INFY", "Infosys", "IT", "NSE"),
    ("ICICIBANK", "ICICI Bank", "Banking", "NSE"),
    ("HINDUNILVR", "Hindustan Unilever", "FMCG", "NSE"),
    ("ITC", "ITC Limited", "FMCG", "NSE"),
    ("SBIN", "State Bank of India", "Banking", "NSE"),
    ("BHARTIARTL", "Bharti Airtel", "Telecom", "NSE"),
    ("KOTAKBANK", "Kotak Mahindra Bank", "Banking", "NSE"),
    ("LT", "Larsen & Toubro", "Infrastructure", "NSE"),
    ("AXISBANK", "Axis Bank", "Banking", "NSE"),
    ("BAJFINANCE", "Bajaj Finance", "Financial Services", "NSE"),
    ("ASIANPAINT", "Asian Paints", "FMCG", "NSE"),
    ("MARUTI", "Maruti Suzuki", "Auto", "NSE"),
    ("HCLTECH", "HCL Technologies", "IT", "NSE"),
    ("SUNPHARMA", "Sun Pharmaceutical", "Pharma", "NSE"),
    ("TITAN", "Titan Company", "Consumer Durables", "NSE"),
    ("ULTRACEMCO", "UltraTech Cement", "Cement", "NSE"),
    ("WIPRO", "Wipro", "IT", "NSE"),
    ("NESTLEIND", "Nestle India", "FMCG", "NSE"),
    ("TATAMOTORS", "Tata Motors", "Auto", "NSE"),
    ("TATASTEEL", "Tata Steel", "Metals", "NSE"),
    ("POWERGRID", "Power Grid Corporation", "Power", "NSE"),
    ("NTPC", "NTPC Limited", "Power", "NSE"),
    ("ONGC", "Oil & Natural Gas Corp", "Energy", "NSE"),
    ("JSWSTEEL", "JSW Steel", "Metals", "NSE"),
    ("ADANIENT", "Adani Enterprises", "Diversified", "NSE"),
    ("COALINDIA", "Coal India", "Energy", "NSE"),
    ("TECHM", "Tech Mahindra", "IT", "NSE"),
]

NEWS_WINDOW_DAYS = 7
MAX_HEADLINES_PER_COMPANY = 8
