const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const query = (body.query || '').trim();
    const mode = body.mode || 'stock';
    if (query.length < 1) return Response.json({ results: [] });
    const ilike = encodeURIComponent(`*${query}*`);
    let results = [];
    if (mode !== 'etf') {
      try {
        const rows = await restGet(db, 'companies',
          `select=ticker,name,exchange,tier&or=(ticker.ilike.${ilike},name.ilike.${ilike})&order=tier.asc,ticker.asc&limit=25`);
        results = results.concat((rows || []).map((r) => ({ ticker: r.ticker, name: r.name, exchange: r.exchange, tier: r.tier, kind: 'stock' })));
      } catch (e) { /* table may not exist yet */ }
    }
    if (mode === 'etf' || mode === 'all') {
      try {
        const rows = await restGet(db, 'etfs',
          `select=ticker,name,category&or=(ticker.ilike.${ilike},name.ilike.${ilike})&order=ticker.asc&limit=25`);
        results = results.concat((rows || []).map((r) => ({ ticker: r.ticker, name: r.name, exchange: 'ETF', tier: null, kind: 'etf' })));
      } catch (e) { /* table may not exist yet */ }
    }
    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
