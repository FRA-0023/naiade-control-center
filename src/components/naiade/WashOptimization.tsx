import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";

const features = [
  { name: "Input quality", weight: 0.34 },
  { name: "Temperature", weight: 0.27 },
  { name: "Past washes", weight: 0.22 },
  { name: "Pressure", weight: 0.17 },
];

export function WashOptimization({ value }: { value: number }) {
  const data = [{ name: "freq", value, fill: "hsl(var(--primary))" }];

  return (
    <BentoCard
      eyebrow="LIGHTGBM · XGBOOST"
      title="Wash Optimization"
      meta="every 38h"
      padded={false}
    >
      <div className="flex flex-col items-center p-6 pb-2">
        <div className="relative h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="74%"
              outerRadius="100%"
              data={data}
              startAngle={220}
              endAngle={-40}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "hsl(var(--muted) / 0.4)" }} dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
              {Math.round(value)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              % optimum
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-border/60 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Feature importance
        </div>
        {features.map((f) => (
          <div key={f.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/80">{f.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {(f.weight * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted/40">
              <div className="h-full rounded-full bg-primary" style={{ width: `${f.weight * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
