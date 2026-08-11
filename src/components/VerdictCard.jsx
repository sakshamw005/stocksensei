import Stamp from './Stamp';

export default function VerdictCard({ loading, agreement, paragraph, insufficient, sources }) {
  return (
    <div className="border border-line bg-paper-raised rounded-[3px] p-6">
      <div className="mb-4">
        {loading ? (
          <div className="font-data text-xs uppercase tracking-widest text-ink-faint">Generating analysis…</div>
        ) : insufficient ? (
          <div className="inline-block border border-line px-4 py-1.5">
            <span className="font-data text-xs uppercase tracking-widest text-ink-faint">INSUFFICIENT DATA</span>
          </div>
        ) : (
          <Stamp agreement={agreement} />
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-secondary rounded-[3px] w-full" />
          <div className="h-3 bg-secondary rounded-[3px] w-5/6" />
          <div className="h-3 bg-secondary rounded-[3px] w-4/6" />
        </div>
      ) : (
        <p className="font-body text-sm text-ink-soft leading-relaxed">{paragraph}</p>
      )}
      {sources && !loading && (
        <div className="mt-4 pt-3 border-t border-line font-data text-[11px] text-ink-faint">
          Sources: {sources}
        </div>
      )}
    </div>
  );
}