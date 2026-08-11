const toneMap = {
  positive: { dot: 'bg-gain', text: 'text-gain', bg: 'bg-gain-soft', label: 'Bullish' },
  negative: { dot: 'bg-loss', text: 'text-loss', bg: 'bg-loss-soft', label: 'Bearish' },
  neutral: { dot: 'bg-ink-faint', text: 'text-ink-soft', bg: 'bg-secondary', label: 'Neutral' }
};

export default function SignalStrip({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line rounded-[3px] overflow-hidden">
      {items.map((it, i) => {
        const t = toneMap[it.status] || toneMap.neutral;
        return (
          <div key={i} className={`px-4 py-3 ${t.bg}`}>
            <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint">{it.label}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-1.5 h-1.5 ${t.dot}`} />
              <span className={`font-data text-sm font-medium ${t.text}`}>{t.label}</span>
            </div>
            {it.detail && <div className="font-body text-[11px] text-ink-soft mt-0.5">{it.detail}</div>}
          </div>
        );
      })}
    </div>
  );
}