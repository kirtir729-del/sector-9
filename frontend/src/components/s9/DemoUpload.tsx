import { useRef, useState } from "react";
import { FolderOpen, FileAudio, Upload, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadedFile = {
  id: string;
  file: File;
  duration: number | null;
  peaks: number[];
};

const mkPeaks = (seed: string) =>
  Array.from({ length: 26 }, (_, i) => {
    const n = Math.abs(Math.sin((seed.charCodeAt(i % seed.length) + i * 7.3) / 3.1));
    return 20 + n * 80;
  });

function fmtDur(d: number | null) {
  if (d == null || !Number.isFinite(d)) return "--:--";
  return `${String(Math.floor(d / 60)).padStart(2, "0")}:${String(Math.floor(d % 60)).padStart(2, "0")}`;
}

export function DemoUpload({
  busy,
  activeId,
  onAnalyze,
  onAnalyzeAll,
}: {
  busy: boolean;
  activeId: string | null;
  onAnalyze: (f: LoadedFile) => void;
  onAnalyzeAll: (fs: LoadedFile[]) => void;
}) {
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dirRef = useRef<HTMLInputElement | null>(null);

  function add(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list).filter(
      (f) => f.type.startsWith("audio") || /\.(mp3|wav|m4a|ogg|webm|flac)$/i.test(f.name),
    );
    const mapped: LoadedFile[] = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      duration: null,
      peaks: mkPeaks(file.name || "s9"),
    }));
    setFiles((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...mapped.filter((m) => !seen.has(m.id))];
    });

    mapped.forEach((m) => {
      const url = URL.createObjectURL(m.file);
      const el = new Audio();
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        const d = el.duration;
        URL.revokeObjectURL(url);
        setFiles((prev) => prev.map((p) => (p.id === m.id ? { ...p, duration: d } : p)));
      };
      el.onerror = () => URL.revokeObjectURL(url);
      el.src = url;
    });
  }

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-sm border border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/10" : "border-border bg-secondary/20",
        )}
      >
        <Upload className="h-6 w-6 text-primary" aria-hidden />
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Drag & drop audio here
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 font-display text-[0.62rem] uppercase tracking-[0.2em] hover:border-primary hover:text-primary"
          >
            <FileAudio className="h-3.5 w-3.5" aria-hidden /> Choose Files
          </button>
          <button
            type="button"
            onClick={() => dirRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 font-display text-[0.62rem] uppercase tracking-[0.2em] hover:border-primary hover:text-primary"
          >
            <FolderOpen className="h-3.5 w-3.5" aria-hidden /> Choose Folder
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={dirRef}
          type="file"
          multiple
          className="sr-only"
          // @ts-expect-error non-standard directory picker attributes
          webkitdirectory=""
          directory=""
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="label-xs">Loaded · {files.length}</span>
        <button
          type="button"
          disabled={busy || files.length === 0}
          onClick={() => onAnalyzeAll(files)}
          className="rounded-sm speed-bar px-3 py-1.5 font-display text-[0.62rem] font-bold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-40"
        >
          Analyze All
        </button>
      </div>

      <ul className="mt-2 max-h-[178px] flex-1 space-y-2 overflow-y-auto pr-1">
        {files.length === 0 && (
          <li className="rounded-sm border border-border bg-secondary/20 px-3 py-4 text-center text-xs text-muted-foreground">
            No sample recordings loaded yet.
          </li>
        )}
        {files.map((f) => (
          <li
            key={f.id}
            className={cn(
              "flex items-center gap-3 rounded-sm border bg-secondary/20 px-3 py-2",
              activeId === f.id ? "border-primary/70" : "border-border",
            )}
          >
            <div className="flex h-7 w-20 shrink-0 items-end gap-[2px]">
              {f.peaks.map((p, i) => (
                <span
                  key={i}
                  className="w-[2px] rounded-full bg-cyan/70"
                  style={{ height: `${p}%` }}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-foreground">{f.file.name}</p>
              <p className="font-mono text-[0.65rem] text-muted-foreground">{fmtDur(f.duration)}</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAnalyze(f)}
              aria-label={`Analyze ${f.file.name}`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 font-display text-[0.6rem] uppercase tracking-[0.18em] hover:border-primary hover:text-primary disabled:opacity-40"
            >
              {busy && activeId === f.id ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : (
                <Play className="h-3 w-3" aria-hidden />
              )}
              Analyze
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
