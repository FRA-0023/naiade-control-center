import { useEffect, useState } from "react";
import { Area, AreaChart, ReferenceArea, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { AlertTriangle } from "lucide-react";
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
      <div className="p-6 pb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
            {last.toFixed(2)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">bar · current ΔP</span>
          <span className="ml-auto font-mono text-[10px] text-warning">DRIFT 0.3–0.5</span>
        </div>
      </div>

      <div className="relative h-[200px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dp} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <defs>
              <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceArea
              y1={1.5}
              y2={2.0}
              fill="hsl(var(--warning))"
              fillOpacity={0.06}
              stroke="hsl(var(--warning))"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
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

      <div className="grid gap-4 p-6 pt-2 md:grid-cols-2">
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-warning">
              Biofouling forecast
            </span>
          </div>
          <div className="mt-2 font-mono text-3xl font-bold tracking-tight text-warning">
            {countdown}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Predicted in 48–72h · automated wash scheduled
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 self-center rounded-lg border border-border/50 bg-background/30 p-4 font-mono text-[10px]">
          <span className="text-muted-foreground">model</span>
          <span className="text-right text-foreground">MobileNetV3-S</span>
          <span className="text-muted-foreground">params</span>
          <span className="text-right text-foreground">2.5M · int8</span>
          <span className="text-muted-foreground">F1 (val)</span>
          <span className="text-right text-success">0.947</span>
          <span className="text-muted-foreground">last retrain</span>
          <span className="text-right text-foreground">06:14 UTC</span>
        </div>
      </div>
    </BentoCard>
  );
}
