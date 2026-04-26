import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, ReferenceArea, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { AlertTriangle, Info, Droplets } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DPPoint } from "@/hooks/useMockData";
import type { Company } from "@/lib/companies";

/** Format seconds as HH:MM:SS, allowing 3-digit hours for long forecasts. */
function formatHMS(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Format hours as a friendly window like "48h – 72h" or "8h – 12h". */
function formatWashWindow(hours: number) {
  if (!isFinite(hours) || hours <= 0) return "WASH NOW";
  // Show a ±25% window around the central forecast for realism.
  const low = Math.max(1, Math.round(hours * 0.85));
  const high = Math.max(low + 1, Math.round(hours * 1.2));
  return `${low}h – ${high}h`;
}

export function PredictiveMaintenance({
  dp,
  company,
}: {
  dp: DPPoint[];
  company: Company;
}) {
  const last = dp[dp.length - 1]?.dp ?? 0;
  const { dpWashThreshold, dpDriftPerHour } = company.baseline;

  // Dynamic time-to-wash in hours, based on remaining headroom and drift rate.
  const hoursToWash = useMemo(() => {
    const headroom = dpWashThreshold - last;
    if (headroom <= 0) return 0;
    return headroom / Math.max(0.0001, dpDriftPerHour);
  }, [last, dpWashThreshold, dpDriftPerHour]);

  // Live countdown (seconds) — re-seeded whenever the company or forecast jumps.
  const [secs, setSecs] = useState(() => Math.round(hoursToWash * 3600));
  const lastCompanyRef = useRef(company.id);
  useEffect(() => {
    // Reseed when switching company OR when forecast drifts >5% from countdown.
    const target = Math.round(hoursToWash * 3600);
    if (lastCompanyRef.current !== company.id) {
      lastCompanyRef.current = company.id;
      setSecs(target);
      return;
    }
    setSecs((prev) => {
      const drift = Math.abs(prev - target) / Math.max(1, target);
      return drift > 0.05 ? target : prev;
    });
  }, [company.id, hoursToWash]);

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = formatHMS(secs);
  const washWindow = formatWashWindow(hoursToWash);

  // Status: warning only when current ΔP actually breaches the company threshold.
  const isCritical = last >= dpWashThreshold;
  const isApproaching = !isCritical && last >= dpWashThreshold * 0.92;
  const statusClass = isCritical
    ? "text-warning"
    : isApproaching
    ? "text-warning"
    : "text-success";
  const statusLabel = isCritical
    ? "WASH REQUIRED"
    : isApproaching
    ? "APPROACHING WASH"
    : "NOMINAL";

  // Critical-zone reference area is anchored to the company-specific threshold,
  // not a hardcoded Acme baseline.
  const refY1 = dpWashThreshold;
  const refY2 = dpWashThreshold + Math.max(0.4, dpWashThreshold * 0.15);

  return (
    <BentoCard
      eyebrow="MOBILENETV3"
      title="Membrane Clogging (Fouling) Forecast"
      meta={`ΔP membrane · 24h · ${company.shortName}`}
      padded={false}
    >
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {/* TOP: header text + current value */}
        <div>
          <p className="mb-3 text-card-desc">
            MobileNetV3 analysis of Differential Pressure (ΔP) to predict when the membrane needs a chemical wash (CIP).
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="metric-hero text-foreground">{last.toFixed(2)}</span>
            <span className="text-unit">
              / {dpWashThreshold.toFixed(2)} bar · Current Clogging Level (ΔP)
            </span>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`ml-auto flex items-center gap-1 font-mono text-[10px] sm:text-[11px] transition-colors ${statusClass}`}
                  >
                    {statusLabel}
                    <Info className="h-3 w-3 opacity-70" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[260px] text-xs font-normal">
                  Drift rate {dpDriftPerHour.toFixed(3)} bar/h · CIP wash triggered at {dpWashThreshold.toFixed(2)} bar
                  for the {company.shortName} loop.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ACTIONABLE METRIC: Time to wash */}
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <Droplets className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex flex-col">
            <span className="text-eyebrow text-primary">
              Estimated Time to Wash
            </span>
            <span className="metric-stat text-foreground">
              {washWindow}
            </span>
          </div>
        </div>

        {/* MIDDLE: restricted-height chart */}
        <div className="relative w-full h-[210px] shrink-0 overflow-hidden min-w-0 pb-3">
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart data={dp} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dpWarnZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <ReferenceArea
                y1={refY1}
                y2={refY2}
                fill="url(#dpWarnZone)"
                stroke="hsl(var(--warning))"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
                label={{
                  value: "CRITICAL FOULING (WASH REQUIRED)",
                  position: "insideTopRight",
                  fill: "hsl(var(--warning))",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono, monospace",
                  opacity: 0.7,
                }}
              />
              <Area
                type="monotone"
                dataKey="dp"
                stroke="hsl(var(--primary))"
                strokeWidth={1.8}
                fill="url(#dpFill)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BOTTOM: 2-col grid */}
        <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div
            className={`rounded-lg border p-4 ${
              isCritical
                ? "border-warning/40 bg-warning/5"
                : "border-primary/30 bg-primary/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${isCritical ? "text-warning" : "text-primary"}`}
              />
              <span
                className={`text-eyebrow ${
                  isCritical ? "text-warning" : "text-primary"
                }`}
              >
                Wash Countdown
              </span>
            </div>
            <div
              className={`mt-2 metric-stat ${
                isCritical ? "text-warning" : "text-foreground"
              }`}
            >
              {countdown}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Forecast {washWindow} · automated CIP scheduled
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 self-stretch rounded-lg border border-border/50 bg-background/30 p-4 font-mono text-[10px]">
            <span className="text-muted-foreground">model</span>
            <span className="text-right text-foreground">MobileNetV3-S</span>
            <span className="text-muted-foreground">drift rate</span>
            <span className="text-right text-foreground">
              {dpDriftPerHour.toFixed(3)} bar/h
            </span>
            <span className="text-muted-foreground">F1 (val)</span>
            <span className="text-right text-success">0.947</span>
            <span className="text-muted-foreground">last retrain</span>
            <span className="text-right text-foreground">06:14 UTC</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
