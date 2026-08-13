// Lightweight vendor client wrappers. API keys are read from environment variables.
// For local development you can place them in `ingestion/.env` (not checked in).
import path from 'path';

let _envLoaded = false;
async function ensureEnvLoaded() {
  if (_envLoaded) return;
  // Prefer existing process.env values; if missing, try to load ingestion/.env using dotenv if available.
  if (process && process.env && (process.env.TWELVE_DATA_API_KEY || process.env.GROQ_API_KEY || process.env.GROQ_API_BASE)) {
    _envLoaded = true; return;
  }
  try {
    // dynamic import so this file doesn't hard-require dotenv in production
    // eslint-disable-next-line no-undef
    const dotenvModule = await import('dotenv');
    const envPath = path.resolve(process.cwd(), 'ingestion', '.env');
    dotenvModule.config && dotenvModule.config({ path: envPath });
  } catch (e) {
    // ignore if dotenv not available
  }
  _envLoaded = true;
}

export async function getTwelveApiKey() {
  await ensureEnvLoaded();
  return process.env.TWELVE_DATA_API_KEY || process.env.TWELVE_DATA_KEY || 'PLACEHOLDER_TWELVE_DATA_API_KEY';
}

export async function getGroqApiKey() {
  await ensureEnvLoaded();
  return process.env.GROQ_API_KEY || process.env.GROQ_API_KEY || 'PLACEHOLDER_GROQ_API_KEY';
}

export function getGroqApiBase() {
  return process.env.GROQ_API_BASE || 'https://api.groq.ai';
}

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  const txt = await res.text();
  let json = null;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
  if (!res.ok) throw new Error(`${res.status} ${txt}`);
  return json;
}

export async function fetchTwelveQuote(symbol) {
  const key = await getTwelveApiKey();
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  return fetchJson(url);
}

export async function fetchTwelveFundamentals(symbol) {
  // Twelve Data exposes various fundamentals endpoints; attempt a generic fundamentals call.
  const key = await getTwelveApiKey();
  const url = `https://api.twelvedata.com/fundamentals?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  return fetchJson(url);
}

export async function fetchTwelveIpoCalendar() {
  const key = await getTwelveApiKey();
  const url = `https://api.twelvedata.com/ipo_calendar?apikey=${key}`;
  return fetchJson(url);
}

export async function fetchTwelveSymbolSearch(query, limit = 25) {
  const key = await getTwelveApiKey();
  const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&outputsize=${limit}&apikey=${key}`;
  return fetchJson(url);
}

export async function fetchGmpForIpo(ticker) {
  // Prefer InvestorGain or Chittorgarh live pages. This is a lightweight aggregator fetcher
  // The implementer should replace this with a provider-specific endpoint and parsing.
  // For now we attempt InvestorGain JSON endpoint (placeholder).
  try {
    const ig = await fetchJson(`https://www.investorgain.example/api/gmp?ticker=${encodeURIComponent(ticker)}`);
    return ig;
  } catch (e) {
    try {
      const ch = await fetchJson(`https://www.chittorgarh.example/api/gmp?ticker=${encodeURIComponent(ticker)}`);
      return ch;
    } catch (e2) {
      return null;
    }
  }
}

export async function fetchGoogleNews(query, limit = 8) {
  // Use Google News RSS search. Returns array of { title, link, pubDate, source }
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const txt = await (await fetch(url)).text();
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(txt)) && items.length < limit) {
    const block = m[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(block);
    const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(block);
    const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block);
    const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : '';
    const link = linkMatch ? linkMatch[1] : '';
    const pubDate = dateMatch ? dateMatch[1] : null;
    // source is usually in title after ' - ' pattern
    let source = '';
    const dashIdx = title.lastIndexOf(' - ');
    if (dashIdx > 0) source = title.slice(dashIdx + 3); else source = '';
    items.push({ title, link, pubDate, source });
  }
  return items;
}

export async function callGroq(prompt, model = 'llama-3.3-70b-versatile') {
  // Call a Groq endpoint that is OpenAI-compatible (chat completion style)
  const key = await getGroqApiKey();
  const base = getGroqApiBase();
  const endpoint = `${base.replace(/\/$/, '')}/v1/chat/completions`;
  const body = { model, messages: [ { role: 'user', content: prompt } ], temperature: 0.2 };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  let json = null;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
  if (!res.ok) throw new Error(`Groq ${res.status}: ${txt}`);
  return json;
}

export default {
  fetchTwelveQuote,
  fetchTwelveFundamentals,
  fetchTwelveIpoCalendar,
  fetchGmpForIpo,
  fetchGoogleNews,
  callGroq
};
