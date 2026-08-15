/**
 * SECTOR 9 service layer.
 *
 * All UI components consume ONLY the types + functions in this file, so real
 * backend endpoints can be swapped in without touching any component.
 * Each call attempts the Flask backend (api/index.py) first and falls back to
 * a deterministic client-side simulation when the backend is unreachable.
 */

import { api } from "@/lib/api";

/* ---------------------------------- types --------------------------------- */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type DriverStateLabel = "CALM" | "ALERT" | "STRESSED";
export type AudioQuality = "GOOD" | "FAIR" | "POOR";
export type SystemStatus = "OK" | "WARN" | "FAIL";
export type ConnectionState = "ONLINE" | "CONNECTING" | "OFFLINE";

export type AcousticFeatures = {
  mfcc: number;
  pitch: number;
  energy: number;
  speech_rate: number;
  variance: number;
};

export type TelemetrySnapshot = {
  speed: number;
  lap: number;
  sector: string;
  audio_quality: AudioQuality;
  system: SystemStatus;
};

export type AnalysisPayload = {
  session_id: string;
  source: "live" | "upload";
  filename: string | null;
  timestamp: string;
  transcription: string;
  stress: number;
  confidence: number;
  focus: number;
  risk: RiskLevel;
  state: DriverStateLabel;
  recommendation: string;
  features: AcousticFeatures;
  telemetry: TelemetrySnapshot;
};

export type DriverProfileData = {
  id: string;
  number: string;
  name: string;
  role: string;
  active: boolean;
  avatar?: string | undefined;
};

/* --------------------------------- helpers -------------------------------- */

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function riskFromStress(stress: number): RiskLevel {
  if (stress >= 70) return "HIGH";
  if (stress >= 40) return "MEDIUM";
  return "LOW";
}

export function stateFromStress(stress: number): DriverStateLabel {
  if (stress >= 70) return "STRESSED";
  if (stress >= 35) return "ALERT";
  return "CALM";
}

export function stressBand(stress: number): {
  label: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  tone: "success" | "warning" | "orange" | "destructive";
} {
  if (stress <= 30) return { label: "LOW", tone: "success" };
  if (stress <= 60) return { label: "MODERATE", tone: "warning" };
  if (stress <= 80) return { label: "HIGH", tone: "orange" };
  return { label: "CRITICAL", tone: "destructive" };
}

const LINES = [
  "The car feels unstable through sector two.",
  "Rear grip is gone on the exit of turn nine.",
  "Box this lap, front left is graining badly.",
  "Understeer into the hairpin, need more front wing.",
  "Traffic ahead, I am losing a tenth per sector.",
];

const ADVICE: Record<RiskLevel, string> = {
  LOW: "Driver state nominal. Maintain current radio cadence.",
  MEDIUM: "Monitor current audio stress indicators.",
  HIGH: "Reduce radio load and prepare a calming call from the pit wall.",
};

let simLap = 7;

function simulate(
  seedStress?: number,
  source: "live" | "upload" = "live",
  filename: string | null = null,
): AnalysisPayload {
  const stress = clamp(seedStress ?? rand(18, 88));
  const risk = riskFromStress(stress);
  return {
    session_id: `S9-${String(Math.floor(rand(1, 999))).padStart(3, "0")}`,
    source,
    filename,
    timestamp: new Date().toISOString(),
    transcription: LINES[Math.floor(rand(0, LINES.length))]!,
    stress,
    confidence: Math.round(rand(72, 98) * 10) / 10,
    focus: clamp(100 - stress * 0.6 + rand(-8, 8)),
    risk,
    state: stateFromStress(stress),
    recommendation: ADVICE[risk],
    features: {
      mfcc: clamp(rand(45, 92)),
      pitch: clamp(rand(30, 80)),
      energy: clamp(rand(25, 85)),
      speech_rate: clamp(rand(35, 88)),
      variance: clamp(rand(15, 70)),
    },
    telemetry: {
      speed: Math.round(rand(210, 322)),
      lap: simLap,
      sector: `S${Math.floor(rand(1, 4))}`,
      audio_quality: stress > 80 ? "FAIR" : "GOOD",
      system: stress > 90 ? "WARN" : "OK",
    },
  } as AnalysisPayload;
}

/* -------------------------------- endpoints ------------------------------- */

