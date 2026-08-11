// TIER 1 NSE Companies from ingestion/config.py
const TIER1_COMPANIES = [
  ["RELIANCE", "Reliance Industries", "Energy", "NSE"],
  ["TCS", "Tata Consultancy Services", "IT", "NSE"],
  ["HDFCBANK", "HDFC Bank", "Banking", "NSE"],
  ["INFY", "Infosys", "IT", "NSE"],
  ["ICICIBANK", "ICICI Bank", "Banking", "NSE"],
  ["HINDUNILVR", "Hindustan Unilever", "FMCG", "NSE"],
  ["ITC", "ITC Limited", "FMCG", "NSE"],
  ["SBIN", "State Bank of India", "Banking", "NSE"],
  ["BHARTIARTL", "Bharti Airtel", "Telecom", "NSE"],
  ["KOTAKBANK", "Kotak Mahindra Bank", "Banking", "NSE"],
  ["LT", "Larsen & Toubro", "Infrastructure", "NSE"],
  ["AXISBANK", "Axis Bank", "Banking", "NSE"],
  ["BAJFINANCE", "Bajaj Finance", "Financial Services", "NSE"],
  ["ASIANPAINT", "Asian Paints", "FMCG", "NSE"],
  ["MARUTI", "Maruti Suzuki", "Auto", "NSE"],
  ["HCLTECH", "HCL Technologies", "IT", "NSE"],
  ["SUNPHARMA", "Sun Pharmaceutical", "Pharma", "NSE"],
  ["TITAN", "Titan Company", "Consumer Durables", "NSE"],
  ["ULTRACEMCO", "UltraTech Cement", "Cement", "NSE"],
  ["WIPRO", "Wipro", "IT", "NSE"],
  ["NESTLEIND", "Nestle India", "FMCG", "NSE"],
  ["TATAMOTORS", "Tata Motors", "Auto", "NSE"],
  ["TATASTEEL", "Tata Steel", "Metals", "NSE"],
  ["POWERGRID", "Power Grid Corporation", "Power", "NSE"],
  ["NTPC", "NTPC Limited", "Power", "NSE"],
  ["ONGC", "Oil & Natural Gas Corp", "Energy", "NSE"],
  ["JSWSTEEL", "JSW Steel", "Metals", "NSE"],
  ["ADANIENT", "Adani Enterprises", "Diversified", "NSE"],
  ["COALINDIA", "Coal India", "Energy", "NSE"],
  ["TECHM", "Tech Mahindra", "IT", "NSE"]
];

const MOCK_COMPANIES = TIER1_COMPANIES.map(([ticker, name, sector, exchange]) => ({
  ticker,
  name,
  exchange,
  sector,
  tier: 1,
  kind: 'stock'
})).concat([
  { ticker: "NIFTYBEES", name: "Nippon India ETF Nifty BeES", exchange: "NSE", sector: "Index", category: "Index", kind: "etf" },
  { ticker: "JUNIORBEES", name: "Nippon India ETF Nifty Next 50", exchange: "NSE", sector: "Index", category: "Index", kind: "etf" },
  { ticker: "MON100", name: "Motilal Oswal Nasdaq 100 ETF", exchange: "NSE", sector: "International", category: "International", kind: "etf" }
]);

