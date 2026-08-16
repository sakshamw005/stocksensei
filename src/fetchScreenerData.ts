/**
 * Live fundamentals via Screener.in scraping. Structure confirmed against
 * a real page (Morepen Labs) — see debug_screener.ts findings.
 *
 * Known limitation: only covers what's in the #top-ratios block (Market
 * Cap, Price, P/E, Book Value, Dividend Yield, ROCE, ROE, Face Value).
 * EPS, EBITDA, Debt-to-Equity, Revenue Growth live in separate tables
 * further down the page — not implemented yet, follow-up if needed.
 *
 * `symbol` must be Screener's own slug, which is USUALLY the NSE ticker
 * but not always (e.g. Tata Motors' CV entity is TMCV on Screener, not
 * TATAMOTORS) — if a symbol 404s, that's likely why; fix the mapping in
 * your company list rather than assuming the scraper is broken.
 */

import * as cheerio from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

export interface ScreenerFundamentals {
  symbol: string;
  marketCap: number | null;
  currentPrice: number | null;
  high52w: number | null;
  low52w: number | null;
  peRatio: number | null;
  bookValue: number | null;
  dividendYield: number | null;
  roce: number | null;
  roe: number | null;
  faceValue: number | null;
}

function parseNumber(text: string | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

export async function fetchScreenerFundamentals(
  symbol: string,
  retries = 2
): Promise<ScreenerFundamentals> {
  const url = `https://www.screener.in/company/${encodeURIComponent(symbol)}/consolidated/`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { headers: HEADERS });

      if (resp.status === 404) {
        throw new Error(
          `Screener has no page at this slug for "${symbol}" — the slug may differ from the NSE ticker (check manually)`
        );
      }
      if (!resp.ok) {
        throw new Error(`Screener fetch failed: HTTP ${resp.status}`);
      }

      const html = await resp.text();
      const $ = cheerio.load(html);
      const items = $("#top-ratios li");

      if (items.length === 0) {
        throw new Error("Page loaded but #top-ratios has no items — Screener's page structure may have changed");
      }

      const values: Record<string, string> = {};
      items.each((_, el) => {
        const name = $(el).find(".name").text().trim();
        const number = $(el).find(".number").first().text().trim();
        if (name) values[name] = number;
      });

      // High/Low needs special handling — two numbers in one field
      const highLowEl = items.filter((_, el) => $(el).find(".name").text().trim() === "High / Low");
      const highLowNumbers = highLowEl.find(".number").map((_, n) => $(n).text().trim()).get();

      return {
        symbol,
        marketCap: parseNumber(values["Market Cap"]),
        currentPrice: parseNumber(values["Current Price"]),
        high52w: highLowNumbers[0] ? parseNumber(highLowNumbers[0]) : null,
        low52w: highLowNumbers[1] ? parseNumber(highLowNumbers[1]) : null,
        peRatio: parseNumber(values["Stock P/E"]),
        bookValue: parseNumber(values["Book Value"]),
        dividendYield: parseNumber(values["Dividend Yield"]),
        roce: parseNumber(values["ROCE"]),
        roe: parseNumber(values["ROE"]),
        faceValue: parseNumber(values["Face Value"]),
      };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error("unreachable");
}
