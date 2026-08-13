const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { computeStockSignals, daysSince } from '../../shared/analysis.ts';
import { getCache, setCache } from '../../shared/cache';
import { fetchTwelveQuote, fetchTwelveFundamentals } from '../../shared/vendorClients';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const ticker = (body.ticker || '').trim();
    if (!ticker) return Response.json({ error: 'ticker required' }, { status: 400 });
    // Require exact Twelve Data symbol format (e.g. SYMBOL:NSE)
    const cacheKey = `company:${ticker}`;
    const cached = getCache(cacheKey);
    if (cached) return Response.json({ cached: true, ...cached });

    // Live fetch from Twelve Data
    try {
      const quote = await fetchTwelveQuote(ticker);
      if (!quote || (quote.symbol && quote.symbol !== ticker)) {
        return Response.json({ error: "couldn't confidently resolve this ticker", ticker }, { status: 422 });
      }
      const fund = await fetchTwelveFundamentals(ticker).catch(() => null);
      const company = {
        name: quote.name || quote.symbol || ticker,
        ticker: quote.symbol || ticker,
        exchange: quote.exchange || 'n/a',
        sector: quote.sector || 'n/a',
        current_price: quote.price ?? quote.close ?? null,
        as_of: new Date().toISOString()
      };
      const signalsResult = computeStockSignals({ company, fundamentals: fund || {}, sentiment: null });
      const result = { company, fundamentals: fund || null, sentiment: null, signals: signalsResult.signals, agreement: signalsResult.agreement, insufficient: signalsResult.insufficient, as_of: company.as_of, tier: 0, stale: false };
      // Cache for 15 minutes (avoid duplicate calls)
      setCache(cacheKey, result, 15 * 60 * 1000);
      return Response.json({ cached: false, ...result });
    } catch (e) {
      return Response.json({ error: 'data temporarily unavailable', details: e.message }, { status: 503 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
