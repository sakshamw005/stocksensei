export default function Stamp({ agreement }) {
  const text = agreement === 'agree' ? 'SIGNALS AGREE' : 'SIGNALS DISAGREE';
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