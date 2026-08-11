import db from '@/api/dbClient';

import { useEffect, useRef, useState } from 'react';

export default function StockSearch({ mode, onSelect }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 1) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await db.functions.invoke('search-companies', { query: q, mode });
        setResults(res.data?.results || []);
        setOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 250);
    return () => timer.current && clearTimeout(timer.current);
  }, [q, mode]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={mode === 'etf' ? 'Search ETFs by name or ticker…' : 'Search NSE + BSE by name or ticker…'}
        className="w-full border border-line bg-paper-raised rounded-[3px] px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink"
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full border border-line bg-paper-raised rounded-[3px] max-h-80 overflow-auto">
          {loading && <div className="px-4 py-3 font-data text-xs text-ink-faint">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 font-body text-sm text-ink-faint">No matches found.</div>
          )}
          {results.map((r) => (
            <button
              key={`${r.kind}-${r.ticker}`}
              onMouseDown={() => { onSelect(r); setQ(''); setResults([]); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-secondary border-b border-line last:border-b-0 flex items-center justify-between gap-3"
            >
              <span className="font-data text-sm text-ink">{r.ticker}</span>
              <span className="font-body text-xs text-ink-soft truncate">{r.name}{r.exchange ? ` · ${r.exchange}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}