const MOCK_COMPANIES_DATA = {
  RELIANCE: {
    company: { ticker: "RELIANCE", name: "Reliance Industries", exchange: "NSE", sector: "Energy", current_price: 2900, sector_trend: "up" },
    fundamentals: { market_cap: 19600000000000, face_value: 10, book_value: 850, eps: 110, pe_ratio: 26.36, industry_pe: 22.5, pb_ratio: 3.41, ebitda: 1500000000000, profit_growth_yoy: 0.12, revenue_growth_qoq: 0.05, debt_to_equity: 0.38, roe: 0.11, dividend_yield: 0.003 },
    sentiment: { score: 0.45, label: "positive", summary: "Strong refining margins and rising retail revenue drive optimistic sentiment." }
  },
  TCS: {
    company: { ticker: "TCS", name: "Tata Consultancy Services", exchange: "NSE", sector: "IT", current_price: 3900, sector_trend: "up" },
    fundamentals: { market_cap: 14100000000000, face_value: 1, book_value: 290, eps: 130, pe_ratio: 30.0, industry_pe: 28.0, pb_ratio: 13.4, ebitda: 600000000000, profit_growth_yoy: 0.08, revenue_growth_qoq: 0.03, debt_to_equity: 0.05, roe: 0.45, dividend_yield: 0.012 },
    sentiment: { score: 0.25, label: "positive", summary: "Strong cloud computing demand and solid deal pipeline." }
  },
  HDFCBANK: {
    company: { ticker: "HDFCBANK", name: "HDFC Bank", exchange: "NSE", sector: "Banking", current_price: 1650, sector_trend: "down" },
    fundamentals: { market_cap: 12500000000000, face_value: 1, book_value: 510, eps: 85, pe_ratio: 19.41, industry_pe: 18.0, pb_ratio: 3.23, ebitda: 800000000000, profit_growth_yoy: 0.18, revenue_growth_qoq: 0.04, debt_to_equity: 0.85, roe: 0.16, dividend_yield: 0.011 },
    sentiment: { score: 0.05, label: "neutral", summary: "Stable earnings performance offset by net interest margin pressures post-merger." }
  },
  INFY: {
    company: { ticker: "INFY", name: "Infosys", exchange: "NSE", sector: "IT", current_price: 1700, sector_trend: "up" },
    fundamentals: { market_cap: 7050000000000, face_value: 5, book_value: 170, eps: 60, pe_ratio: 28.33, industry_pe: 28.0, pb_ratio: 10.0, ebitda: 320000000000, profit_growth_yoy: 0.06, revenue_growth_qoq: 0.02, debt_to_equity: 0.04, roe: 0.32, dividend_yield: 0.021 },
    sentiment: { score: -0.15, label: "negative", summary: "Muted discretionary spending guidance in key North American and European markets." }
  },
  ICICIBANK: {
    company: { ticker: "ICICIBANK", name: "ICICI Bank", exchange: "NSE", sector: "Banking", current_price: 1100, sector_trend: "up" },
    fundamentals: { market_cap: 7700000000000, face_value: 2, book_value: 320, eps: 58, pe_ratio: 18.96, industry_pe: 18.0, pb_ratio: 3.44, ebitda: 450000000000, profit_growth_yoy: 0.24, revenue_growth_qoq: 0.06, debt_to_equity: 0.78, roe: 0.18, dividend_yield: 0.009 },
    sentiment: { score: 0.35, label: "positive", summary: "Excellent credit quality and robust growth in domestic loan portfolio." }
  },
  SBIN: {
    company: { ticker: "SBIN", name: "State Bank of India", exchange: "NSE", sector: "Banking", current_price: 800, sector_trend: "up" },
    fundamentals: { market_cap: 7100000000000, face_value: 1, book_value: 400, eps: 75, pe_ratio: 10.66, industry_pe: 18.0, pb_ratio: 2.0, ebitda: 500000000000, profit_growth_yoy: 0.28, revenue_growth_qoq: 0.07, debt_to_equity: 1.2, roe: 0.19, dividend_yield: 0.015 },
    sentiment: { score: 0.40, label: "positive", summary: "Sustained loan demand and improving margins support a positive forecast." }
  }
};

const MOCK_ETFS_DATA = {
  NIFTYBEES: {
    etf: { name: "Nippon India ETF Nifty BeES", ticker: "NIFTYBEES", category: "Index", tracked_index: "Nifty 50 Index", expense_ratio: 0.0012, tracking_error: 0.03, aum: 154000000000, return_1y: 0.224, index_return_1y: 0.225, as_of: "2026-08-01" },
    sentiment: { score: 0.35, label: "positive", summary: "Inflows to passive equity funds continue at record highs." }
  },
  JUNIORBEES: {
    etf: { name: "Nippon India ETF Nifty Next 50", ticker: "JUNIORBEES", category: "Index", tracked_index: "Nifty Next 50 Index", expense_ratio: 0.0015, tracking_error: 0.05, aum: 48000000000, return_1y: 0.312, index_return_1y: 0.315, as_of: "2026-08-01" },
    sentiment: { score: 0.25, label: "positive", summary: "Mid-to-large cap crossover space remains attractive to retail investors." }
  },
  MON100: {
    etf: { name: "Motilal Oswal Nasdaq 100 ETF", ticker: "MON100", category: "International", tracked_index: "Nasdaq 100 Index", expense_ratio: 0.005, tracking_error: 0.25, aum: 65000000000, return_1y: 0.185, index_return_1y: 0.192, as_of: "2026-08-01" },
    sentiment: { score: -0.15, label: "negative", summary: "Tech sector valuations face resistance amid higher global interest rates." }
  }
};

const MOCK_IPOS = [
  {
    id: "ipo_1",
    company_name: "Acme Capital",
    ticker: "ACME",
    open_date: "2026-08-01",
    gmp_current: 120,
    price_band_low: 300,
    price_band_high: 315
  },
  {
    id: "ipo_2",
    company_name: "Globex Financial",
    ticker: "GLOBEX",
    open_date: "2026-08-10",
    gmp_current: 45,
    price_band_low: 450,
    price_band_high: 475
  }
];

