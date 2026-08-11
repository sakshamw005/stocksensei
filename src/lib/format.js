export function formatPrice(v) {
  if (v == null || isNaN(v)) return '—';
  return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatCompact(v) {
  if (v == null || isNaN(v)) return '—';
  const n = Number(v);
  const abs = Math.abs(n);
  if (abs >= 1e7) return '₹' + (n / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Cr';
  if (abs >= 1e5) return '₹' + (n / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' L';
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatPercent(v, withSign = true) {
  if (v == null || isNaN(v)) return '—';
  const s = withSign && v > 0 ? '+' : '';
  return s + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + '%';
}

export function formatRatio(v) {
  if (v == null || isNaN(v)) return '—';
  return Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}