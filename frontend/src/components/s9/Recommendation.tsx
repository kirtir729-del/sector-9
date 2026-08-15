import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/sector9";

const tone: Record<RiskLevel, string> = {
  LOW: "border-success/50 bg-success/10 text-success",
  MEDIUM: "border-warning/50 bg-warning/10 text-warning",
  HIGH: "border-destructive/50 bg-destructive/10 text-destructive",
};

export function Recommendation({ text, risk }: { text: string; risk: RiskLevel }) {
  return (
    <section className="panel p-5" aria-label="AI recommendation">
      <h2 className="label-xs">AI Recommendation</h2>
      <div className={cn("mt-3 flex gap-3 rounded-sm border p-4", tone[risk])}>
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
        <p className="text-sm leading-relaxed text-foreground">{text}</p>
      </div>
    </section>
  );
}
