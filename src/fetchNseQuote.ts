/**
 * Live NSE quote fetcher — uses NSE India's own public JSON endpoint
 * (the same one nseindia.com's website uses), not a third-party paid API.
 *
 * No API key, no plan gating, no credit limit. The only real challenge is
 * NSE's bot protection: hitting /api/quote-equity directly without first
 * visiting the homepage to collect cookies will get a 401/403. This module
 * does that two-step dance: warm up a session, then query.
 *
 * Known limitation: this endpoint is reliable for live price/quote data
 * and basic info, but does NOT expose the full fundamentals set (ROE,
 * EBITDA, industry P/E) as cleanly as a dedicated fundamentals API would.
 * Treat this as the source of truth for PRICE specifically; fundamentals
 * depth may still need a secondary source — flag this as a follow-up
 * rather than something this module claims to solve fully.
 */

const NSE_BASE = "https://www.nseindia.com";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

interface NseSession {
  cookies: string;
}

let cachedSession: { session: NseSession; obtainedAt: number } | null = null;
const SESSION_TTL_MS = 5 * 60 * 1000; // re-warm every 5 minutes

async function getSession(): Promise<NseSession> {
  if (cachedSession && Date.now() - cachedSession.obtainedAt < SESSION_TTL_MS) {
    return cachedSession.session;
  }

  const homeResp = await fetch(`${NSE_BASE}/`, {
    headers: BROWSER_HEADERS,
  });

  if (!homeResp.ok) {
    throw new Error(`NSE session warm-up failed: HTTP ${homeResp.status}`);
  }

  // Node's fetch (undici) exposes multiple Set-Cookie headers via getSetCookie()
  const rawCookies =
    typeof (homeResp.headers as any).getSetCookie === "function"
      ? (homeResp.headers as any).getSetCookie()
      : [homeResp.headers.get("set-cookie") ?? ""];

  const cookieString = rawCookies
    .map((c: string) => c.split(";")[0])
    .filter(Boolean)
    .join("; ");

  if (!cookieString) {
    throw new Error("NSE session warm-up returned no cookies — NSE may have changed its bot-protection scheme");
  }

  const session = { cookies: cookieString };
  cachedSession = { session, obtainedAt: Date.now() };
  return session;
}

export interface NseQuote {
  symbol: string;
  companyName: string | null;
  lastPrice: number | null;
  change: number | null;
  pChange: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  previousClose: number | null;
  industry: string | null;
  raw: any; // full response, in case you need fields not mapped above
}

export async function fetchNseQuote(symbol: string, retries = 2): Promise<NseQuote> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const session = await getSession();

      const resp = await fetch(
        `${NSE_BASE}/api/quote-equity?symbol=${encodeURIComponent(symbol)}`,
        {
          headers: {
            ...BROWSER_HEADERS,
            Cookie: session.cookies,
            Referer: `${NSE_BASE}/get-quotes/equity?symbol=${encodeURIComponent(symbol)}`,
          },
        }
      );

      if (resp.status === 401 || resp.status === 403) {
        // session likely stale/rejected — force a re-warm and retry
        cachedSession = null;
        if (attempt < retries) continue;
        throw new Error(`NSE rejected the request (HTTP ${resp.status}) after ${retries} retries`);
      }

      if (!resp.ok) {
        throw new Error(`NSE quote fetch failed: HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const priceInfo = data?.priceInfo ?? {};
      const info = data?.info ?? {};
      const industryInfo = data?.industryInfo ?? {};

      return {
        symbol,
        companyName: info.companyName ?? null,
        lastPrice: priceInfo.lastPrice ?? null,
        change: priceInfo.change ?? null,
        pChange: priceInfo.pChange ?? null,
        open: priceInfo.open ?? null,
        dayHigh: priceInfo.intraDayHighLow?.max ?? null,
        dayLow: priceInfo.intraDayHighLow?.min ?? null,
        previousClose: priceInfo.previousClose ?? null,
        industry: industryInfo.industry ?? null,
        raw: data,
      };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error("unreachable");
}