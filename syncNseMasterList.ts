/**
 * Weekly job: sync NSE's official master equity list into Supabase's
 * `companies` table. Free — a static CSV download plus Supabase writes,
 * no API credits consumed anywhere in this script.
 *
 * This does NOT fetch fundamentals for any company. It only maintains
 * the "what NSE stocks exist" index. Fundamentals are fetched separately,
 * on-demand, via fetchScreenerData.ts when a user actually views a stock.
 *
 * Run manually: npx tsx syncNseMasterList.ts
 * Run on a schedule: see the GitHub Actions workflow alongside this file.
 */

import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const NSE_CSV_URL = "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv";

interface NseRow {
  symbol: string;
  name: string;
  series: string;
  listingDate: string;
  faceValue: number | null;
  isin: string;
}

function parseCsvLine(line: string): string[] {
  // Simple CSV split — this file doesn't use quoted fields with embedded
  // commas in practice, so a plain split is sufficient and avoids pulling
  // in a CSV parsing dependency for one file format.
  return line.split(",").map((s) => s.trim());
}

async function fetchNseMasterList(): Promise<NseRow[]> {
  const resp = await fetch(NSE_CSV_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  if (!resp.ok) {
    throw new Error(`NSE master list fetch failed: HTTP ${resp.status}`);
  }

  const text = await resp.text();
  const lines = text.trim().split("\n");
  const rows = lines.slice(1); // skip header

  return rows
    .map((line) => {
      const [symbol, name, series, listingDate, , , isin, faceValueRaw] = parseCsvLine(line);
      const faceValue = parseFloat(faceValueRaw);
      return {
        symbol,
        name,
        series,
        listingDate,
        faceValue: isNaN(faceValue) ? null : faceValue,
        isin,
      };
    })
    .filter((r) => r.symbol && r.series === "EQ"); // EQ = regular equity series, excludes some special series
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Fetching NSE master list...");
  const nseRows = await fetchNseMasterList();
  console.log(`Parsed ${nseRows.length} equity-series companies from NSE.`);

  console.log("Fetching existing companies from Supabase...");
  const { data: existing, error: fetchErr } = await supabase.from("companies").select("ticker");
  if (fetchErr) throw fetchErr;
  const existingSymbols = new Set((existing ?? []).map((r) => r.ticker));

  const newRows = nseRows.filter((r) => !existingSymbols.has(r.symbol));
  console.log(`${newRows.length} new listings found since last sync.`);

  if (newRows.length > 0) {
    console.log("New symbols:", newRows.map((r) => r.symbol).join(", "));
  }

  // Upsert everything (new + existing) — cheap, keeps names/ISIN current
  // in case NSE corrects data, without needing separate insert/update logic.
  const upsertRows = nseRows.map((r) => ({
    ticker: r.symbol,
    name: r.name,
    sector: null, // NSE's master list doesn't include sector; enrich separately if needed
    exchange: "NSE",
    tier: 3, // default; promote known liquid names to tier 1/2 manually or via a separate script
    listing_date: r.listingDate,
    face_value: r.faceValue,
    isin: r.isin,
  }));

  const { error: upsertErr } = await supabase
    .from("companies")
    .upsert(upsertRows, { onConflict: "ticker" });

  if (upsertErr) throw upsertErr;

  console.log(`Sync complete. ${upsertRows.length} companies in the table.`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});