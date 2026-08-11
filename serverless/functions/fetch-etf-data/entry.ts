const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';
import { computeEtfSignals, daysSince } from '../../shared/analysis.ts';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const ticker = (body.ticker || '').trim();
    if (!ticker) return Response.json({ error: 'ticker required' }, { status: 400 });

    const etfs = await restGet(db, 'etfs', `select=*&ticker=eq.${encodeURIComponent(ticker)}&limit=1`);
    const etf = (etfs && etfs[0]) || null;
    if (!etf) return Response.json({ cached: false, status: 'no_data', ticker });

    let sent = null;
    if (etf.category) {
      try { const s = await restGet(db, 'news_sentiment', `select=*&category=eq.${encodeURIComponent(etf.category)}&order=as_of.desc&limit=1`); sent = (s && s[0]) || null; } catch (e) {}
    }
    const { signals, agreement, insufficient } = computeEtfSignals(etf, sent);
    const asOf = (sent && sent.as_of) || etf.as_of;
    const stale = daysSince(asOf) != null && daysSince(asOf) > 10;
    return Response.json({ cached: true, etf, sentiment: sent, signals, agreement, insufficient, as_of: asOf, stale });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
