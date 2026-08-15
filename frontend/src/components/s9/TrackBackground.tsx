const PATH =
  "M80,520 C40,420 60,300 160,250 L420,130 C520,86 620,120 660,200 L740,360 C780,440 880,470 960,430 L1180,320 C1280,270 1380,300 1420,380 L1500,540 C1540,620 1500,700 1400,720 L360,720 C180,720 120,640 80,520 Z";

/** Ambient full-width circuit + animated car dot rendered behind all panels. */
export function TrackBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.14]"
      >
        <defs>
          <filter id="s9-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={PATH} fill="none" stroke="var(--color-track)" strokeWidth="26" strokeLinejoin="round" />
        <path
          d={PATH}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeDasharray="14 20"
        />
        <path id="s9-ambient-line" d={PATH} fill="none" stroke="none" />
      </svg>

      {/* car + trail, kept at higher opacity than the track itself */}
      <svg
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-60"
      >
        <path id="s9-car-line" d={PATH} fill="none" stroke="none" />
        <circle r="26" fill="var(--cyan)" opacity="0.1" filter="url(#s9-glow)">
          <animateMotion dur="22s" repeatCount="indefinite">
            <mpath href="#s9-car-line" />
          </animateMotion>
        </circle>
        <circle r="12" fill="var(--color-primary)" opacity="0.28">
          <animateMotion dur="22s" repeatCount="indefinite" begin="-0.45s">
            <mpath href="#s9-car-line" />
          </animateMotion>
        </circle>
        <circle r="5" fill="var(--cyan)">
          <animateMotion dur="22s" repeatCount="indefinite">
            <mpath href="#s9-car-line" />
          </animateMotion>
        </circle>
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent,oklch(0_0_0/0.65))]" />
    </div>
  );
}
