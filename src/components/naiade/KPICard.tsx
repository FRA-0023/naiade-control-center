import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import type { KPIPoint } from "@/hooks/useMockData";

export function KPICard({
  label,
  unit,
  data,
  icon: Icon,
  decimals = 2,
  accent = "primary",
}: {
  label: string;
  unit: string;
  data: KPIPoint[];
  icon: LucideIcon;
  decimals?: number;
  accent?: "primary" | "accent" | "warning";
}) {
  const last = data[data.length - 1]?.v ?? 0;
  const prev = data[data.length - 2]?.v ?? last;
  const delta = last - prev;
  const up = delta >= 0;

  const color =
    accent === "primary" ? "hsl(var(--primary))" : accent === "accent" ? "hsl(var(--accent))" : "hsl(var(--warning))";

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/60 p-4 backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded border border-border/60"
            style={{ background: `${color.replace(")", " / 0.12)")}`, color }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <span
          className={`flex items-center gap-0.5 font-mono text-[10px] ${
            up ? "text-success" : "text-warning"
          }`}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(decimals)}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-3xl font-semibold tracking-tight" style={{ color }}>
            {last.toFixed(decimals)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`kpi-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#kpi-${label})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
