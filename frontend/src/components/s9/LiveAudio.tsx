import { useEffect, useRef, useState } from "react";
import { Mic, Square, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type RunState = "IDLE" | "RECORDING" | "UPLOADING" | "ANALYZING" | "COMPLETE";

type Props = {
  state: RunState;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onFile: (file: File) => void;
};

const BUTTON_LABEL: Record<RunState, string> = {
  IDLE: "Start Test",
  RECORDING: "Stop",
  UPLOADING: "Uploading…",
  ANALYZING: "Analyzing…",
  COMPLETE: "Start Test",
};

export function LiveAudio({ state, elapsed, onStart, onStop, onFile }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tick, setTick] = useState(0);
  const recording = state === "RECORDING";
  const busy = state === "UPLOADING" || state === "ANALYZING";

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, [recording]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <section className="panel flex flex-col p-5" aria-label="Live audio capture">
      <div className="flex items-center justify-between">
        <h2 className="label-xs">Live Audio</h2>
        <span className="font-mono text-xs text-muted-foreground">{state}</span>
      </div>

      <button
        type="button"
        onClick={recording ? onStop : onStart}
        disabled={busy}
        aria-label={recording ? "Stop recording" : "Start recording"}
        className={cn(
          "mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full border transition-all",
          recording
            ? "border-destructive/60 bg-destructive/15 text-destructive pulse-dot"
            : "border-primary/50 bg-primary/10 text-primary glow-primary hover:bg-primary/20",
          busy && "opacity-60",
        )}
      >
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        ) : recording ? (
          <Square className="h-7 w-7" aria-hidden />
        ) : (
          <Mic className="h-8 w-8" aria-hidden />
        )}
      </button>

      <div className="mt-5 flex h-16 items-center justify-center gap-1 rounded-sm border border-border bg-secondary/25 px-3">
        {recording ? (
          Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className="w-1 rounded-full speed-bar transition-all duration-100"
              style={{ height: `${18 + Math.abs(Math.sin((i + tick) / 2.4)) * 70}%` }}
            />
          ))
        ) : (
          <span className="h-px w-full bg-track" aria-hidden />
        )}
      </div>

      <p className="mt-3 text-center font-mono text-2xl tabular-nums">{mmss}</p>

      <button
        type="button"
        onClick={recording ? onStop : onStart}
        disabled={busy}
        className={cn(
          "mt-4 w-full rounded-sm px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.2em] transition-opacity disabled:opacity-60",
          recording
            ? "bg-destructive text-destructive-foreground"
            : "speed-bar text-primary-foreground",
        )}
      >
        {BUTTON_LABEL[state]}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy || recording}
        onClick={() => fileRef.current?.click()}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" aria-hidden /> Upload Audio File
      </button>
    </section>
  );
}
