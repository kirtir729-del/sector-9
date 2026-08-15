import { cn } from "@/lib/utils";
import type { TelemetrySnapshot } from "@/lib/sector9";

const qualityTone = { GOOD: "text-success", FAIR: "text-warning", POOR: "text-destructive" };
const systemTone = { OK: "text-success", WARN: "text-warning", FAIL: "text-destructive" };

export function TelemetryStrip({ telemetry }: { telemetry: TelemetrySnapshot }) {
  const cells = [
    { k: "Speed", v: `${telemetry.speed}`, unit: "km/h", tone: "text-foreground" },
    { k: "Sector", v: telemetry.sector, unit: "", tone: "text-accent" },
    { k: "Lap", v: String(telemetry.lap).padStart(2, "0"), unit: "", tone: "text-foreground" },
    {
      k: "Audio Quality",
      v: telemetry.audio_quality,
      unit: "",
      tone: qualityTone[telemetry.audio_quality],
    },
    { k: "System", v: telemetry.system, unit: "", tone: systemTone[telemetry.system] },
  ];

  return (
    <section
      className="panel grid grid-cols-2 divide-border sm:grid-cols-3 lg:grid-cols-5 lg:divide-x"
      aria-label="Telemetry strip"
    >
      {cells.map((c) => (
        <div key={c.k} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="label-xs">{c.k}</span>
          <span className={cn("font-mono text-sm tabular-nums", c.tone)}>
            {c.v}
            {c.unit ? <span className="ml-1 text-muted-foreground">{c.unit}</span> : null}
          </span>
        </div>
      ))}
    </section>
  );
}