const MOCK_IPOS_DETAILS = {
  ipo_1: {
    id: "ipo_1",
    company_name: "Acme Capital",
    ticker: "ACME",
    open_date: "2026-08-01",
    price_band_low: 300,
    price_band_high: 315,
    subscription_multiple: 12.4,
    revenue_y0: 100000000,
    revenue_y1: 120000000,
    revenue_y2: 150000000,
    margin_y0: 0.12,
    margin_y1: 0.13,
    margin_y2: 0.15,
    gmp_current: 120
  },
  ipo_2: {
    id: "ipo_2",
    company_name: "Globex Financial",
    ticker: "GLOBEX",
    open_date: "2026-08-10",
    price_band_low: 450,
    price_band_high: 475,
    subscription_multiple: 2.1,
    revenue_y0: 200000000,
    revenue_y1: 190000000,
    revenue_y2: 210000000,
    margin_y0: 0.08,
    margin_y1: 0.06,
    margin_y2: 0.07,
    gmp_current: 45
  }
};

const MOCK_GMP_HISTORY = {
  ipo_1: [
    { date: "2026-07-25", premium: 80 },
    { date: "2026-07-26", premium: 85 },
    { date: "2026-07-27", premium: 95 },
    { date: "2026-07-28", premium: 105 },
    { date: "2026-07-29", premium: 120 }
  ],
  ipo_2: [
    { date: "2026-08-05", premium: 30 },
    { date: "2026-08-06", premium: 35 },
    { date: "2026-08-07", premium: 40 },
    { date: "2026-08-08", premium: 45 }
  ]
};

