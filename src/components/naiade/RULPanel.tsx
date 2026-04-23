import { Area, AreaChart, ReferenceLine, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { Progress } from "@/components/ui/progress";
import { PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function buildCurve(currentRul: number) {
  const arr: { t: number; v: number; future?: number }[] = [];
  for (let i = 0; i <= 40; i++) {
    const past = 100 - (100 - currentRul) * (i / 40) - Math.random() * 1.2;
    arr.push({ t: i, v: Math.max(currentRul, past) });
  }
  for (let i = 41; i <= 60; i++) {
    const future = currentRul - ((i - 40) / 20) * (currentRul - 8);
    arr.push({ t: i, v: NaN as unknown as number, future: Math.max(0, future) });
  }
  return arr;
}

export function RULPanel({ rul }: { rul: number }) {
  const data = buildCurve(rul);
  const critical = rul < 25;

  return (
    <BentoCard
      eyebrow="LSTM"
      title="Remaining Useful Life"
      subtitle="Global time-series forecasting (LSTM) predicting structural degradation to automate supply chain."
      meta="membrane GO-04"
      padded={false}
    >
      <div className="p-6 pb-3">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-mono text-4xl font-bold tracking-tight",
              critical ? "text-warning" : "text-foreground"
            )}
          >
            {rul.toFixed(1)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">% lifespan</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            est. {Math.round(rul * 1.4)}d
          </span>
        </div>
        <Progress value={rul} className="mt-3 h-1" />
      </div>

      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="rulPast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rulFuture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceLine y={15} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="v"
              stroke="hsl(var(--primary))"
              strokeWidth={1.6}
              fill="url(#rulPast)"
              isAnimationActive={false}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="future"
              stroke="hsl(var(--warning))"
              strokeDasharray="4 3"
              strokeWidth={1.6}
              fill="url(#rulFuture)"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="m-6 mt-2 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4">
        <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-warning">
            Supply chain
          </div>
          <div className="mt-0.5 text-xs text-foreground">
            Trending toward 15% threshold — spare parts dispatch armed
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
