const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';
import { fetchTwelveSymbolSearch } from '../../shared/vendorClients';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const query = (body.query || '').trim();
    const mode = body.mode || 'stock';
    if (query.length < 1) return Response.json({ results: [] });
    // Use Twelve Data symbol search to allow searching the full exchange universe.
    let results = [];
    try {
      const searchResp = await fetchTwelveSymbolSearch(query, 25).catch(() => null);
      const items = (searchResp && (searchResp.data || searchResp)) || [];
      for (const it of items) {
        const symbol = it.symbol || it.code || it.ticker || it[0];
        const name = it.name || it.instrument_name || it.description || it[1] || '';
        const exchange = it.exchange || it.exchange_short || '';
        const kind = (name && /ETF/i.test(name)) || (it.type && it.type.toLowerCase() === 'etf') ? 'etf' : 'stock';
        // Attach sector from Supabase companies table when available
        let sector = null;
        try {
          const rows = await restGet(db, 'companies', `select=sector&ticker=eq.${encodeURIComponent(symbol)}&limit=1`);
          const r = (rows && rows[0]) || null;
          sector = r?.sector || null;
        } catch (e) {}
        // respect mode filter
        if (mode === 'etf' && kind !== 'etf') continue;
        if (mode === 'stock' && kind === 'etf') continue;
        results.push({ ticker: symbol, name: name || symbol, exchange, sector, kind });
      }
    } catch (e) {
      // fallback to empty results
    }
    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
