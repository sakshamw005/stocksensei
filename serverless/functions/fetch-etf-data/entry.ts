const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { computeEtfSignals, daysSince } from '../../shared/analysis.ts';
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
    const cacheKey = `etf:${ticker}`;
    const cached = getCache(cacheKey);
    if (cached) return Response.json({ cached: true, ...cached });

    try {
      const quote = await fetchTwelveQuote(ticker);
      if (!quote || (quote.symbol && quote.symbol !== ticker)) {
        return Response.json({ error: "couldn't confidently resolve this ticker", ticker }, { status: 422 });
      }
      const fund = await fetchTwelveFundamentals(ticker).catch(() => null);
      const etf = {
        name: quote.name || quote.symbol || ticker,
        ticker: quote.symbol || ticker,
        tracked_index: fund?.index || null,
        expense_ratio: fund?.expense_ratio ?? null,
        tracking_error: fund?.tracking_error ?? null,
        aum: fund?.aum ?? null,
        as_of: new Date().toISOString()
      };
      const r = computeEtfSignals(etf, null);
      const result = { etf, sentiment: null, signals: r.signals, agreement: r.agreement, insufficient: r.insufficient, as_of: etf.as_of, stale: false };
      setCache(cacheKey, result, 15 * 60 * 1000);
      return Response.json({ cached: false, ...result });
    } catch (e) {
      return Response.json({ error: 'data temporarily unavailable', details: e.message }, { status: 503 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
