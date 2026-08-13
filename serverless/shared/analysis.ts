export function daysSince(asOf) {
  if (!asOf) return null;
  return (Date.now() - new Date(asOf).getTime()) / 86400000;
}

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    paragraph: { type: 'string', description: 'A 2-3 sentence plain-language analysis consistent with the provided signals, using only the numbers supplied.' },
    call: { type: 'string', enum: ['bullish', 'bearish', 'neutral'] },
    agreement: { type: 'string', enum: ['agree', 'disagree', 'neutral'] },
    insufficient: { type: 'boolean' }
  },
  required: ['paragraph', 'call', 'insufficient']
};

function statusFromCount(bull, bear) {
  if (bull > bear) return 'positive';
  if (bear > bull) return 'negative';
  return 'neutral';
}

export function computeStockSignals(d) {
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
  const hasAnyData = Object.keys(f).length > 0 || Object.keys(s).length > 0 || Object.keys(c).length > 0;
  let agreement = 'neutral';
  let insufficient = false;
  if (!hasAnyData) insufficient = true;
  else if (dirs.length >= 2) agreement = dirs.every((x) => x === dirs[0]) ? 'agree' : 'disagree';
  return { signals, agreement, insufficient };
}

export function computeEtfSignals(etf, sentiment) {
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

export function computeIpoSignals(ipo, gmp) {
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

export function determineBullishCall(signals) {
  const values = Object.values(signals || {});
  const positive = values.filter((v) => v === 'positive').length;
  const negative = values.filter((v) => v === 'negative').length;
  if (positive > negative) return 'bullish';
  if (negative > positive) return 'bearish';
  return 'neutral';
}

export function buildStockPrompt(d, r) {
  const f = d.fundamentals || {};
  const s = d.sentiment || {};
  const c = d.company || {};
  const topHeadlines = Array.isArray(s.top_headlines) ? s.top_headlines.slice(0, 5).map((item) => String(item)).join(' | ') : 'n/a';
  return `You are an equity analyst. Using ONLY the data below, write a 2-3 sentence analysis of the company. Do not invent or estimate any number not present. If a field is missing, do not fill it with a guess. Ground the conclusion only in the fetched fundamentals row, the fetched news_sentiment row, and the company sector.

Company: ${c.name || 'n/a'} (${c.ticker}), exchange ${c.exchange || 'n/a'}, sector ${c.sector || 'n/a'}, sector trend ${c.sector_trend || 'n/a'}.
Current price: ${c.current_price ?? 'n/a'}.
Fundamentals row (as of ${f.as_of || 'n/a'}): market cap ${f.market_cap ?? 'n/a'}, P/E ${f.pe_ratio ?? 'n/a'}, industry P/E ${f.industry_pe ?? 'n/a'}, P/B ${f.pb_ratio ?? 'n/a'}, EPS ${f.eps ?? 'n/a'}, book value ${f.book_value ?? 'n/a'}, face value ${f.face_value ?? 'n/a'}, EBITDA ${f.ebitda ?? 'n/a'}, ROE ${f.roe ?? 'n/a'}, debt-to-equity ${f.debt_to_equity ?? 'n/a'}, profit growth YoY ${f.profit_growth_yoy ?? 'n/a'}, revenue growth QoQ ${f.revenue_growth_qoq ?? 'n/a'}, dividend yield ${f.dividend_yield ?? 'n/a'}, free cash flow ${f.free_cash_flow ?? 'n/a'}.
News sentiment row: score ${s.score ?? 'n/a'} (${s.label || 'n/a'}), summary ${s.summary || 'n/a'}, top_headlines ${topHeadlines}.

Computed signals: fundamentals ${r.signals.fundamentals}, news ${r.signals.news}, sector ${r.signals.sector}. Aggregate these three inputs to choose a final call: bullish if the majority of the signal directions are positive, bearish if the majority are negative, and neutral if the data is mixed or not decisive.
Return JSON with a "paragraph" string and a "call" field set to one of ['bullish', 'bearish', 'neutral']; do not use 'agree'/'disagree'.`;
}

export function buildEtfPrompt(etf, sentiment, r) {
  return `You are an ETF analyst. Using ONLY the data below, write a 2-3 sentence analysis of whether this ETF tracks its index well and whether the underlying sector is in a favourable or unfavourable news environment. Do not use stock-style P/E or earnings language. Do not invent numbers.

ETF: ${etf.name || 'n/a'} (${etf.ticker}), category ${etf.category || 'n/a'}.
Tracked index: ${etf.tracked_index || 'n/a'}. Expense ratio ${etf.expense_ratio ?? 'n/a'}. Tracking error ${etf.tracking_error ?? 'n/a'}. AUM ${etf.aum ?? 'n/a'}. 1-year return ${etf.return_1y ?? 'n/a'} vs index 1-year return ${etf.index_return_1y ?? 'n/a'} (as of ${etf.as_of || 'n/a'}).
Category news sentiment: score ${sentiment?.score ?? 'n/a'} (${sentiment?.label || 'n/a'}): ${sentiment?.summary || 'n/a'}.

Computed signals: tracking accuracy ${r.signals.accuracy}, liquidity ${r.signals.liquidity}, category sentiment ${r.signals.category}. Overall the signals ${r.agreement === 'agree' ? 'agree' : 'disagree'}.
Return JSON.`;
}

export function buildIpoPrompt(ipo, gmp, r) {
  const gmpLatest = gmp.length ? gmp[gmp.length - 1].premium : ipo.gmp_current;
  return `You are an IPO analyst. Using ONLY the data below, write a 2-3 sentence analysis of whether the grey-market-premium-driven hype matches or conflicts with the underlying fundamentals. Do not invent numbers.

IPO: ${ipo.company_name || 'n/a'} (${ipo.ticker || 'n/a'}). Price band ${ipo.price_band_low ?? 'n/a'}\u2013${ipo.price_band_high ?? 'n/a'}. Subscription multiple ${ipo.subscription_multiple ?? 'n/a'}x. Current GMP ${ipo.gmp_current ?? 'n/a'} (latest series point ${gmpLatest ?? 'n/a'}). Open date ${ipo.open_date || 'n/a'}.
3-year revenue: ${ipo.revenue_y0 ?? 'n/a'} \u2192 ${ipo.revenue_y1 ?? 'n/a'} \u2192 ${ipo.revenue_y2 ?? 'n/a'}.
Net margin trend: ${ipo.margin_y0 ?? 'n/a'} \u2192 ${ipo.margin_y1 ?? 'n/a'} \u2192 ${ipo.margin_y2 ?? 'n/a'}.

Computed signals: fundamentals ${r.signals.fundamentals}, GMP hype ${r.signals.hype}. Overall the signals ${r.agreement === 'agree' ? 'agree' : 'disagree'}.
Return JSON.`;
}
