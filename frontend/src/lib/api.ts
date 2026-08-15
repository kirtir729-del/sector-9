/**
 * Client for the Sector 9 Flask backend (api/index.py).
 * Base URL is same-origin by default; override with VITE_API_BASE_URL.
 */

const BASE = (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    ...(isForm ? {} : { headers: { "Content-Type": "application/json" } }),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "error" in data ? String((data as any).error) : "";
    const msg = detail || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

/* ---------------------------------- types --------------------------------- */

export type Driver = {
  id: string;
  name: string;
  team?: string | undefined;
  number?: number | string | undefined;
  country?: string | undefined;
  car?: string | undefined;
  avatar?: string | undefined;
  [key: string]: unknown;
};

export type Metrics = {
  stress: number;
  fatigue: number;
  voice_instability: number;
  cognitive_load: number;
  performance_risk: number;
};

export type Alert = {
  level: "critical" | "warning" | "info";
  message: string;
  timestamp?: string | undefined;
};

export type AnalysisResult = {
  driver_id?: string | undefined;
  metrics: Metrics;
  transcript?: string | undefined;
  issues: string[];
  alerts: Alert[];
  timestamp: string;
  raw: unknown;
};

export type RankingEntry = {
  driver_id: string;
  name: string;
  team?: string | undefined;
  stress: number;
  trend?: number | undefined;
};

export type Debrief = {
  summary: string;
  recommendations: string[];
  issues: string[];
  metrics?: Partial<Metrics> | undefined;
  raw: unknown;
};

/* ------------------------------- normalizers ------------------------------ */

const pct = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  const scaled = Math.abs(n) <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(scaled)));
};

const pick = (o: any, keys: string[]): unknown => {
  for (const k of keys) {
    if (o && typeof o === "object" && o[k] != null) return o[k];
  }
  return undefined;
};

function toMetrics(src: any): Metrics {
  const m = src?.metrics ?? src?.analysis ?? src ?? {};
  return {
    stress: pct(pick(m, ["stress", "stress_level", "stress_score"])),
    fatigue: pct(pick(m, ["fatigue", "fatigue_level", "fatigue_score"])),
    voice_instability: pct(
      pick(m, ["voice_instability", "instability", "voice_tremor", "vocal_instability"]),
    ),
    cognitive_load: pct(pick(m, ["cognitive_load", "mental_load", "load"])),
    performance_risk: pct(pick(m, ["performance_risk", "risk", "risk_score"])),
  };
}

function toStringList(v: unknown): string[] {
  if (Array.isArray(v))
    return v.map((i) =>
      typeof i === "string" ? i : String((i as any)?.message ?? (i as any)?.issue ?? JSON.stringify(i)),
    );
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

function toAlerts(v: unknown): Alert[] {
  if (!Array.isArray(v)) return [];
  return v.map((a: any) => {
    if (typeof a === "string") return { level: "info" as const, message: a };
    const raw = String(a?.level ?? a?.severity ?? "info").toLowerCase();
    const level: Alert["level"] =
      raw.includes("crit") || raw.includes("high") || raw.includes("danger")
        ? "critical"
        : raw.includes("warn") || raw.includes("medium")
          ? "warning"
          : "info";
    return { level, message: String(a?.message ?? a?.text ?? a?.alert ?? ""), timestamp: a?.timestamp };
  });
}

function toAnalysis(src: any): AnalysisResult {
  const body = src?.data ?? src ?? {};
  return {
    driver_id: body?.driver_id ?? body?.driver ?? undefined,
    metrics: toMetrics(body),
    transcript: body?.transcript ?? body?.text ?? undefined,
    issues: toStringList(body?.issues ?? body?.extracted_issues ?? body?.problems),
    alerts: toAlerts(body?.alerts ?? body?.pit_wall_alerts ?? body?.pitwall_alerts),
    timestamp: body?.timestamp ?? new Date().toISOString(),
    raw: src,
  };
}

/* -------------------------------- endpoints ------------------------------- */

export const api = {
  health: () => request<{ status?: string }>("/api/health"),

  async drivers(): Promise<Driver[]> {
    const res = await request<any>("/api/drivers");
    const list: any[] = Array.isArray(res) ? res : (res?.drivers ?? res?.data ?? []);
    return list.map((d, i) => ({
      ...d,
      id: String(d?.id ?? d?.driver_id ?? d?.code ?? i),
      name: String(d?.name ?? d?.driver_name ?? d?.full_name ?? `Driver ${i + 1}`),
      team: d?.team ?? d?.constructor ?? undefined,
      number: d?.number ?? d?.car_number ?? undefined,
    }));
  },

  async driver(id: string): Promise<Driver & { metrics?: Metrics | undefined }> {
    const res = await request<any>(`/api/drivers/${encodeURIComponent(id)}`);
    const d = res?.driver ?? res?.data ?? res ?? {};
    return {
      ...d,
      id: String(d?.id ?? d?.driver_id ?? id),
      name: String(d?.name ?? d?.driver_name ?? id),
      team: d?.team ?? d?.constructor ?? undefined,
      metrics: (d?.metrics ? toMetrics(d) : undefined) as Metrics | undefined,
    };
  },

  async analyzeLive(driverId: string, audio: Blob): Promise<AnalysisResult> {
    const form = new FormData();
    form.append("audio", audio, "live.webm");
    form.append("driver_id", driverId);
    return toAnalysis(await request<any>("/api/audio/live", { method: "POST", body: form }));
  },

  async analyzeDemo(driverId: string, file: File): Promise<AnalysisResult> {
    const form = new FormData();
    form.append("audio", file, file.name);
    form.append("file", file, file.name);
    form.append("driver_id", driverId);
    return toAnalysis(await request<any>("/api/audio/demo", { method: "POST", body: form }));
  },

  async ranking(): Promise<RankingEntry[]> {
    const res = await request<any>("/api/ranking");
    const list: any[] = Array.isArray(res) ? res : (res?.ranking ?? res?.drivers ?? res?.data ?? []);
    return list.map((r, i) => ({
      driver_id: String(r?.driver_id ?? r?.id ?? i),
      name: String(r?.name ?? r?.driver ?? `Driver ${i + 1}`),
      team: r?.team ?? undefined,
      stress: pct(pick(r, ["stress", "stress_level", "stress_score", "score"])),
      trend: typeof r?.trend === "number" ? r.trend : undefined,
    }));
  },

  async debrief(driverId: string): Promise<Debrief> {
    const res = await request<any>("/api/debrief", {
      method: "POST",
      body: JSON.stringify({ driver_id: driverId }),
    });
    const b = res?.debrief ?? res?.data ?? res ?? {};
    return {
      summary: String(b?.summary ?? b?.text ?? b?.debrief ?? "No summary returned."),
      recommendations: toStringList(b?.recommendations ?? b?.actions ?? b?.advice),
      issues: toStringList(b?.issues ?? b?.problems),
      metrics: b?.metrics ? toMetrics(b) : undefined,
      raw: res,
    };
  },
};
