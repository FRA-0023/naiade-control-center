import { useEffect, useRef, useState } from "react";

export type SpectrogramPoint = { x: number; y: number };
export type KPIPoint = { t: number; v: number };
export type DPPoint = { t: number; dp: number };
export type LatencyPoint = { t: number; ms: number };
export type LogEntry = { t: string; level: "info" | "warn" | "error" | "ok"; msg: string };
export type Block = {
  height: number;
  ts: string;
  hash: string;
  prev: string;
  prediction: string;
  signature: string;
};

const RAMAN_LEN = 180;
const KPI_LEN = 60;
const DP_LEN = 80;
const LATENCY_LEN = 30;
const LOG_LEN = 40;
const BLOCK_LEN = 30;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function genRamanFrame(prev: SpectrogramPoint[] | null): SpectrogramPoint[] {
  const peaks = [
    { c: 30, w: 8, h: 60 },
    { c: 70, w: 12, h: 90 },
    { c: 110, w: 6, h: 50 },
    { c: 145, w: 18, h: 75 },
  ];
  return Array.from({ length: RAMAN_LEN }, (_, i) => {
    const base = 8 + Math.sin(i * 0.05 + Date.now() * 0.0003) * 4;
    const noise = rand(-3, 3);
    const peakSum = peaks.reduce((acc, p) => {
      const d = i - p.c;
      return acc + p.h * Math.exp(-(d * d) / (2 * p.w * p.w));
    }, 0);
    const drift = prev ? prev[i].y * 0.15 : 0;
    return { x: i, y: Math.max(0, base + noise + peakSum * (0.85 + Math.random() * 0.3) + drift * 0) };
  });
}

