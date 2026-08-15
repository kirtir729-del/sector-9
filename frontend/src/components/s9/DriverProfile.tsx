import { User } from "lucide-react";
import type { DriverProfileData } from "@/lib/sector9";

type Props = {
  driver: DriverProfileData | null;
  sessionTime: string;
};

export function DriverProfile({ driver, sessionTime }: Props) {
  return (
    <section className="panel p-5" aria-label="Driver profile">
      <h2 className="label-xs">Driver Profile</h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute inset-0 rounded-full speed-bar opacity-80" />
          <div className="absolute inset-[2px] flex items-center justify-center overflow-hidden rounded-full bg-card">
            {driver?.avatar ? (
              <img src={driver.avatar} alt={driver.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" aria-hidden />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-display text-3xl font-bold leading-none text-primary">
            {driver?.number ?? "#--"}
          </p>
          <p className="mt-1 truncate font-display text-lg font-semibold tracking-wide">
            {driver?.name ?? "AWAITING DRIVER"}
          </p>
          <p className="mt-0.5 truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {driver?.role ?? "—"}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 border-t border-border pt-4 text-xs">
        <div className="flex items-center justify-between">
          <dt className="label-xs">Status</dt>
          <dd className="inline-flex items-center gap-1.5 font-display uppercase tracking-widest text-success">
            <span className="h-2 w-2 rounded-full bg-success pulse-dot" aria-hidden /> Active
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="label-xs">Session time</dt>
          <dd className="font-mono tabular-nums text-foreground">{sessionTime}</dd>
        </div>
      </dl>
    </section>
  );
}
