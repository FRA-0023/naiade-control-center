import { Area, AreaChart, ReferenceLine, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, PackageCheck } from "lucide-react";
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

/** Convert remaining lifespan % into a friendly "X-Y Months" replacement window. */
function formatReplacementWindow(rul: number) {
  // Assume new membrane spec = 60 months (5 years) total life.
  const totalMonths = 60;
  const remaining = (rul / 100) * totalMonths;
  if (remaining <= 0) return "REPLACE NOW";
  const low = Math.max(1, Math.floor(remaining * 0.85));
  const high = Math.max(low + 1, Math.ceil(remaining * 1.15));
  return `${low}–${high} Months`;
}

export function RULPanel({ rul }: { rul: number }) {
  const data = buildCurve(rul);
  const critical = rul < 25;
  const replacementWindow = formatReplacementWindow(rul);
  const degradation = (100 - rul).toFixed(1);

  return (
    <BentoCard
      eyebrow="LONG-TERM FORECAST"
      title="Long-Term Component Degradation"
      subtitle="Predictive neural network analyzing historical performance trends to forecast the total lifespan of the physical membranes."
      meta="membrane GO-04"
      padded={false}
    >
      <div className="p-4 pb-3 md:p-6 md:pb-3">
        {/* Replacement window — the actionable headline */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex flex-col">
            <span className="text-eyebrow text-primary">Estimated Replacement</span>
            <span className="metric-stat text-foreground">{replacementWindow}</span>
          </div>
        </div>

        {/* Degradation readout */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={cn(
              "metric-hero",
              critical ? "text-warning" : "text-foreground"
            )}
          >
            {degradation}
          </span>
          <span className="text-unit">% Degradation · {rul.toFixed(1)}% life remaining</span>
          <span className="ml-auto font-mono text-[10px] sm:text-[11px] text-muted-foreground">
            ~{Math.round((rul / 100) * 1825).toLocaleString()}d
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
            <ReferenceLine
              y={15}
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{
                value: "REPLACE THRESHOLD",
                position: "insideTopRight",
                fill: "hsl(var(--destructive))",
                fontSize: 9,
                fontFamily: "JetBrains Mono, monospace",
                opacity: 0.7,
              }}
            />
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
            Spare membrane pre-ordered — automatic dispatch at 15% lifespan threshold
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