const LESSONS = [
  {
    slug: 'market-cap',
    title: 'Market Cap',
    explanation: 'Market capitalisation is the total market value of a company’s equity: share price × shares outstanding. It measures size, not intrinsic worth.',
    challenge_type: 'mc',
    question: 'Reliance Industries has roughly 676 crore shares outstanding and trades near ₹2,900. What is its market cap?',
    options: ['₹1.96 lakh crore', '₹19.6 lakh crore', '₹2,900 crore', '₹676 crore'],
    answer: '₹19.6 lakh crore',
    context: '676 crore × ₹2,900 ≈ ₹19,60,400 crore = ₹19.6 lakh crore.'
  },
  {
    slug: 'face-value',
    title: 'Face Value',
    explanation: 'Face value is the nominal value of a share set in the company’s books at issue, typically ₹1, ₹2, ₹5 or ₹10. It matters for accounting and dividends, not for market price.',
    challenge_type: 'mc',
    question: 'TCS shares have a face value of ₹1 and trade near ₹3,900. Which is true?',
    options: ['Face value equals market price', 'Market price is far above face value', 'Face value is ₹3,900', 'Face value is irrelevant to dividends'],
    answer: 'Market price is far above face value',
    context: 'A ₹1 face-value share can trade at thousands; the two are unrelated.'
  },
  {
    slug: 'book-value',
    title: 'Book Value',
    explanation: 'Book value is net asset value per share: total assets minus intangible assets and liabilities, divided by shares outstanding. It approximates liquidation value per share.',
    challenge_type: 'mc',
    question: 'Infosys has a book value near ₹170 per share. If it trades at ₹1,700, its P/B ratio is:',
    options: ['1.0', '10.0', '0.1', '170'],
    answer: '10.0',
    context: 'P/B = price ÷ book value = 1700 ÷ 170 = 10.'
  },
  {
    slug: 'eps',
    title: 'EPS',
    explanation: 'Earnings per share is net profit divided by shares outstanding. It shows how much profit is attributable to each share.',
    challenge_type: 'mc',
    question: 'HDFC Bank reported net profit of ₹64,060 crore with ~755 crore shares outstanding. EPS is closest to:',
    options: ['₹8.5', '₹85', '₹985', '₹0.85'],
    answer: '₹85',
    context: '64,060 ÷ 755 ≈ ₹84.9 per share.'
  },
  {
    slug: 'pe-ratio',
    title: 'P/E Ratio',
    explanation: 'The price-to-earnings ratio compares share price to EPS. A lower P/E can mean a cheaper valuation, but context and growth matter.',
    challenge_type: 'mc',
    question: 'A company trades at ₹1,500 with EPS of ₹150. Its P/E is:',
    options: ['10', '100', '0.1', '15'],
    answer: '10',
    context: 'P/E = 1500 ÷ 150 = 10.'
  },
  {
    slug: 'industry-pe',
    title: 'Industry P/E',
    explanation: 'Industry P/E is the average P/E of peer companies in the same sector. Comparing a stock’s P/E to its industry P/E shows whether it trades at a premium or discount.',
    challenge_type: 'mc',
    question: 'TCS trades at a P/E of 30 while the IT industry P/E is 28. This suggests TCS trades at a:',
    options: ['Discount', 'Premium', 'Fair value exactly', 'Loss'],
    answer: 'Premium',
    context: '30 > 28 means a slight premium to peers.'
  },
  {
    slug: 'pb-ratio',
    title: 'P/B Ratio',
    explanation: 'Price-to-book compares market price to book value per share. It is commonly used for banks and asset-heavy businesses.',
    challenge_type: 'mc',
    question: 'State Bank of India trades near ₹800 with a book value of ₹400. Its P/B is:',
    options: ['0.5', '2.0', '4.0', '400'],
    answer: '2.0',
    context: '800 ÷ 400 = 2.0.'
  },
  {
    slug: 'ebitda',
    title: 'EBITDA',
    explanation: 'EBITDA is earnings before interest, tax, depreciation and amortisation — a proxy for operating cash generation from core operations.',
    challenge_type: 'mc',
    question: 'A company has revenue of ₹1,000 crore and operating costs of ₹700 crore (excl. interest, tax, depreciation). EBITDA is:',
    options: ['₹700 crore', '₹300 crore', '₹1,000 crore', '₹100 crore'],
    answer: '₹300 crore',
    context: '1000 − 700 = 300 crore operating profit.'
  },
  {
    slug: 'revenue-qoq-vs-yoy',
    title: 'Revenue QoQ vs YoY',
    explanation: 'Quarter-on-quarter compares one quarter to the previous quarter; year-on-year compares to the same quarter a year ago. YoY removes seasonality; QoQ shows recent momentum.',
    challenge_type: 'mc',
    question: 'Q3 revenue is ₹120 crore vs ₹100 crore in Q2 and ₹90 crore in Q3 last year. The YoY growth is:',
    options: ['20%', '33%', '10%', '11%'],
    answer: '33%',
    context: 'YoY = (120 − 90) / 90 = 33.3%.'
  },
  {
    slug: 'profit-growth',
    title: 'Profit Growth',
    explanation: 'Profit growth measures how net profit changes over a period. Consistent double-digit growth is positive; declining profit raises concern.',
    challenge_type: 'mc',
    question: 'Asian Paints grew net profit from ₹3,000 crore to ₹3,300 crore. Profit growth is:',
    options: ['10%', '30%', '11%', '100%'],
    answer: '10%',
    context: '(3300 − 3000) / 3000 = 10%.'
  },
  {
    slug: 'debt-to-equity',
    title: 'Debt-to-Equity',
    explanation: 'Debt-to-equity compares total debt to shareholders’ equity. Below 1 is generally conservative; above 2 can signal elevated leverage risk.',
    challenge_type: 'mc',
    question: 'A company has debt of ₹4,000 crore and equity of ₹10,000 crore. Its D/E is:',
    options: ['0.4', '2.5', '4.0', '0.25'],
    answer: '0.4',
    context: '4000 ÷ 10000 = 0.4 (conservative).'
  },
  {
    slug: 'roe',
    title: 'ROE',
    explanation: 'Return on equity measures net profit as a percentage of shareholders’ equity — how efficiently the company uses investor capital. Above 15% is typically strong.',
    challenge_type: 'mc',
    question: 'A company has net profit of ₹1,500 crore and equity of ₹7,500 crore. ROE is:',
    options: ['5%', '20%', '15%', '50%'],
    answer: '20%',
    context: '1500 ÷ 7500 = 20%.'
  },
  {
    slug: 'dividend-yield',
    title: 'Dividend Yield',
    explanation: 'Dividend yield is annual dividend per share divided by share price, as a percentage. It shows income return independent of price moves.',
    challenge_type: 'mc',
    question: 'ITC pays ₹15 per share annually and trades at ₹450. Its dividend yield is:',
    options: ['3.3%', '30%', '15%', '0.03%'],
    answer: '3.3%',
    context: '15 ÷ 450 = 3.3%.'
  },
  {
    slug: 'free-cash-flow',
    title: 'Free Cash Flow',
    explanation: 'Free cash flow is operating cash flow minus capital expenditure — cash left after maintaining the business. Positive, growing FCF signals financial flexibility.',
    challenge_type: 'mc',
    question: 'A company has operating cash flow of ₹2,000 crore and capex of ₹1,200 crore. Free cash flow is:',
    options: ['₹3,200 crore', '₹800 crore', '₹1,200 crore', '₹2,000 crore'],
    answer: '₹800 crore',
    context: '2000 − 1200 = 800 crore.'
  }
];

