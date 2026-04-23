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
  warnRange,
}: {
  label: string;
  unit: string;
  data: KPIPoint[];
  icon: LucideIcon;
  decimals?: number;
  target?: string;
  targetValue?: number;
  warnRange?: [number, number];
}) {
  const last = data[data.length - 1]?.v ?? 0;
  const prev = data[data.length - 2]?.v ?? last;
  const delta = last - prev;
  const up = delta >= 0;

  const outOfRange = warnRange ? last < warnRange[0] || last > warnRange[1] : false;
  const strokeColor = outOfRange ? "hsl(var(--warning))" : "hsl(var(--primary))";
  const valueClass = outOfRange ? "text-warning" : "text-foreground";
  const gradId = `kpi-${label.replace(/\s+/g, "-")}-${outOfRange ? "warn" : "ok"}`;

  return (
    <BentoCard padded={false} className="h-full">
      <div className="flex h-full flex-col justify-between p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className={cn("h-3.5 w-3.5", outOfRange && "text-warning")} />
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

        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className={cn("font-mono text-2xl font-bold leading-none tracking-tight", valueClass)}>
            {last.toFixed(decimals)}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{unit}</span>
        </div>

        {target && (
          <span className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">{target}</span>
        )}

        <div className="w-full h-[70px] mt-2 block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 15 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
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
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
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
