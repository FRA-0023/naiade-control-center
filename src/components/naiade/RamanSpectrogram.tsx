import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { BentoCard } from "./BentoCard";
import type { SpectrogramPoint } from "@/hooks/useMockData";

export function RamanSpectrogram({ data }: { data: SpectrogramPoint[] }) {
  return (
    <BentoCard
      eyebrow="LIVE · 50ms"
      title="Raman Spectrogram"
      meta="λ 200–4000 cm⁻¹ · sensor RM-04"
      padded={false}
      className="h-full"
    >
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold tracking-tight text-foreground">4</span>
          <span className="text-[10px] text-muted-foreground">peaks · 50ms refresh</span>
          <span className="ml-auto font-mono text-[10px] text-success">SPECTRAL MATCH</span>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
          1.2M chemical signatures · sensor RM-04
        </div>

        <div className="w-full h-[220px] min-h-[220px] relative block mt-1">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary/8 to-transparent animate-scan" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 6, right: 6, left: 6, bottom: 12 }}>
              <defs>
                <linearGradient id="ramanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
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

        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
          <span>200 cm⁻¹</span>
          <span className="hidden sm:inline">1000</span>
          <span className="hidden sm:inline">2000</span>
          <span className="hidden sm:inline">3000</span>
          <span>4000 cm⁻¹</span>
        </div>
      </div>
    </BentoCard>
  );
}
