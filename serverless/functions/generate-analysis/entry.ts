const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';
import {
  RESPONSE_SCHEMA,
  computeStockSignals,
  computeEtfSignals,
  computeIpoSignals,
  buildStockPrompt,
  buildEtfPrompt,
  buildIpoPrompt
} from '../../shared/analysis.ts';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { ticker, is_etf, ipo_id } = body;

    let prompt, signals, agreement, insufficient, sources;

    if (ipo_id != null) {
      const ipos = await restGet(db, 'ipos', `select=*&id=eq.${encodeURIComponent(ipo_id)}&limit=1`);
      const ipo = (ipos && ipos[0]) || null;
      if (!ipo) return Response.json({ error: 'IPO not found' }, { status: 404 });
      let gmp = [];
      try { gmp = await restGet(db, 'gmp_history', `select=date,premium&ipo_id=eq.${encodeURIComponent(ipo_id)}&order=date.asc&limit=200`); } catch (e) {}
      const r = computeIpoSignals(ipo, gmp || []);
      signals = r.signals; agreement = r.agreement; insufficient = r.insufficient;
      sources = `IPO fundamentals + GMP history (${(gmp || []).length} points) as of ${ipo.as_of || 'n/a'}`;
      prompt = buildIpoPrompt(ipo, gmp || [], r);
    } else if (is_etf) {
      const etfs = await restGet(db, 'etfs', `select=*&ticker=eq.${encodeURIComponent(ticker)}&limit=1`);
      const etf = (etfs && etfs[0]) || null;
      if (!etf) return Response.json({ error: 'ETF not found' }, { status: 404 });
      let sent = null;
      if (etf.category) {
        try { const s = await restGet(db, 'news_sentiment', `select=*&category=eq.${encodeURIComponent(etf.category)}&order=as_of.desc&limit=1`); sent = (s && s[0]) || null; } catch (e) {}
      }
      const r = computeEtfSignals(etf, sent);
      signals = r.signals; agreement = r.agreement; insufficient = r.insufficient;
      sources = `ETF metrics + category sentiment (${etf.category || 'n/a'}) as of ${etf.as_of || 'n/a'}`;
      prompt = buildEtfPrompt(etf, sent, r);
    } else {
      const companies = await restGet(db, 'companies', `select=*&ticker=eq.${encodeURIComponent(ticker)}&limit=1`);
      const company = (companies && companies[0]) || null;
      if (!company) return Response.json({ error: 'Company not found' }, { status: 404 });
      let fund = null, sent = null;
      try { const f = await restGet(db, 'fundamentals', `select=*&ticker=eq.${encodeURIComponent(ticker)}&order=as_of.desc&limit=1`); fund = (f && f[0]) || null; } catch (e) {}
      try { const s = await restGet(db, 'news_sentiment', `select=*&ticker=eq.${encodeURIComponent(ticker)}&order=as_of.desc&limit=1`); sent = (s && s[0]) || null; } catch (e) {}
      const r = computeStockSignals({ company, fundamentals: fund, sentiment: sent });
      signals = r.signals; agreement = r.agreement; insufficient = r.insufficient;
      sources = `Fundamentals + news sentiment as of ${(fund && fund.as_of) || (sent && sent.as_of) || company.as_of || 'n/a'}`;
      prompt = buildStockPrompt({ company, fundamentals: fund, sentiment: sent }, r);
    }

    if (insufficient) {
      return Response.json({
        paragraph: 'There is too little cached data or news coverage for this name to analyse meaningfully. Fundamentals, sentiment, or sector context are missing, so no confident signal can be drawn.',
        agreement,
        insufficient: true,
        signals,
        sources
      });
    }

    const llm = await db.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESPONSE_SCHEMA
    });
    const out = typeof llm === 'string' ? JSON.parse(llm) : llm;
    return Response.json({
      paragraph: out.paragraph,
      agreement: out.agreement || agreement,
      insufficient: false,
      signals,
      sources
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
