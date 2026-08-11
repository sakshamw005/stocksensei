export function StatCell({ label, value, note, tone }) {
  const valueColor = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-ink';
  return (
    <div className="bg-paper-raised px-4 py-3">
      <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint">{label}</div>
      <div className={`font-data text-lg font-medium mt-1 ${valueColor}`}>{value}</div>
      {note && <div className="font-body text-[11px] text-ink-faint mt-0.5">{note}</div>}
    </div>
  );
}

export function StatGrid({ children }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-line border border-line overflow-hidden rounded-[3px]">
      {children}
    </div>
  );
}