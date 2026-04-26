import { useEffect, useRef, useState } from "react";
import { getCompany, type CompanyId } from "@/lib/companies";

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

function genRamanFrame(
  prev: SpectrogramPoint[] | null,
  shift: number,
  peaks: { c: number; w: number; h: number }[]
): SpectrogramPoint[] {
  const shifted = peaks.map((p) => ({ c: p.c + shift, w: p.w, h: p.h }));
  return Array.from({ length: RAMAN_LEN }, (_, i) => {
    const base = 8 + Math.sin(i * 0.05 + Date.now() * 0.0003) * 4;
    const noise = rand(-3, 3);
    const peakSum = shifted.reduce((acc, p) => {
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

function seedDp(start: number, end: number): DPPoint[] {
  const arr: DPPoint[] = [];
  for (let i = 0; i < DP_LEN; i++) {
    const trend = start + (i / (DP_LEN - 1)) * (end - start);
    const noise = rand(-0.04, 0.04);
    arr.push({ t: i, dp: Math.max(0.5, trend + noise) });
  }
  return arr;
}

function seedBlocks(startHeight: number): Block[] {
  const arr: Block[] = [];
  let prev = shortHash(20);
  for (let i = 0; i < 8; i++) {
    const h = shortHash(20);
    arr.push({
      height: startHeight + i,
      ts: new Date(Date.now() - (8 - i) * 5000).toISOString().split("T")[1].replace("Z", ""),
      hash: h,
      prev,
      prediction: ["SAFE", "SAFE", "SAFE", "DRIFT_OK"][Math.floor(Math.random() * 4)],
      signature: shortHash(12),
    });
    prev = h;
  }
  return arr;
}

export function useMockData(companyId: CompanyId = "acme") {
  const company = getCompany(companyId);
  const b = company.baseline;
  // Keep a live ref to baseline so interval callbacks always read current company
  const baselineRef = useRef(b);
  baselineRef.current = b;

  const [raman, setRaman] = useState<SpectrogramPoint[]>(() => genRamanFrame(null, b.ramanShift));
  const [pressure, setPressure] = useState<KPIPoint[]>([]);
  const [flow, setFlow] = useState<KPIPoint[]>([]);
  const [conductivity, setConductivity] = useState<KPIPoint[]>([]);
  const [latency, setLatency] = useState<LatencyPoint[]>([]);
  const [dp, setDp] = useState<DPPoint[]>(() => seedDp(b.dpStart, b.dpEnd));
  const [anomaly, setAnomaly] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { t: nowStr(), level: "ok", msg: `Edge runtime online · ${company.node} · MobileNetV3 loaded` },
    { t: nowStr(), level: "info", msg: "Anomaly detector armed · 1,243,891 signatures" },
  ]);
  const [blocks, setBlocks] = useState<Block[]>(() => seedBlocks(b.blockHeightStart));
  const [federatedProgress, setFederatedProgress] = useState(0);
  const [rul, setRul] = useState(b.rul);
  const [washFreq, setWashFreq] = useState(b.washFreq);

  const tickRef = useRef(0);

  // Re-seed everything when the company changes (skip first mount; initial state already used baseline)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setRaman(genRamanFrame(null, b.ramanShift));
    setPressure([]);
    setFlow([]);
    setConductivity([]);
    setLatency([]);
    setDp(seedDp(b.dpStart, b.dpEnd));
    setBlocks(seedBlocks(b.blockHeightStart));
    setRul(b.rul);
    setWashFreq(b.washFreq);
    setAnomaly(false);
    setLogs([
      { t: nowStr(), level: "ok", msg: `Switched context → ${company.name} · ${company.node}` },
      { t: nowStr(), level: "info", msg: "Anomaly detector armed · 1,243,891 signatures" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Raman 50ms
  useEffect(() => {
    const id = setInterval(() => {
      setRaman((prev) => genRamanFrame(prev, baselineRef.current.ramanShift));
    }, 50);
    return () => clearInterval(id);
  }, []);

  // KPIs + latency 1s — driven by company baseline, clamped to thresholds
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      const bl = baselineRef.current;
      const th = company.thresholds;
      // Clamp helper: keep value comfortably inside [min, max] (5% inset)
      const clampInside = (v: number, min: number, max: number) => {
        const inset = (max - min) * 0.05;
        return Math.max(min + inset, Math.min(max - inset, v));
      };
      const pAmp = (th.pressure.max - th.pressure.min) * 0.18;
      const fAmp = (th.flow.max - th.flow.min) * 0.18;
      const cAmp = Math.max(2, (th.conductivity.max - th.conductivity.min) * 0.06);
      setPressure((p) => [...p, { t, v: clampInside(bl.pressure + Math.sin(t * 0.001) * pAmp + rand(-pAmp * 0.25, pAmp * 0.25), th.pressure.min, th.pressure.max) }].slice(-KPI_LEN));
      setFlow((p) => [...p, { t, v: clampInside(bl.flow + Math.cos(t * 0.0008) * fAmp + rand(-fAmp * 0.25, fAmp * 0.25), th.flow.min, th.flow.max) }].slice(-KPI_LEN));
      setConductivity((p) => [...p, { t, v: clampInside(bl.conductivity + Math.sin(t * 0.0005) * cAmp + rand(-cAmp * 0.4, cAmp * 0.4), th.conductivity.min, th.conductivity.max) }].slice(-KPI_LEN));
      setLatency((p) => [...p, { t, ms: bl.latencyMs + rand(0, 4) + (Math.random() < 0.05 ? 2 : 0) }].slice(-LATENCY_LEN));
    }, 1000);
    return () => clearInterval(id);
  }, [company]);

  // ΔP 5s + blockchain
  useEffect(() => {
    const id = setInterval(() => {
      setDp((p) => {
        const shifted = p.slice(1).map((pt, i) => ({ t: i, dp: pt.dp }));
        const lastT = shifted[shifted.length - 1]?.t ?? 0;
        const lastDp = shifted[shifted.length - 1]?.dp ?? 1.5;
        const cap = baselineRef.current.dpEnd + 0.05;
        const next = Math.min(cap, lastDp + rand(0.005, 0.025));
        return [...shifted, { t: lastT + 1, dp: next }];
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

  // Federated learning progress loop
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

  // Recurring inference log every 4s
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      const ms = (baselineRef.current.latencyMs + Math.random() * 4).toFixed(1);
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
    company,
  };
}