function shortHash(len = 16) {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

function nowStr() {
  const d = new Date();
  return d.toLocaleTimeString("en-GB", { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
}

export function useMockData() {
  const [raman, setRaman] = useState<SpectrogramPoint[]>(() => genRamanFrame(null));
  const [pressure, setPressure] = useState<KPIPoint[]>([]);
  const [flow, setFlow] = useState<KPIPoint[]>([]);
  const [conductivity, setConductivity] = useState<KPIPoint[]>([]);
  const [latency, setLatency] = useState<LatencyPoint[]>([]);
  const [dp, setDp] = useState<DPPoint[]>(() => {
    const arr: DPPoint[] = [];
    let v = 1.2;
    for (let i = 0; i < DP_LEN; i++) {
      v += rand(-0.02, 0.035);
      arr.push({ t: i, dp: Math.max(0.5, v) });
    }
    return arr;
  });
  const [anomaly, setAnomaly] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { t: nowStr(), level: "ok", msg: "Edge runtime online · MobileNetV3 loaded" },
    { t: nowStr(), level: "info", msg: "Anomaly detector armed · 1,243,891 signatures" },
  ]);
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const arr: Block[] = [];
    let prev = shortHash(20);
    for (let i = 0; i < 8; i++) {
      const h = shortHash(20);
      arr.push({
        height: 184_201 + i,
        ts: new Date(Date.now() - (8 - i) * 5000).toISOString().split("T")[1].replace("Z", ""),
        hash: h,
        prev,
        prediction: ["SAFE", "SAFE", "SAFE", "DRIFT_OK"][Math.floor(Math.random() * 4)],
        signature: shortHash(12),
      });
      prev = h;
    }
    return arr;
  });
  const [federatedProgress, setFederatedProgress] = useState(0);
  const [rul, setRul] = useState(62);
  const [washFreq, setWashFreq] = useState(74);

  const ramanRef = useRef(raman);
  ramanRef.current = raman;
  const tickRef = useRef(0);

  // Raman 50ms
  useEffect(() => {
    const id = setInterval(() => {
      setRaman((prev) => genRamanFrame(prev));
    }, 50);
    return () => clearInterval(id);
  }, []);

  // KPIs + latency 1s
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setPressure((p) => [...p, { t, v: 2.4 + Math.sin(t * 0.001) * 0.3 + rand(-0.05, 0.05) }].slice(-KPI_LEN));
      setFlow((p) => [...p, { t, v: 1.8 + Math.cos(t * 0.0008) * 0.2 + rand(-0.04, 0.04) }].slice(-KPI_LEN));
      setConductivity((p) => [...p, { t, v: 420 + Math.sin(t * 0.0005) * 30 + rand(-8, 8) }].slice(-KPI_LEN));
      setLatency((p) => [...p, { t, ms: 4 + rand(0, 4) + (Math.random() < 0.05 ? 2 : 0) }].slice(-LATENCY_LEN));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ΔP 5s + blockchain
  useEffect(() => {
    const id = setInterval(() => {
      setDp((p) => {
        const last = p[p.length - 1]?.dp ?? 1.2;
        return [...p, { t: (p[p.length - 1]?.t ?? 0) + 1, dp: Math.min(2.2, last + rand(-0.01, 0.03)) }].slice(-DP_LEN);
      });
      setBlocks((p) => {
        const last = p[p.length - 1];
        const h = shortHash(20);
        const newBlock: Block = {
          height: last.height + 1,
          ts: new Date().toISOString().split("T")[1].replace("Z", ""),
          hash: h,
          prev: last.hash,
          prediction: Math.random() < 0.92 ? "SAFE" : "DRIFT_OK",
          signature: shortHash(12),
        };
        return [...p, newBlock].slice(-BLOCK_LEN);
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Federated learning 100ms progress loop
  useEffect(() => {
    const id = setInterval(() => {
      setFederatedProgress((p) => (p >= 100 ? 0 : p + 1.5));
    }, 200);
    return () => clearInterval(id);
  }, []);

  // RUL slow degradation + wash freq jitter
  useEffect(() => {
    const id = setInterval(() => {
      setRul((r) => Math.max(15, r - 0.05));
      setWashFreq((w) => Math.max(60, Math.min(92, w + rand(-0.6, 0.6))));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Scripted timeline: anomaly + log events
  useEffect(() => {
    const events: Array<{ at: number; run: () => void }> = [
      {
        at: 6000,
        run: () =>
          setLogs((l) =>
            [
              ...l,
              { t: nowStr(), level: "info" as const, msg: "Inference cycle 8.2 ms · within target (<10 ms)" },
            ].slice(-LOG_LEN)
          ),
      },
      {
        at: 12000,
        run: () => {
          setAnomaly(true);
          setLogs((l) =>
            [
              ...l,
              { t: nowStr(), level: "error" as const, msg: "ANOMALY · spectral signature deviates 4.2σ" },
              { t: nowStr(), level: "warn" as const, msg: "BYPASS_VALVE_03 → CLOSED in 9.4 ms" },
              { t: nowStr(), level: "warn" as const, msg: "Sample isolated · operator notified" },
            ].slice(-LOG_LEN)
          );
        },
      },
      {
        at: 22000,
        run: () => {
          setAnomaly(false);
          setLogs((l) =>
            [
              ...l,
              { t: nowStr(), level: "ok" as const, msg: "Stream stabilized · re-opening flow" },
              { t: nowStr(), level: "info" as const, msg: "Federated round #2814 · weights pushed (4.3 MB)" },
            ].slice(-LOG_LEN)
          );
        },
      },
      {
        at: 32000,
        run: () =>
          setLogs((l) =>
            [
              ...l,
              { t: nowStr(), level: "warn" as const, msg: "RUL trending → supply chain dispatch armed" },
            ].slice(-LOG_LEN)
          ),
      },
    ];
    const timers = events.map((e) => setTimeout(e.run, e.at));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Recurring inference log every 4s
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      const ms = (4 + Math.random() * 4).toFixed(1);
      setLogs((l) =>
        [
          ...l,
          { t: nowStr(), level: "ok" as const, msg: `Inference #${tickRef.current.toString().padStart(5, "0")} · ${ms} ms · class=SAFE` },
        ].slice(-LOG_LEN)
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return {
    raman,
    pressure,
    flow,
    conductivity,
    latency,
    dp,
    anomaly,
    logs,
    blocks,
    federatedProgress,
    rul,
    washFreq,
  };
}