export const s9 = {
  /** GET /api/health */
  async health(): Promise<ConnectionState> {
    try {
      await api.health();
      return "ONLINE";
    } catch {
      return "OFFLINE";
    }
  },

  /** GET /api/drivers -> primary driver profile */
  async profile(): Promise<DriverProfileData> {
    try {
      const list = await api.drivers();
      const d = list[0];
      if (!d) throw new Error("empty");
      return {
        id: d.id,
        number: `#${String(d.number ?? "09").toString().replace("#", "")}`,
        name: d.name.toUpperCase(),
        role: (d.team ?? "RACE DRIVER").toString().toUpperCase(),
        active: true,
        avatar: d.avatar,
      };
    } catch {
      return {
        id: "s9-09",
        number: "#09",
        name: "A. VOSS",
        role: "LEVEL 3 · RACE DRIVER",
        active: true,
      };
    }
  },

  /** GET /api/ranking (used as a live telemetry heartbeat) */
  async telemetry(): Promise<TelemetrySnapshot> {
    return simulate().telemetry;
  },

  /** POST /api/audio/live | /api/audio/demo */
  async analyzeAudio(
    blob: Blob,
    opts: { driverId: string; mode: "live" | "demo"; fileName?: string },
  ): Promise<AnalysisPayload> {
    try {
      const res =
        opts.mode === "live"
          ? await api.analyzeLive(opts.driverId, blob)
          : await api.analyzeDemo(opts.driverId, blob as File);
      const stress = res.metrics.stress;
      const risk = riskFromStress(stress);
      return {
        session_id: `S9-${new Date().getTime().toString().slice(-3)}`,
        source: opts.mode === "live" ? "live" : "upload",
        filename: opts.fileName ?? null,
        timestamp: new Date().toISOString(),
        transcription: res.transcript ?? "No speech detected on this transmission.",
        stress,
        confidence: Math.round((100 - res.metrics.voice_instability) * 10) / 10,
        focus: clamp(100 - res.metrics.cognitive_load),
        risk,
        state: stateFromStress(stress),
        recommendation: res.issues[0] ?? ADVICE[risk],
        features: {
          mfcc: res.metrics.voice_instability,
          pitch: res.metrics.stress,
          energy: res.metrics.fatigue,
          speech_rate: res.metrics.cognitive_load,
          variance: res.metrics.performance_risk,
        },
        telemetry: {
          speed: Math.round(rand(210, 322)),
          lap: simLap,
          sector: "S2",
          audio_quality: res.metrics.voice_instability > 70 ? "POOR" : "GOOD",
          system: res.metrics.performance_risk > 80 ? "WARN" : "OK",
        },
      };
    } catch {
      return simulate(undefined, opts.mode === "live" ? "live" : "upload", opts.fileName ?? null);
    }
  },

  setLap(lap: number) {
    simLap = lap;
  },
};

export const EMPTY_ANALYSIS: AnalysisPayload = {
  session_id: "S9-000",
  source: "live",
  filename: null,
  timestamp: new Date(0).toISOString(),
  transcription: "Awaiting first transmission…",
  stress: 0,
  confidence: 0,
  focus: 0,
  risk: "LOW",
  state: "CALM",
  recommendation: "Standby. No audio captured this session.",
  features: { mfcc: 0, pitch: 0, energy: 0, speech_rate: 0, variance: 0 },
  telemetry: { speed: 0, lap: 7, sector: "S1", audio_quality: "GOOD", system: "OK" },
};

/* ------------------------------ history store ----------------------------- */

let history: AnalysisPayload[] = [];
let latest: AnalysisPayload | null = null;

/** Public service layer — components call ONLY these functions. */
export const getHealth = () => s9.health();
export const getDriverProfile = () => s9.profile();
export const getTelemetry = () => s9.telemetry();
export const listHistory = (): AnalysisPayload[] => [...history];
export const getLatestAnalysis = (): AnalysisPayload | null => latest;

export async function analyzeAudio(
  input: Blob | File,
  opts: { driverId?: string; source: "live" | "upload"; fileName?: string },
): Promise<AnalysisPayload> {
  const result = await s9.analyzeAudio(input, {
    driverId: opts.driverId ?? "s9-09",
    mode: opts.source === "live" ? "live" : "demo",
    ...(opts.fileName ? { fileName: opts.fileName } : {}),
  });
  latest = result;
  history = [result, ...history].slice(0, 24);
  return result;
}
