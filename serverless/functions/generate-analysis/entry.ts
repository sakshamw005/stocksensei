const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';
import {
  RESPONSE_SCHEMA,
  computeStockSignals,
  computeEtfSignals,
  computeIpoSignals,
  determineBullishCall,
  buildStockPrompt,
  buildEtfPrompt,
  buildIpoPrompt
} from '../../shared/analysis.ts';
import { fetchTwelveQuote, fetchTwelveFundamentals, fetchGoogleNews, callGroq, fetchGmpForIpo, fetchTwelveIpoCalendar } from '../../shared/vendorClients';
import { getCache, setCache } from '../../shared/cache';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { ticker, is_etf, ipo_id } = body;

    let prompt, signals, agreement, insufficient, sources, call;

    if (ipo_id != null) {
      const ipos = await restGet(db, 'ipos', `select=*&id=eq.${encodeURIComponent(ipo_id)}&limit=1`);
      const ipo = (ipos && ipos[0]) || null;
      if (!ipo) return Response.json({ error: 'IPO not found' }, { status: 404 });
      let gmp = [];
      try {
        const gmpCacheKey = `ipo_gmp:${ipo.id}`;
        gmp = getCache(gmpCacheKey);
        if (!gmp) {
          const live = await fetchGmpForIpo(ipo.ticker).catch(() => null);
          if (Array.isArray(live)) gmp = live; else if (live && live.premium != null) gmp = [{ date: new Date().toISOString(), premium: live.premium }]; else gmp = [];
          setCache(gmpCacheKey, gmp, 2 * 60 * 1000);
        }
      } catch (e) {}
      const r = computeIpoSignals(ipo, gmp || []);
      signals = r.signals; agreement = r.agreement; insufficient = r.insufficient;
      sources = `IPO fundamentals + GMP history (${(gmp || []).length} points) as of ${ipo.as_of || 'n/a'}`;
      prompt = buildIpoPrompt(ipo, gmp || [], r);
      // Ask Claude to use web_search and include live facts. Add instruction to cite sources.
      try {
        // Fetch live headlines from Google News RSS for this IPO/company
        const headlines = await fetchGoogleNews(`${ipo.company_name} ${ipo.ticker}`);
        const headText = (headlines || []).slice(0, 8).map(h => `- ${h.title} (${h.source || 'source'}, ${h.pubDate || 'date'})`).join('\n');
        const fullPrompt = `${prompt}\n\nHeadlines:\n${headText}\n\nUsing ONLY the fundamentals and the headlines above, write a 2-3 sentence analysis and then a line beginning with "Sources:" listing which headlines (by index or short title) and fundamentals you used. Finally output a line "Call: bullish|bearish|neutral".`;
        const llmRes = await callGroq(fullPrompt, 'llama-3.3-70b-versatile');
        // groq/openai-compatible response: extract message content if available
        const content = llmRes?.choices?.[0]?.message?.content || llmRes?.choices?.[0]?.text || JSON.stringify(llmRes);
        return Response.json({ analysis_raw: llmRes, paragraph: content, call: determineBullishCall(r.signals), agreement, insufficient, signals, sources });
      } catch (e) {
        return Response.json({ error: 'analysis temporarily unavailable', details: e.message }, { status: 503 });
      }
    } else if (is_etf) {
      // Fetch live ETF fundamentals and quote from Twelve Data
      try {
        const quote = await fetchTwelveQuote(ticker);
        if (!quote || (quote.symbol && quote.symbol !== ticker)) return Response.json({ error: 'ETF not found' }, { status: 404 });
        const fund = await fetchTwelveFundamentals(ticker).catch(() => null);
        const etf = { name: quote.name || quote.symbol, ticker: quote.symbol || ticker, category: fund?.category || null, tracked_index: fund?.index || null, expense_ratio: fund?.expense_ratio ?? null, tracking_error: fund?.tracking_error ?? null, aum: fund?.aum ?? null, as_of: new Date().toISOString() };
        const r = computeEtfSignals(etf, null);
        signals = r.signals; agreement = r.agreement; insufficient = r.insufficient;
        sources = `ETF metrics as of ${etf.as_of}`;
        prompt = buildEtfPrompt(etf, null, r);
        try {
          const headlines = await fetchGoogleNews(`${etf.name} ${etf.ticker}`);
          const headText = (headlines || []).slice(0, 8).map(h => `- ${h.title} (${h.source || 'source'}, ${h.pubDate || 'date'})`).join('\n');
          const fullPrompt = `${prompt}\n\nHeadlines:\n${headText}\n\nUsing ONLY the fundamentals and the headlines above, write a 2-3 sentence analysis and then a line beginning with "Sources:" listing which headlines (by index or short title) and fundamentals you used. Finally output a line "Call: bullish|bearish|neutral".`;
          const llmRes = await callGroq(fullPrompt, 'llama-3.3-70b-versatile');
          const content = llmRes?.choices?.[0]?.message?.content || llmRes?.choices?.[0]?.text || JSON.stringify(llmRes);
          return Response.json({ analysis_raw: llmRes, paragraph: content, call: determineBullishCall(r.signals), agreement, insufficient, signals, sources });
        } catch (e) {
          return Response.json({ error: 'analysis temporarily unavailable', details: e.message }, { status: 503 });
        }
      } catch (e) {
        return Response.json({ error: 'analysis temporarily unavailable', details: e.message }, { status: 503 });
      }
    } else {
      // Fetch live company quote + fundamentals from Twelve Data and call Claude with web_search
      try {
        const quote = await fetchTwelveQuote(ticker);
        if (!quote || (quote.symbol && quote.symbol !== ticker)) return Response.json({ error: 'Company not found or ticker mismatch' }, { status: 404 });
        const fund = await fetchTwelveFundamentals(ticker).catch(() => null);
        const company = { name: quote.name || quote.symbol, ticker: quote.symbol || ticker, exchange: quote.exchange || 'n/a', sector: quote.sector || 'n/a', sector_trend: quote.sector_trend || null, current_price: quote.price ?? quote.close ?? null, as_of: new Date().toISOString() };
        const r = computeStockSignals({ company, fundamentals: fund || {}, sentiment: null });
        signals = r.signals; agreement = r.agreement; insufficient = r.insufficient;
        call = determineBullishCall(r.signals);
        sources = `Fundamentals fetched live as of ${company.as_of}`;
        prompt = buildStockPrompt({ company, fundamentals: fund || {}, sentiment: null }, r);
        try {
          const headlines = await fetchGoogleNews(`${company.name} ${company.ticker}`);
          const headText = (headlines || []).slice(0, 8).map(h => `- ${h.title} (${h.source || 'source'}, ${h.pubDate || 'date'})`).join('\n');
          const fullPrompt = `${prompt}\n\nHeadlines:\n${headText}\n\nUsing ONLY the fundamentals and the headlines above, write a 2-3 sentence analysis and then a line beginning with "Sources:" listing which headlines (by index or short title) and fundamentals you used. Finally output a line "Call: bullish|bearish|neutral".`;
          const llmRes = await callGroq(fullPrompt, 'llama-3.3-70b-versatile');
          const content = llmRes?.choices?.[0]?.message?.content || llmRes?.choices?.[0]?.text || JSON.stringify(llmRes);
          return Response.json({ analysis_raw: llmRes, paragraph: content, call: call || determineBullishCall(r.signals), agreement, insufficient, signals, sources });
        } catch (e) {
          return Response.json({ error: 'analysis temporarily unavailable', details: e.message }, { status: 503 });
        }
      } catch (e) {
        return Response.json({ error: 'analysis temporarily unavailable', details: e.message }, { status: 503 });
      }
    }

    // All analysis branches return above using live Twelve Data + Google News + Groq.
    // If execution reaches here, return an explicit error indicating analysis couldn't be produced.
    return Response.json({ error: 'analysis path did not complete; unexpected state' }, { status: 500 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
