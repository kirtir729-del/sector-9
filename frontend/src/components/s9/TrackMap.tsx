import { useEffect, useState } from "react";

type Props = {
  sector: string;
  lap: number;
  speed: number;
};

const PATH =
  "M60,150 C60,70 120,40 200,40 L300,40 C360,40 380,70 360,110 L330,160 C310,195 330,225 380,225 L470,225 C520,225 540,190 520,150 L500,110 C480,70 500,40 550,45 C610,52 620,110 590,150 L520,250 C490,290 440,300 380,300 L160,300 C90,300 60,250 60,150 Z";

export function TrackMap({ sector, lap, speed }: Props) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const loop = () => {
      frame = (frame + 0.0025) % 1;
      setT(frame);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="panel relative overflow-hidden p-5" aria-label="Track map">
      <div className="flex items-center justify-between">
        <h2 className="label-xs">Circuit Position</h2>
        <span className="font-mono text-xs text-muted-foreground">TELEMETRY LIVE</span>
      </div>

      <div className="mt-3 carbon-grid rounded-md border border-border bg-secondary/20">
        <svg viewBox="0 0 660 340" className="h-[220px] w-full" role="img" aria-label="Race track outline">
          <path
            d={PATH}
            fill="none"
            stroke="var(--color-track)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d={PATH}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeDasharray="10 14"
            opacity="0.7"
          />
          <path id="s9-line" d={PATH} fill="none" stroke="none" />
          <circle r="8" fill="var(--color-accent)">
            <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
              <mpath href="#s9-line" />
            </animateMotion>
          </circle>
          <circle r="16" fill="var(--color-accent)" opacity="0.25">
            <animateMotion dur="14s" repeatCount="indefinite">
              <mpath href="#s9-line" />
            </animateMotion>
          </circle>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { k: "Sector", v: sector },
          { k: "Lap", v: String(lap).padStart(2, "0") },
          { k: "Speed", v: `${speed} km/h` },
        ].map((x) => (
          <div key={x.k} className="rounded-sm border border-border bg-secondary/30 px-3 py-2">
            <p className="label-xs">{x.k}</p>
            <p className="mt-1 font-mono text-sm tabular-nums text-foreground">{x.v}</p>
          </div>
        ))}
      </div>
      <span className="sr-only">{Math.round(t * 100)}</span>
    </section>
  );
}