const getMockStockData = (ticker) => {
  const t = ticker.toUpperCase();
  if (MOCK_COMPANIES_DATA[t]) return MOCK_COMPANIES_DATA[t];
  
  const seed = t.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const current_price = 50 + (seed % 1500);
  const pe = 10 + (seed % 40);
  const industry_pe = 15 + (seed % 30);
  const roe = 0.05 + (seed % 30) / 100;
  const pg = -0.1 + (seed % 50) / 100;
  const de = 0.1 + (seed % 25) / 10;
  
  let name = ticker + " Ltd";
  const tier1 = TIER1_COMPANIES.find(c => c[0] === t);
  if (tier1) name = tier1[1];
  
  return {
    company: { ticker: t, name, exchange: "NSE", sector: "General", current_price, sector_trend: seed % 2 === 0 ? "up" : "down" },
    fundamentals: {
      market_cap: 100000000000 + (seed * 1000000000),
      face_value: [1, 2, 5, 10][seed % 4],
      book_value: Math.round(current_price * 0.4),
      eps: Math.round((current_price / pe) * 100) / 100,
      pe_ratio: pe,
      industry_pe: industry_pe,
      pb_ratio: Math.round((current_price / (current_price * 0.4)) * 100) / 100,
      ebitda: 5000000000 + (seed * 10000000),
      profit_growth_yoy: pg,
      revenue_growth_qoq: pg / 2,
      debt_to_equity: de,
      roe: roe,
      dividend_yield: (seed % 5) / 100
    },
    sentiment: {
      score: -0.5 + (seed % 100) / 100,
      label: (seed % 3 === 0) ? "negative" : (seed % 3 === 1) ? "neutral" : "positive",
      summary: `Market shows active coverage for ${t} with steady retail interest.`
    }
  };
};

const getMockEtfData = (ticker) => {
  const t = ticker.toUpperCase();
  if (MOCK_ETFS_DATA[t]) return MOCK_ETFS_DATA[t];
  
  const seed = t.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    etf: {
      name: ticker + " ETF",
      ticker: t,
      category: "Index",
      tracked_index: ticker + " Index",
      expense_ratio: 0.001 + (seed % 10) / 1000,
      tracking_error: 0.01 + (seed % 50) / 100,
      aum: 10000000000 + (seed * 100000000),
      return_1y: 0.05 + (seed % 40) / 100,
      index_return_1y: 0.06 + (seed % 40) / 100,
      as_of: new Date().toISOString().split('T')[0]
    },
    sentiment: {
      score: 0.1 + (seed % 5) / 10,
      label: "positive",
      summary: `Passive flows remain steady for ${t}.`
    }
  };
};

function statusFromCount(bull, bear) {
  if (bull > bear) return 'positive';
  if (bear > bull) return 'negative';
  return 'neutral';
}

function computeStockSignals(d) {
  const f = d.fundamentals || {};
  const s = d.sentiment || {};
  const c = d.company || {};
  let bull = 0, bear = 0;
  if (f.pe_ratio != null && f.industry_pe != null) {
    if (f.pe_ratio < f.industry_pe) bull++; else bear++;
  }
  if (f.roe != null) { if (f.roe >= 15) bull++; else if (f.roe < 8) bear++; }
  if (f.profit_growth_yoy != null) { if (f.profit_growth_yoy > 0) bull++; else bear++; }
  if (f.debt_to_equity != null) { if (f.debt_to_equity < 1) bull++; else if (f.debt_to_equity > 2) bear++; }
  const fundamentals = statusFromCount(bull, bear);
  let news = 'neutral';
  if (s.score != null) news = s.score > 0.1 ? 'positive' : s.score < -0.1 ? 'negative' : 'neutral';
  let sector = 'neutral';
  if (c.sector_trend) sector = c.sector_trend === 'up' ? 'positive' : c.sector_trend === 'down' ? 'negative' : 'neutral';
  const signals = { fundamentals, news, sector };
  const dirs = [fundamentals, news, sector].filter((x) => x !== 'neutral');
  let agreement = 'disagree';
  let insufficient = false;
  if (dirs.length < 2) insufficient = true;
  else agreement = dirs.every((x) => x === dirs[0]) ? 'agree' : 'disagree';
  return { signals, agreement, insufficient };
}

function computeEtfSignals(etf, sentiment) {
  let accuracy = 'neutral';
  if (etf.tracking_error != null) accuracy = etf.tracking_error < 0.5 ? 'positive' : etf.tracking_error > 1.5 ? 'negative' : 'neutral';
  let liquidity = 'neutral';
  if (etf.aum != null) liquidity = etf.aum >= 1000 ? 'positive' : etf.aum < 100 ? 'negative' : 'neutral';
  let category = 'neutral';
  if (sentiment && sentiment.score != null) category = sentiment.score > 0.1 ? 'positive' : sentiment.score < -0.1 ? 'negative' : 'neutral';
  const signals = { accuracy, liquidity, category };
  const dirs = [accuracy, liquidity, category].filter((x) => x !== 'neutral');
  let agreement = 'disagree';
  let insufficient = false;
  if (dirs.length < 2) insufficient = true;
  else agreement = dirs.every((x) => x === dirs[0]) ? 'agree' : 'disagree';
  return { signals, agreement, insufficient };
}

