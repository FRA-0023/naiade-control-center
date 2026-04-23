import { Area, AreaChart, ReferenceLine, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPIPoint } from "@/hooks/useMockData";

export function KPICard({
  label,
  unit,
  data,
  icon: Icon,
  decimals = 2,
  target,
  targetValue,
}: {
  label: string;
  unit: string;
  data: KPIPoint[];
  icon: LucideIcon;
  decimals?: number;
  target?: string;
  targetValue?: number;
}) {
  const last = data[data.length - 1]?.v ?? 0;
  const prev = data[data.length - 2]?.v ?? last;
  const delta = last - prev;
  const up = delta >= 0;

  return (
    <BentoCard padded={false} className="h-full">
      <div className="flex h-full flex-col px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
          </div>
          <span
            className={cn(
              "flex items-center gap-0.5 font-mono text-[10px]",
              up ? "text-success" : "text-warning"
            )}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(decimals)}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-3xl font-bold leading-none tracking-tight text-foreground">
            {last.toFixed(decimals)}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{unit}</span>
        </div>

        {target && (
          <span className="mt-1 font-mono text-[10px] text-muted-foreground/60">{target}</span>
        )}

        <div className="mt-auto h-10 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`kpi-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              {targetValue !== undefined && (
                <ReferenceLine
                  y={targetValue}
                  stroke="hsl(var(--foreground))"
                  strokeOpacity={0.1}
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                />
              )}
              <Area
                type="monotone"
                dataKey="v"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill={`url(#kpi-${label})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </BentoCard>
  );
}
