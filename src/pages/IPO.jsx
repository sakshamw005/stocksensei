import db from '@/api/dbClient';

import { useEffect, useState } from 'react';

import { StatGrid, StatCell } from '@/components/ui/StatGrid';
import VerdictCard from '@/components/VerdictCard';
import GmpChart from '@/components/GmpChart';
import { formatCompact, formatPercent, formatRatio, formatDate } from '@/lib/format';

export default function IPO() {
  const [ipos, setIpos] = useState(null);
  const [sel, setSel] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [loadingVerdict, setLoadingVerdict] = useState(false);
  const [error, setError] = useState(null);

  const loadList = async () => {
    try {
      const res = await db.functions.invoke('fetch-ipo-data', {});
      setIpos(res.data?.ipos || []);
    } catch {
      setIpos([]);
    }
  };

  useEffect(() => { loadList(); }, []);

  const onSelect = async (ipo) => {
    setSel(ipo);
    setDetail(null); setVerdict(null); setError(null);
    setLoadingDetail(true);
    try {
      const res = await db.functions.invoke('fetch-ipo-data', { ipo_id: ipo.id });
      setDetail(res.data);
      setLoadingDetail(false);
      setLoadingVerdict(true);
      const ares = await db.functions.invoke('generate-analysis', { ipo_id: ipo.id });
      setVerdict(ares.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setLoadingDetail(false);
    setLoadingVerdict(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-ink">IPO</h1>
        <p className="font-body text-sm text-ink-soft mt-1">Upcoming and recent public offers, with grey-market premium vs fundamentals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {ipos === null && (
            <div className="border border-line bg-paper-raised rounded-[3px] p-4 font-data text-sm text-ink-faint">Loading IPOs…</div>
          )}
          {ipos !== null && ipos.length === 0 && (
            <div className="border border-line bg-paper-raised rounded-[3px] p-4 font-body text-sm text-ink-soft">No IPOs in the database yet.</div>
          )}
          {ipos?.map((ipo) => (
            <button
              key={ipo.id}
              onClick={() => onSelect(ipo)}
              className={`w-full text-left border rounded-[3px] p-3 ${sel?.id === ipo.id ? 'border-ink bg-secondary' : 'border-line bg-paper-raised hover:border-ink'}`}
            >
              <div className="font-data text-sm text-ink">{ipo.ticker || ipo.company_name}</div>
              <div className="font-body text-xs text-ink-soft truncate">{ipo.company_name}</div>
              <div className="font-data text-[11px] text-ink-faint mt-1">
                {ipo.open_date ? formatDate(ipo.open_date) : ''}{ipo.gmp_current != null ? ` · GMP ₹${ipo.gmp_current}` : ''}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && <div className="border border-line bg-loss-soft rounded-[3px] p-4 font-body text-sm text-loss">{error}</div>}
          {sel && loadingDetail && (
            <div className="border border-line bg-paper-raised rounded-[3px] p-6 font-data text-sm text-ink-faint">Loading {sel.company_name}…</div>
          )}
          {sel && detail && !loadingDetail && detail.status !== 'no_data' && (
            <>
              <div className="border border-line bg-paper-raised rounded-[3px] p-5">
                <div className="font-heading text-2xl font-semibold text-ink">{detail.ipo.company_name}</div>
                <div className="font-data text-sm text-ink-soft mt-0.5">
                  {detail.ipo.ticker}{detail.ipo.open_date ? ` · open ${formatDate(detail.ipo.open_date)}` : ''}
                </div>
              </div>
              <StatGrid>
                <StatCell
                  label="Price Band"
                  value={detail.ipo.price_band_low != null && detail.ipo.price_band_high != null ? `₹${detail.ipo.price_band_low}–${detail.ipo.price_band_high}` : '—'}
                />
                <StatCell label="Subscription" value={formatRatio(detail.ipo.subscription_multiple) + (detail.ipo.subscription_multiple != null ? 'x' : '')} />
                <StatCell
                  label="Revenue (3Y)"
                  value={`${formatCompact(detail.ipo.revenue_y0)} → ${formatCompact(detail.ipo.revenue_y2)}`}
                  note="y0 → y2"
                />
                <StatCell
                  label="Net Margin (3Y)"
                  value={`${formatPercent(detail.ipo.margin_y0, false)} → ${formatPercent(detail.ipo.margin_y2, false)}`}
                  note="y0 → y2"
                />
              </StatGrid>
              <div>
                <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint mb-2">Grey Market Premium History</div>
                <GmpChart data={detail.gmp} />
              </div>
              <VerdictCard
                loading={loadingVerdict}
                agreement={verdict?.agreement}
                paragraph={verdict?.paragraph}
                insufficient={verdict?.insufficient}
                sources={verdict?.sources}
              />
            </>
          )}
          {sel && detail?.status === 'no_data' && (
            <div className="border border-line bg-paper-raised rounded-[3px] p-6 font-body text-sm text-ink-soft">
              No data available for this IPO.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}