function computeIpoSignals(ipo, gmp) {
  const revUp = ipo.revenue_y0 != null && ipo.revenue_y2 != null && ipo.revenue_y2 > ipo.revenue_y0;
  const revDown = ipo.revenue_y0 != null && ipo.revenue_y2 != null && ipo.revenue_y2 < ipo.revenue_y0;
  const marUp = ipo.margin_y0 != null && ipo.margin_y2 != null && ipo.margin_y2 > ipo.margin_y0;
  const marDown = ipo.margin_y0 != null && ipo.margin_y2 != null && ipo.margin_y2 < ipo.margin_y0;
  let fundamentals = 'neutral';
  if ((revUp || marUp) && !(revDown && marDown)) fundamentals = 'positive';
  else if ((revDown || marDown) && !(revUp && marUp)) fundamentals = 'negative';
  let hype = 'neutral';
  if (ipo.gmp_current != null) hype = ipo.gmp_current > 0 ? 'positive' : ipo.gmp_current < 0 ? 'negative' : 'neutral';
  const signals = { fundamentals, hype };
  const dirs = [fundamentals, hype].filter((x) => x !== 'neutral');
  let agreement = 'disagree';
  let insufficient = false;
  if (dirs.length < 2) insufficient = true;
  else agreement = dirs.every((x) => x === dirs[0]) ? 'agree' : 'disagree';
  return { signals, agreement, insufficient };
}

// Global Axios Client Shim for local dev to bypass actual backend dependency
globalThis.createAxiosClient = () => ({
  get: async (url) => {
    return { id: 'mock-app', public_settings: {} };
  }
});

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://etmqsbbapiswqocwjsmm.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bXFzYmJhcGlzd3FvY3dqc21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzgyNjE0NiwiZXhwIjoyMDk5NDAyMTQ2fQ.T7lEd9ejK8C1qIioZXt9MhKg3g4crWrc8w8_6FanOWg";

const supabaseFetch = async (path, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    let parsed = {};
    try { parsed = JSON.parse(txt); } catch {}
    throw new Error(parsed.message || `Supabase error: ${txt}`);
  }
  return res.json().catch(() => null);
};

