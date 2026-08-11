const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const ipoId = body.ipo_id;

    if (ipoId == null) {
      const ipos = await restGet(db, 'ipos', `select=id,company_name,ticker,open_date,gmp_current,price_band_low,price_band_high&order=open_date.desc&limit=50`);
      return Response.json({ ipos: ipos || [] });
    }

    const ipos = await restGet(db, 'ipos', `select=*&id=eq.${encodeURIComponent(ipoId)}&limit=1`);
    const ipo = (ipos && ipos[0]) || null;
    if (!ipo) return Response.json({ status: 'no_data' });

    let gmp = [];
    try { gmp = await restGet(db, 'gmp_history', `select=date,premium&ipo_id=eq.${encodeURIComponent(ipoId)}&order=date.asc&limit=200`); } catch (e) {}
    return Response.json({ ipo, gmp: gmp || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
