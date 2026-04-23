import { useEffect, useState } from "react";
import { Area, AreaChart, ReferenceArea, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DPPoint } from "@/hooks/useMockData";

function useCountdown(initialHours: number) {
  const [secs, setSecs] = useState(initialHours * 3600);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PredictiveMaintenance({ dp }: { dp: DPPoint[] }) {
  const countdown = useCountdown(58);
  const last = dp[dp.length - 1]?.dp ?? 0;

  return (
    <BentoCard
      eyebrow="MOBILENETV3"
      title="CNN Predictive Maintenance"
      meta="ΔP membrane · 24h"
      padded={false}
    >
      <div className="flex flex-col gap-4 p-6">
        {/* TOP: header text + current value */}
        <div>
          <p className="mb-3 text-sm font-light leading-snug text-muted-foreground">
            MobileNetV3 analysis of ΔP (differential pressure) trend to forecast membrane biofouling 48–72h in advance.
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
              {last.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">bar · current ΔP</span>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="ml-auto flex items-center gap-1 font-mono text-[10px] text-warning transition-colors hover:text-warning/80"
                  >
                    DRIFT 0.3–0.5
                    <Info className="h-3 w-3 text-warning/70" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[240px] text-xs font-normal">
                  A drift of 0.3–0.5 bar in differential pressure triggers the automated preventative wash cycle.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* MIDDLE: restricted-height chart */}
        <div className="relative h-64 max-h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={240}>
            <AreaChart data={dp} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
                y1={1.8}
                y2={2.2}
                fill="url(#dpWarnZone)"
                stroke="hsl(var(--warning))"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
                label={{
                  value: "WARNING ZONE",
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
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-warning">
                Biofouling forecast
              </span>
            </div>
            <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-warning">
              {countdown}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Predicted in 48–72h · automated wash scheduled
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 self-stretch rounded-lg border border-border/50 bg-background/30 p-4 font-mono text-[10px]">
            <span className="text-muted-foreground">model</span>
            <span className="text-right text-foreground">MobileNetV3-S</span>
            <span className="text-muted-foreground">params</span>
            <span className="text-right text-foreground">1.2M · int8</span>
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
