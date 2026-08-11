import db from '@/api/dbClient';

import { useState } from 'react';

import StockSearch from '@/components/StockSearch';
import { StatGrid, StatCell } from '@/components/ui/StatGrid';
import SignalStrip from '@/components/SignalStrip';
import VerdictCard from '@/components/VerdictCard';
import { formatPrice, formatCompact, formatPercent, formatRatio, formatDate } from '@/lib/format';

export default function Analyze() {
  const [mode, setMode] = useState('stock');
  const [sel, setSel] = useState(null);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [loadingVerdict, setLoadingVerdict] = useState(false);
  const [error, setError] = useState(null);

  const onSelect = async (r) => {
    setSel(r);
    setData(null); setVerdict(null); setError(null);
    setLoadingData(true);
    try {
      const fn = r.kind === 'etf' ? 'fetch-etf-data' : 'fetch-company-data';
      const res = await db.functions.invoke(fn, { ticker: r.ticker });
      setData(res.data);
      setLoadingData(false);
      if (res.data?.status === 'no_data' || res.data?.insufficient) {
        setLoadingVerdict(true);
        const ares = await db.functions.invoke('generate-analysis', r.kind === 'etf' ? { ticker: r.ticker, is_etf: true } : { ticker: r.ticker });
        setVerdict(ares.data);
      } else {
        setLoadingVerdict(true);
        const ares = await db.functions.invoke('generate-analysis', r.kind === 'etf' ? { ticker: r.ticker, is_etf: true } : { ticker: r.ticker });
        setVerdict(ares.data);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setLoadingData(false);
    setLoadingVerdict(false);
  };

  const switchMode = (m) => {
    setMode(m); setSel(null); setData(null); setVerdict(null); setError(null);
  };

  const noData = data?.status === 'no_data';

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-ink">Analyze</h1>
          <p className="font-body text-sm text-ink-soft mt-1">Search the full NSE + BSE universe, or switch to ETFs.</p>
        </div>
        <div className="flex border border-line rounded-[3px] overflow-hidden">
          {['stock', 'etf'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`font-body text-sm font-medium px-4 py-2 ${mode === m ? 'bg-ink text-paper-raised' : 'bg-paper-raised text-ink-soft hover:text-ink'}`}
            >
              {m === 'stock' ? 'Stocks' : 'ETFs'}
            </button>
          ))}
        </div>
      </div>

      <StockSearch mode={mode} onSelect={onSelect} />

      {error && (
        <div className="border border-line bg-loss-soft rounded-[3px] p-4 font-body text-sm text-loss">{error}</div>
      )}

      {sel && loadingData && (
        <div className="border border-line bg-paper-raised rounded-[3px] p-6 font-data text-sm text-ink-faint">Fetching {sel.ticker}…</div>
      )}

      {sel && data && !loadingData && (
        <div className="space-y-6">
          {/* header */}
          <div className="border border-line bg-paper-raised rounded-[3px] p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-heading text-2xl font-semibold text-ink">{data.company?.name || data.etf?.name || sel.name}</div>
              <div className="font-data text-sm text-ink-soft mt-0.5">
                {sel.ticker}{data.company?.exchange ? ` · ${data.company.exchange}` : ''}{data.company?.sector ? ` · ${data.company.sector}` : ''}{data.etf?.category ? ` · ${data.etf.category}` : ''}
              </div>
            </div>
            {data.company?.current_price != null && (
              <div className="text-right">
                <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint">Current Price</div>
                <div className="font-data text-2xl font-medium text-ink">{formatPrice(data.company.current_price)}</div>
              </div>
            )}
            {data.stale && (
              <div className="font-data text-[11px] text-ink-faint">Data as of {formatDate(data.as_of)}</div>
            )}
          </div>

          {noData ? (
            <div className="border border-line bg-paper-raised rounded-[3px] p-6">
              <div className="font-data text-xs uppercase tracking-widest text-ink-faint mb-2">NO CACHED DATA</div>
              <p className="font-body text-sm text-ink-soft">
                This ticker has no cached fundamentals or news sentiment yet. Long-tail names are fetched on demand; until a data source is connected for it, there isn’t enough coverage to analyse meaningfully.
              </p>
            </div>
          ) : (
            <>
              {mode === 'stock' ? (
                <StockStats data={data} />
              ) : (
                <EtfStats data={data} />
              )}
              <SignalStrip items={mode === 'stock' ? stockSignals(data) : etfSignals(data)} />
            </>
          )}

          <VerdictCard
            loading={loadingVerdict}
            agreement={verdict?.agreement}
            paragraph={verdict?.paragraph}
            insufficient={verdict?.insufficient}
            sources={verdict?.sources}
          />
        </div>
      )}
    </div>
  );
}

