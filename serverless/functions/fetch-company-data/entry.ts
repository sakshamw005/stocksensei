const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';
import { computeStockSignals, daysSince } from '../../shared/analysis.ts';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const ticker = (body.ticker || '').trim();
    if (!ticker) return Response.json({ error: 'ticker required' }, { status: 400 });

    const companies = await restGet(db, 'companies', `select=*&ticker=eq.${encodeURIComponent(ticker)}&limit=1`);
    const company = (companies && companies[0]) || null;
    if (!company) return Response.json({ cached: false, status: 'no_data', ticker });

    let fund = null, sent = null;
    try { const f = await restGet(db, 'fundamentals', `select=*&ticker=eq.${encodeURIComponent(ticker)}&order=as_of.desc&limit=1`); fund = (f && f[0]) || null; } catch (e) {}
    try { const s = await restGet(db, 'news_sentiment', `select=*&ticker=eq.${encodeURIComponent(ticker)}&order=as_of.desc&limit=1`); sent = (s && s[0]) || null; } catch (e) {}

    if (!fund && !sent) {
      return Response.json({ cached: false, status: 'no_data', ticker, tier: company.tier, company: { name: company.name, exchange: company.exchange, sector: company.sector } });
    }

    const asOf = (fund && fund.as_of) || (sent && sent.as_of) || company.as_of;
    const age = daysSince(asOf);
    const stale = age != null && company.tier === 2 && age > 10;
    const { signals, agreement, insufficient } = computeStockSignals({ company, fundamentals: fund, sentiment: sent });
    return Response.json({ cached: true, company, fundamentals: fund, sentiment: sent, signals, agreement, insufficient, as_of: asOf, tier: company.tier, stale });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
