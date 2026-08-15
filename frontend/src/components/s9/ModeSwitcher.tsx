import { cn } from "@/lib/utils";

export type Mode = "live" | "upload";

export function ModeSwitcher({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}) {
  const tabs: { id: Mode; label: string }[] = [
    { id: "live", label: "Live Test" },
    { id: "upload", label: "Demo / Upload" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Analysis mode"
      className="grid grid-cols-2 gap-1 rounded-sm border border-border bg-secondary/30 p-1"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={mode === t.id}
          disabled={disabled}
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-sm px-3 py-2 font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] transition-all disabled:opacity-50",
            mode === t.id
              ? "speed-bar text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
