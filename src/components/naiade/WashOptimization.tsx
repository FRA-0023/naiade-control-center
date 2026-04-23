import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Gauge } from "lucide-react";

const features = [
  { name: "Input quality", weight: 0.34 },
  { name: "Temperature", weight: 0.27 },
  { name: "Past washes", weight: 0.22 },
  { name: "Pressure", weight: 0.17 },
];

export function WashOptimization({ value }: { value: number }) {
  const data = [{ name: "freq", value, fill: "hsl(var(--primary))" }];

  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Wash Frequency Optimization</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">LightGBM · XGBoost</span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        <div className="relative h-[200px] border-b border-border/60 sm:border-b-0 sm:border-r">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={220} endAngle={-40}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold text-primary text-glow-primary">
              {Math.round(value)}
            </span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">% optimum</span>
            <span className="mt-1 font-mono text-[10px] text-muted-foreground">every 38h</span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Feature importance
          </div>
          {features.map((f) => (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/80">{f.name}</span>
                <span className="font-mono text-[10px] text-primary">{(f.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${f.weight * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
