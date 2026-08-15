import { cn } from "@/lib/utils";
import type { ConnectionState } from "@/lib/sector9";

type Props = {
  connection: ConnectionState;
  lap: number;
  sessionTime: string;
};

const tone: Record<ConnectionState, string> = {
  ONLINE: "border-success/50 bg-success/10 text-success",
  CONNECTING: "border-warning/50 bg-warning/10 text-warning",
  OFFLINE: "border-destructive/50 bg-destructive/10 text-destructive",
};

const dot: Record<ConnectionState, string> = {
  ONLINE: "bg-success",
  CONNECTING: "bg-warning",
  OFFLINE: "bg-destructive",
};

export function TopBar({ connection, lap, sessionTime }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm speed-bar font-display text-sm font-bold text-primary-foreground">
            S9
          </span>
          <span className="font-display text-lg font-bold tracking-[0.3em]">SECTOR 9</span>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[0.68rem] uppercase tracking-[0.2em]",
            tone[connection],
          )}
        >
          <span className={cn("h-2 w-2 rounded-full pulse-dot", dot[connection])} aria-hidden />
          System {connection}
        </span>

        <span className="ml-auto flex items-center gap-6">
          <span className="hud-readout">
            <span className="label-xs">Lap</span>
            <span className="font-mono text-base tabular-nums text-foreground">
              {String(lap).padStart(2, "0")}
            </span>
          </span>
          <span className="hud-readout">
            <span className="label-xs">Session</span>
            <span className="font-mono text-base tabular-nums text-accent">{sessionTime}</span>
          </span>
        </span>
      </div>
      <div className="h-px w-full speed-bar opacity-60" />
    </header>
  );
}
