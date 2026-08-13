export default function Stamp({ call, agreement }) {
  const normalized = (call || agreement || 'neutral').toLowerCase();
  const text =
    normalized === 'bullish' || normalized === 'agree' ? 'BULLISH' :
    normalized === 'bearish' || normalized === 'disagree' ? 'BEARISH' :
    'NEUTRAL';

  return (
    <div className="inline-block -rotate-3">
      <div className="border-2 border-mustard">
        <div className="border border-mustard px-4 py-1.5">
          <span className="font-data text-xs font-medium uppercase tracking-widest text-mustard">{text}</span>
        </div>
      </div>
    </div>
  );
}