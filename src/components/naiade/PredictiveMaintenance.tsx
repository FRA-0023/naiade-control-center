import { useEffect, useState } from "react";
import { Area, AreaChart, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Cpu } from "lucide-react";
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
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">CNN Predictive Maintenance</span>
          <span className="ml-2 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
            MobileNetV3
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">ΔP membrane · 24h</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="relative h-[260px] border-b border-border/60 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 grid-bg opacity-25" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dp} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis
                domain={[0.5, 2.5]}
                width={36}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceArea y1={1.5} y2={2.0} fill="hsl(var(--warning))" fillOpacity={0.08} stroke="hsl(var(--warning))" strokeOpacity={0.3} strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="dp"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#dpFill)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="absolute right-4 top-3 rounded border border-warning/40 bg-warning/10 px-2 py-1 font-mono text-[10px] text-warning">
            drift band · 0.3 – 0.5 bar
          </div>
          <div className="absolute bottom-3 left-4 font-mono text-[10px] text-muted-foreground">
            current ΔP · <span className="text-accent">{last.toFixed(2)} bar</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 glow-warning">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-warning">
                Biofouling forecast
              </span>
            </div>
            <div className="mt-1 text-sm text-foreground">
              Predicted in <span className="font-semibold text-warning">48–72h</span>
            </div>
            <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-warning text-glow-destructive">
              {countdown}
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              automated wash · scheduled · cycle #2891
            </div>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">model</span>
              <span>MobileNetV3-Small</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">params</span>
              <span>2.5M · int8</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">F1 (val)</span>
              <span className="text-success">0.947</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">last retrain</span>
              <span>06:14 UTC</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
