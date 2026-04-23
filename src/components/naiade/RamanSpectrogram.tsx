import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Waves } from "lucide-react";
import type { SpectrogramPoint } from "@/hooks/useMockData";

export function RamanSpectrogram({ data }: { data: SpectrogramPoint[] }) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Raman Spectrogram Stream</span>
          <span className="ml-2 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-primary">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>λ 200–4000 cm⁻¹</span>
          <span className="text-primary">· refresh 80ms</span>
        </div>
      </div>

      <div className="relative h-[220px] w-full">
        {/* scanning overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-scan" />
        </div>
        {/* grid bg */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="ramanFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="x" hide />
            <YAxis hide domain={[0, 200]} />
            <Area
              type="monotone"
              dataKey="y"
              stroke="hsl(var(--primary))"
              strokeWidth={1.4}
              fill="url(#ramanFill)"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 font-mono text-[10px] text-muted-foreground">
        <span>graphene oxide membrane · sensor RM-04</span>
        <span className="text-primary">peaks detected: 4</span>
      </div>
    </Card>
  );
}
