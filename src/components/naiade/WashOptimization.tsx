import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";

const features = [
  { name: "Raw Water Turbidity", weight: 0.34 },
  { name: "Temperature", weight: 0.27 },
  { name: "Recent CIP Effectiveness", weight: 0.22 },
  { name: "Pressure", weight: 0.17 },
];

export function WashOptimization({ value }: { value: number }) {
  const data = [{ name: "freq", value, fill: "hsl(var(--primary))" }];

  return (
    <BentoCard
      eyebrow="LIGHTGBM · XGBOOST"
      title="Wash Optimization"
      subtitle="Tree-based regression analyzing historical telemetry to maximize membrane lifespan."
      meta="every 38h"
      padded={false}
    >
      <div className="flex flex-col items-center p-4 pb-2 md:p-6 md:pb-2">
        <div className="relative h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="78%"
              outerRadius="100%"
              data={data}
              startAngle={220}
              endAngle={-40}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "hsl(var(--muted) / 0.4)" }} dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Only the large readout sits inside the donut hole */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="metric-hero text-foreground">
              42<span className="ml-0.5 text-base sm:text-lg text-muted-foreground">h</span>
            </span>
          </div>
        </div>
        {/* Label sits safely below the chart, not overlapping the ring */}
        <p className="mt-3 text-eyebrow text-center">AI RECOMMENDED WASH CYCLE</p>
        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-primary">
          <span className="h-1 w-1 rounded-full bg-primary animate-tick" />
          Next wash in {(12.5 - ((value % 10) * 0.1)).toFixed(1)}h
        </div>
      </div>

      <div className="space-y-2.5 border-t border-border/60 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Feature importance
        </div>
        <p className="text-xs text-muted-foreground -mt-1 mb-2">Factors driving this recommendation:</p>
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