function StockStats({ data }) {
  const f = data.fundamentals || {};
  return (
    <StatGrid>
      <StatCell label="Market Cap" value={formatCompact(f.market_cap)} />
      <StatCell label="Face Value" value={formatPrice(f.face_value)} />
      <StatCell label="Book Value" value={formatPrice(f.book_value)} />
      <StatCell label="EPS" value={formatPrice(f.eps)} />
      <StatCell label="P/E Ratio" value={formatRatio(f.pe_ratio)} />
      <StatCell label="Industry P/E" value={formatRatio(f.industry_pe)} />
      <StatCell label="P/B Ratio" value={formatRatio(f.pb_ratio)} />
      <StatCell label="EBITDA" value={formatCompact(f.ebitda)} />
      <StatCell label="Profit Growth YoY" value={formatPercent(f.profit_growth_yoy)} tone={f.profit_growth_yoy >= 0 ? 'gain' : 'loss'} />
      <StatCell label="Revenue Growth QoQ" value={formatPercent(f.revenue_growth_qoq)} tone={f.revenue_growth_qoq >= 0 ? 'gain' : 'loss'} />
      <StatCell label="Debt-to-Equity" value={formatRatio(f.debt_to_equity)} />
      <StatCell label="ROE" value={formatPercent(f.roe, false)} />
      <StatCell label="Dividend Yield" value={formatPercent(f.dividend_yield, false)} />
    </StatGrid>
  );
}

function EtfStats({ data }) {
  const e = data.etf || {};
  const retDiff = (e.return_1y != null && e.index_return_1y != null) ? e.return_1y - e.index_return_1y : null;
  return (
    <StatGrid>
      <StatCell label="Tracked Index" value={e.tracked_index || '—'} />
      <StatCell label="Expense Ratio" value={formatPercent(e.expense_ratio, false)} />
      <StatCell label="Tracking Error" value={formatRatio(e.tracking_error) + (e.tracking_error != null ? '%' : '')} />
      <StatCell label="AUM" value={formatCompact(e.aum)} />
      <StatCell label="1Y Return" value={formatPercent(e.return_1y)} tone={e.return_1y >= 0 ? 'gain' : 'loss'} />
      <StatCell label="Index 1Y Return" value={formatPercent(e.index_return_1y)} tone={e.index_return_1y >= 0 ? 'gain' : 'loss'} />
      <StatCell label="Return vs Index" value={retDiff == null ? '—' : formatPercent(retDiff)} tone={retDiff >= 0 ? 'gain' : 'loss'} note="Tracking gap" />
    </StatGrid>
  );
}

function stockSignals(data) {
  const sg = data.signals || {};
  return [
    { label: 'Fundamentals', status: sg.fundamentals },
    { label: 'News Sentiment', status: sg.news, detail: data.sentiment?.label || '' },
    { label: 'Sector Trend', status: sg.sector, detail: data.company?.sector || '' }
  ];
}

function etfSignals(data) {
  const sg = data.signals || {};
  return [
    { label: 'Tracking Accuracy', status: sg.accuracy },
    { label: 'Liquidity', status: sg.liquidity },
    { label: 'Category Sentiment', status: sg.category, detail: data.etf?.category || '' }
  ];
}