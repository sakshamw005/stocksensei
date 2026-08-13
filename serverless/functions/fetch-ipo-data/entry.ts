const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';
import { fetchGmpForIpo, fetchTwelveIpoCalendar } from '../../shared/vendorClients';
import { getCache, setCache } from '../../shared/cache';

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

    // Fetch live GMP from aggregators and IPO calendar from Twelve Data (if available).
    const gmpCacheKey = `ipo_gmp:${ipo.id}`;
    let gmp = getCache(gmpCacheKey);
    if (!gmp) {
      const live = await fetchGmpForIpo(ipo.ticker).catch(() => null);
      // Normalise to array of { date, premium }
      if (Array.isArray(live)) gmp = live; else if (live && live.premium != null) gmp = [{ date: new Date().toISOString(), premium: live.premium }]; else gmp = [];
      setCache(gmpCacheKey, gmp, 2 * 60 * 1000); // cache for 2 minutes
    }

    let ipoCalendarEntry = null;
    try {
      const calendar = await fetchTwelveIpoCalendar().catch(() => null);
      if (calendar && Array.isArray(calendar.data)) {
        ipoCalendarEntry = calendar.data.find((x) => x.symbol === ipo.ticker || x.ticker === ipo.ticker || x.company === ipo.company_name) || null;
      }
    } catch (e) {}

    return Response.json({ ipo, gmp: gmp || [], ipo_calendar: ipoCalendarEntry });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
