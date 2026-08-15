import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  s9,
  EMPTY_ANALYSIS,
  type AnalysisPayload,
  type ConnectionState,
  type DriverProfileData,
} from "@/lib/sector9";
import { TopBar } from "@/components/s9/TopBar";
import { DriverProfile } from "@/components/s9/DriverProfile";
import { TrackMap } from "@/components/s9/TrackMap";
import { LiveAudio, type RunState } from "@/components/s9/LiveAudio";
import { TelemetryStrip } from "@/components/s9/TelemetryStrip";
import { AudioIntelligence } from "@/components/s9/AudioIntelligence";
import { FeatureBars } from "@/components/s9/FeatureBars";
import { Transcription } from "@/components/s9/Transcription";
import { Recommendation } from "@/components/s9/Recommendation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sector 9 — F1 Driver Stress Command Dashboard" },
      {
        name: "description",
        content:
          "SECTOR 9 live race telemetry HUD: driver stress, confidence, focus, risk level and acoustic voice analysis from team radio audio.",
      },
      { property: "og:title", content: "Sector 9 — F1 Driver Stress Command Dashboard" },
      {
        property: "og:description",
        content:
          "AI command dashboard for Formula 1 driver-state monitoring: stress rings, acoustic features, transcription and pit-wall recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sector9,
});

function fmtSession(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mmm = Math.floor(ms % 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

function Sector9() {
  const [connection, setConnection] = useState<ConnectionState>("CONNECTING");
  const [driver, setDriver] = useState<DriverProfileData | null>(null);
  const [data, setData] = useState<AnalysisPayload>(EMPTY_ANALYSIS);
  const [fresh, setFresh] = useState(false);
  const [runState, setRunState] = useState<RunState>("IDLE");
  const [elapsed, setElapsed] = useState(0);
  const [sessionMs, setSessionMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* session clock */
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSessionMs(Date.now() - start), 37);
    return () => clearInterval(id);
  }, []);

  /* recording clock */
  useEffect(() => {
    if (runState !== "RECORDING") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [runState]);

  /* health + profile */
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const [state, profile] = await Promise.all([s9.health(), s9.profile()]);
      if (!alive) return;
      setConnection(state);
      setDriver(profile);
    };
    void poll();
    const id = setInterval(poll, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, []);

  const publish = useCallback((result: AnalysisPayload) => {
    setData(result);
    setFresh(true);
    setRunState("COMPLETE");
    setTimeout(() => setFresh(false), 600);
    if (result.risk === "HIGH") toast.warning("High driver-risk detected on team radio");
  }, []);

  const runPipeline = useCallback(
    async (blob: Blob, mode: "live" | "demo") => {
      setRunState("UPLOADING");
      await new Promise((r) => (simTimerRef.current = setTimeout(r, 900)));
      setRunState("ANALYZING");
      try {
        const result = await s9.analyzeAudio(blob, { driverId: driver?.id ?? "s9-09", mode });
        await new Promise((r) => (simTimerRef.current = setTimeout(r, 900)));
        publish(result);
      } catch (err) {
        setRunState("IDLE");
        toast.error(err instanceof Error ? err.message : "Analysis failed");
      }
    },
    [driver, publish],
  );

  async function start() {
    setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void runPipeline(blob, "live");
      };
      recorder.start();
      recorderRef.current = recorder;
      setRunState("RECORDING");
    } catch {
      // No mic access — run the simulated capture so the HUD flow still works.
      setRunState("RECORDING");
      simTimerRef.current = setTimeout(() => {
        void runPipeline(new Blob(), "live");
      }, 4000);
    }
  }

  function stop() {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setRunState("UPLOADING");
    } else {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
      void runPipeline(new Blob(), "live");
    }
  }

  function handleFile(file: File) {
    setElapsed(0);
    void runPipeline(file, "demo");
  }

  return (
    <div className="min-h-screen">
      <TopBar connection={connection} lap={data.telemetry.lap} sessionTime={fmtSession(sessionMs)} />

      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-5 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <DriverProfile driver={driver} sessionTime={fmtSession(sessionMs)} />
          <TrackMap
            sector={data.telemetry.sector}
            lap={data.telemetry.lap}
            speed={data.telemetry.speed}
          />
          <LiveAudio
            state={runState}
            elapsed={elapsed}
            onStart={start}
            onStop={stop}
            onFile={handleFile}
          />
        </div>

        <TelemetryStrip telemetry={data.telemetry} />
        <AudioIntelligence data={data} fresh={fresh} />

        <div className="grid gap-4 lg:grid-cols-2">
          <FeatureBars features={data.features} />
          <div className="space-y-4">
            <Transcription text={data.transcription} />
            <Recommendation text={data.recommendation} risk={data.risk} />
          </div>
        </div>
      </main>
    </div>
  );
}
