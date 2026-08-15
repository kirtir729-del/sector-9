import { cn } from "@/lib/utils";
import { stressBand, type AnalysisPayload } from "@/lib/sector9";

const toneColor = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  orange: "var(--orange)",
  destructive: "var(--color-destructive)",
} as const;

const badgeTone: Record<string, string> = {
  LOW: "border-success/50 bg-success/10 text-success",
  MEDIUM: "border-warning/50 bg-warning/10 text-warning",
  HIGH: "border-destructive/50 bg-destructive/10 text-destructive",
  CALM: "border-success/50 bg-success/10 text-success",
  ALERT: "border-warning/50 bg-warning/10 text-warning",
  STRESSED: "border-destructive/50 bg-destructive/10 text-destructive",
};

function Ring({ value, color }: { value: number; color: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-track)" strokeWidth="7" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * value) / 100}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function Tile({ children, label }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-secondary/25 p-4">
      <div className="absolute inset-x-0 top-0 h-0.5 speed-bar opacity-70" />
      <p className="label-xs">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function AudioIntelligence({ data, fresh }: { data: AnalysisPayload; fresh: boolean }) {
  const band = stressBand(data.stress);
  const stressColor = toneColor[band.tone];

  return (
    <section
      className={cn("panel p-5", fresh && "animate-fade-in")}
      aria-label="Audio intelligence"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.25em]">
          Audio Intelligence
        </h2>
        <span className="font-mono text-xs text-muted-foreground">{data.session_id}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Tile label="Stress">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Ring value={data.stress} color={stressColor} />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-lg tabular-nums">
                {data.stress}
              </span>
            </div>
            <span
              className="font-display text-xs uppercase tracking-widest"
              style={{ color: stressColor }}
            >
              {band.label}
            </span>
          </div>
        </Tile>

        <Tile label="Confidence">
          <p className="font-display text-4xl font-bold tabular-nums">
            {data.confidence}
            <span className="ml-1 text-base text-muted-foreground">%</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${data.confidence}%` }}
            />
          </div>
        </Tile>

        <Tile label="Focus">
          <p className="font-display text-4xl font-bold tabular-nums">
            {data.focus}
            <span className="ml-1 text-base text-muted-foreground">%</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full speed-bar transition-all duration-700"
              style={{ width: `${data.focus}%` }}
            />
          </div>
        </Tile>

        <Tile label="Risk Level">
          <span
            className={cn(
              "inline-flex rounded-sm border px-4 py-2 font-display text-lg font-bold uppercase tracking-[0.2em]",
              badgeTone[data.risk],
            )}
          >
            {data.risk}
          </span>
        </Tile>

        <Tile label="Driver State">
          <span
            className={cn(
              "inline-flex rounded-sm border px-4 py-2 font-display text-lg font-bold uppercase tracking-[0.2em]",
              badgeTone[data.state],
            )}
          >
            {data.state}
          </span>
        </Tile>
      </div>
    </section>
  );
}
