export default function GmpChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="font-data text-xs text-ink-faint py-4">No GMP history available.</div>;
  }
  const w = 640, h = 180, pad = 28;
  const pts = data.map((d) => Number(d.premium) || 0);
  const min = Math.min(0, ...pts);
  const max = Math.max(1, ...pts);
  const span = Math.max(1, max - min);
  const x = (i) => pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v) => h - pad - ((v - min) * (h - pad * 2)) / span;
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 border border-line bg-paper-raised rounded-[3px]">
      <line x1={pad} y1={zeroY} x2={w - pad} y2={zeroY} stroke="#DBE0D8" strokeWidth="1" strokeDasharray="3 3" />
      <path d={path} fill="none" stroke="#C8862B" strokeWidth="1.5" />
      {pts.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2" fill="#C8862B" />
      ))}
    </svg>
  );
}