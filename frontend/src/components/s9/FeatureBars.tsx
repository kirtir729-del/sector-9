import type { AcousticFeatures } from "@/lib/sector9";

const ROWS: { key: keyof AcousticFeatures; label: string }[] = [
  { key: "mfcc", label: "MFCC" },
  { key: "pitch", label: "Pitch" },
  { key: "energy", label: "Energy" },
  { key: "speech_rate", label: "Speech Rate" },
  { key: "variance", label: "Voice Variance" },
];

export function FeatureBars({ features }: { features: AcousticFeatures }) {
  return (
    <section className="panel p-5" aria-label="Acoustic features">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.25em]">
        Acoustic Features
      </h2>
      <div className="mt-4 space-y-3">
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-center gap-4">
            <span className="label-xs w-32 shrink-0">{r.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full speed-bar transition-all duration-700"
                style={{ width: `${features[r.key]}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-accent">
              {features[r.key]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