export const db = {
  auth: {
    isAuthenticated: async () => {
      return localStorage.getItem('stocksensei_session') !== null;
    },
    me: async () => {
      const session = localStorage.getItem('stocksensei_session');
      if (!session) return null;
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    },
    register: async ({ email, password }) => {
      // Check if user already exists in Supabase
      const existing = await supabaseFetch(`/users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (existing && existing.length > 0) {
        throw new Error('User already exists');
      }
      
      // Create user in Supabase
      const inserted = await supabaseFetch(`/users`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ email, password })
      });
      
      const userObj = inserted && inserted[0];
      if (!userObj) {
        throw new Error('Failed to register user');
      }
      
      // Auto initialize default stats in user_stats
      try {
        await supabaseFetch(`/user_stats`, {
          method: 'POST',
          body: JSON.stringify({ user_id: userObj.id, xp: 0, streak: 0 })
        });
      } catch (e) {
        console.error('Failed to initialize user_stats:', e);
      }
      
      const sessionUser = { id: userObj.id, email: userObj.email };
      localStorage.setItem('stocksensei_session', JSON.stringify(sessionUser));
      localStorage.setItem('stocksensei_access_token', 'mock_token_' + userObj.id);
      
      return { access_token: 'mock_token_' + userObj.id };
    },
    verifyOtp: async ({ email, otpCode }) => {
      // Decommissioned - Register now automatically signs up and logs in
      return { success: true };
    },
    resendOtp: async (email) => {
      return { success: true };
    },
    loginViaEmailPassword: async (email, password) => {
      // Find user in Supabase
      const users = await supabaseFetch(`/users?email=eq.${encodeURIComponent(email)}&select=id,email,password`);
      const userObj = users && users[0];
      
      if (!userObj || userObj.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      const sessionUser = { id: userObj.id, email: userObj.email };
      localStorage.setItem('stocksensei_session', JSON.stringify(sessionUser));
      localStorage.setItem('stocksensei_access_token', 'mock_token_' + userObj.id);
      
      return { access_token: 'mock_token_' + userObj.id };
    },
    loginWithProvider: (provider, returnTo) => {
      const sessionUser = { id: 'usr_google_dev', email: 'googleuser@example.com' };
      localStorage.setItem('stocksensei_session', JSON.stringify(sessionUser));
      localStorage.setItem('stocksensei_access_token', 'mock_token_google');
      
      const target = returnTo || '/';
      window.location.href = target;
    },
    setToken: (token) => {
      localStorage.setItem('stocksensei_access_token', token);
    },
    logout: (redirectUrl) => {
      localStorage.removeItem('stocksensei_session');
      localStorage.removeItem('stocksensei_access_token');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = '/login' + (redirectUrl ? '?returnTo=' + encodeURIComponent(redirectUrl) : '');
    },
    resetPasswordRequest: async (email) => {
      localStorage.setItem('stocksensei_reset_email', email);
      return { success: true };
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      const email = localStorage.getItem('stocksensei_reset_email');
      if (!email) {
        throw new Error('Reset request not found');
      }
      // Update password in Supabase
      const users = await supabaseFetch(`/users?email=eq.${encodeURIComponent(email)}&select=id`);
      const user = users && users[0];
      if (user) {
        await supabaseFetch(`/users?id=eq.${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ password: newPassword })
        });
      }
      localStorage.removeItem('stocksensei_reset_email');
      return { success: true };
    }
  },
  entities: new Proxy({}, {
    get: () => ({
      filter: async () => [],
      get: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' })
    }
  },
  functions: {
    invoke: async (name, args) => {
      // Simulate brief network latency
      await new Promise(r => setTimeout(r, 400));
      
      // Get current user details from local session
      const session = localStorage.getItem('stocksensei_session');
      const user = session ? JSON.parse(session) : null;
      
      if (name === 'get-lessons') {
        if (!user) return { data: { error: 'Unauthorized' } };
        
        // Fetch completed progress from Supabase user_progress table
        let completedSet = new Set();
        try {
          const progress = await supabaseFetch(`/user_progress?user_id=eq.${user.id}&correct=eq.true&select=lesson_id`);
          if (progress) {
            progress.forEach(p => completedSet.add(p.lesson_id));
          }
        } catch (e) {
          console.error('Failed to load progress from Supabase:', e);
        }
        
        // Fetch stats from Supabase user_stats table
        let xp = 0;
        let streak = 0;
        try {
          const stats = await supabaseFetch(`/user_stats?user_id=eq.${user.id}&select=xp,streak`);
          if (stats && stats[0]) {
            xp = stats[0].xp || 0;
            streak = stats[0].streak || 0;
          }
        } catch (e) {
          console.error('Failed to load stats from Supabase:', e);
        }
        
        const out = LESSONS.map(l => ({
          slug: l.slug,
          title: l.title,
          explanation: l.explanation,
          challenge: {
            type: l.challenge_type,
            question: l.question,
            options: l.options,
            answer: l.answer,
            context: l.context
          },
          completed: completedSet.has(l.slug)
        }));
        
        return {
          data: {
            lessons: out,
            xp,
            streak,
            completed_count: completedSet.size
          }
        };
      }
      
      if (name === 'submit-challenge-answer') {
        if (!user) return { data: { error: 'Unauthorized' } };
        const { lesson_id, answer } = args;
        const lesson = LESSONS.find(l => l.slug === lesson_id);
        if (!lesson) throw new Error('Lesson not found');
        
        const isCorrect = lesson.answer.trim().toLowerCase() === answer.trim().toLowerCase();
        
        let xp = 0;
        let streak = 0;
        
        try {
          // Fetch existing stats
          const statsRes = await supabaseFetch(`/user_stats?user_id=eq.${user.id}&select=xp,streak`);
          if (statsRes && statsRes[0]) {
            xp = statsRes[0].xp || 0;
            streak = statsRes[0].streak || 0;
          }
          
          // Save progress in user_progress
          await supabaseFetch(`/user_progress`, {
            method: 'POST',
            headers: {
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ user_id: user.id, lesson_id, correct: isCorrect })
          });
          
          // If correct and user hasn't already completed it, award points
          if (isCorrect) {
            // Check if already correct before
            const prevProgress = await supabaseFetch(`/user_progress?user_id=eq.${user.id}&lesson_id=eq.${encodeURIComponent(lesson_id)}&correct=eq.true&select=id`);
            const alreadyDone = prevProgress && prevProgress.length > 0;
            
            if (!alreadyDone) {
              xp += 10;
              streak += 1;
              
              await supabaseFetch(`/user_stats`, {
                method: 'POST',
                headers: {
                  'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                  user_id: user.id,
                  xp,
                  streak,
                  last_active_date: new Date().toISOString().split('T')[0]
                })
              });
            }
          }
        } catch (e) {
          console.error('Failed to sync challenge submission with Supabase:', e);
        }
        
        return {
          data: {
            correct: isCorrect,
            xp,
            streak
          }
        };
      }
      
      if (name === 'search-companies') {
        const { query, mode } = args;
        if (!query || query.trim().length === 0) return { data: { results: [] } };
        
        const q = query.trim().toLowerCase();
        const matches = MOCK_COMPANIES.filter(c => 
          c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
        );
        
        const filtered = matches.filter(c => 
          mode === 'all' || (mode === 'etf' && c.kind === 'etf') || (mode === 'stock' && c.kind === 'stock')
        );
        
        return {
          data: {
            results: filtered.slice(0, 25)
          }
        };
      }
      
      if (name === 'fetch-company-data') {
        const { ticker } = args;
        const d = getMockStockData(ticker);
        const { signals, agreement, insufficient } = computeStockSignals(d);
        return {
          data: {
            cached: true,
            company: d.company,
            fundamentals: d.fundamentals,
            sentiment: d.sentiment,
            signals,
            agreement,
            insufficient,
            as_of: new Date().toISOString().split('T')[0],
            tier: d.company.tier || 1,
            stale: false
          }
        };
      }
      
      if (name === 'fetch-etf-data') {
        const { ticker } = args;
        const d = getMockEtfData(ticker);
        const { signals, agreement, insufficient } = computeEtfSignals(d.etf, d.sentiment);
        return {
          data: {
            cached: true,
            etf: d.etf,
            sentiment: d.sentiment,
            signals,
            agreement,
            insufficient,
            as_of: new Date().toISOString().split('T')[0],
            stale: false
          }
        };
      }
      
      if (name === 'fetch-ipo-data') {
        const { ipo_id } = args;
        if (!ipo_id) {
          return {
            data: {
              ipos: MOCK_IPOS
            }
          };
        }
        
        const ipo = MOCK_IPOS_DETAILS[ipo_id];
        if (!ipo) return { data: { status: 'no_data' } };
        
        const gmp = MOCK_GMP_HISTORY[ipo_id] || [];
        return {
          data: {
            ipo,
            gmp
          }
        };
      }
      
      if (name === 'generate-analysis') {
        const { ticker, is_etf, ipo_id } = args;
        if (ipo_id) {
          const ipo = MOCK_IPOS_DETAILS[ipo_id];
          const gmp = MOCK_GMP_HISTORY[ipo_id] || [];
          const { signals, agreement, insufficient } = computeIpoSignals(ipo, gmp);
          
          let paragraph = `Analysis of ${ipo.company_name} (${ipo.ticker}) IPO. `;
          if (signals.fundamentals === 'positive') {
            paragraph += `The fundamentals show consistent financial growth with expansion in both revenue and net margins. `;
          } else {
            paragraph += `Fundamentals are somewhat soft or declining. `;
          }
          if (signals.hype === 'positive') {
            paragraph += `Hype in the grey market is very strong with a high premium of ₹${ipo.gmp_current}. `;
          } else {
            paragraph += `Grey market interest is relatively muted. `;
          }
          if (agreement === 'agree') {
            paragraph += `The premium matches the strong underlying business performance, presenting a consistent signal.`;
          } else {
            paragraph += `There is a conflict between the valuation premium and underlying fundamentals, suggesting caution.`;
          }
          
          return {
            data: {
              paragraph,
              agreement,
              insufficient,
              sources: ['Draft Red Herring Prospectus (DRHP)', 'Grey Market Premium Tracker']
            }
          };
        }
        
        if (is_etf) {
          const d = getMockEtfData(ticker);
          const { signals, agreement, insufficient } = computeEtfSignals(d.etf, d.sentiment);
          
          let paragraph = `Analysis of ${d.etf.name} (${d.etf.ticker}). `;
          if (signals.accuracy === 'positive') {
            paragraph += `The ETF tracks its index with low tracking error (${d.etf.tracking_error}%). `;
          } else {
            paragraph += `Tracking error is slightly elevated. `;
          }
          if (signals.liquidity === 'positive') {
            paragraph += `AUM is substantial at ₹${(d.etf.aum / 10000000).toFixed(1)} Cr, indicating high liquidity. `;
          }
          if (agreement === 'agree') {
            paragraph += `Consistent signals across tracking performance and category news sentiment support the index choice.`;
          } else {
            paragraph += `Mixed signals between performance tracking and category sentiment suggest reviewing allocation sizing.`;
          }
          
          return {
            data: {
              paragraph,
              agreement,
              insufficient,
              sources: ['Fund Fact Sheet', 'Exchange Data']
            }
          };
        } else {
          const d = getMockStockData(ticker);
          const { signals, agreement, insufficient } = computeStockSignals(d);
          
          let paragraph = `Analysis of ${d.company.name} (${d.company.ticker}). `;
          if (signals.fundamentals === 'positive') {
            paragraph += `Fundamentals are robust with healthy ROE (${Math.round(d.fundamentals.roe * 100)}%) and comfortable debt levels. `;
          } else {
            paragraph += `Fundamentals exhibit some leverage or return pressures. `;
          }
          if (signals.news === 'positive') {
            paragraph += `News sentiment is positive on recent operational milestones. `;
          } else if (signals.news === 'negative') {
            paragraph += `Sentiment is currently weighed down by macro issues. `;
          }
          if (agreement === 'agree') {
            paragraph += `The operational strength aligns well with supportive news flow and sector momentum.`;
          } else {
            paragraph += `The mixed outlook suggests short-term news noise contrast with longer-term business stability.`;
          }
          
          return {
            data: {
              paragraph,
              agreement,
              insufficient,
              sources: ['Quarterly Earnings Release', 'Brokerage Analyst Consensus']
            }
          };
        }
      }
      
      throw new Error(`Function ${name} not implemented`);
    }
  }
};

export default db;
