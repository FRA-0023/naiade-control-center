import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { BentoCard } from "./BentoCard";
import type { SpectrogramPoint } from "@/hooks/useMockData";
import type { Company } from "@/lib/companies";

export function RamanSpectrogram({
  data,
  company,
}: {
  data: SpectrogramPoint[];
  company: Company;
}) {
  const peakCount = company.spectralSignature.peaks.length;
  const matrix = company.spectralSignature.matrix;

  return (
    <BentoCard
      eyebrow="LIVE · 50ms"
      title="Raman Spectrogram"
      meta={`λ 200–4000 cm⁻¹ · sensor RM-04 · ${company.shortName}`}
      padded={false}
      className="flex-none"
    >
      <div className="flex flex-col gap-3 p-4 md:p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="metric-hero text-foreground">{peakCount}</span>
          <span className="text-unit">peaks detected</span>
          <span className="ml-auto font-mono text-[11px] sm:text-xs text-success">
            SPECTRAL MATCH
          </span>
        </div>
        <div className="text-eyebrow text-muted-foreground/70">
          {matrix} · 1.2M signatures · 50ms refresh
        </div>

        <div className="relative mt-1 block h-[240px] min-h-[240px] w-full shrink-0">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary/8 to-transparent animate-scan" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
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

        <div className="flex shrink-0 items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
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
