import { Line, LineChart, ReferenceLine, ResponsiveContainer } from "recharts";
import { BentoCard } from "./BentoCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LatencyPoint, LogEntry } from "@/hooks/useMockData";

const levelStyles: Record<string, string> = {
  ok: "text-success",
  info: "text-muted-foreground",
  warn: "text-warning",
  error: "text-destructive",
};

export function AnomalyPanel({
  anomaly,
  latency,
  logs,
}: {
  anomaly: boolean;
  latency: LatencyPoint[];
  logs: LogEntry[];
}) {
  const [open, setOpen] = useState(true);
  const lastMs = latency[latency.length - 1]?.ms ?? 0;
  const avgMs = latency.length ? latency.reduce((a, p) => a + p.ms, 0) / latency.length : 0;

  return (
    <BentoCard
      eyebrow="EDGE · CNN"
      title="Anomaly Detection"
      meta="1.2M signatures"
      padded={false}
      className={cn(anomaly && "border-destructive/40")}
    >
      <div className="flex flex-col gap-5 p-6">
        <p className="-mt-2 text-sm font-light leading-snug text-muted-foreground">
          Real-time Raman spectra comparison against 1.2M chemical signatures for instant valve shutoff.
        </p>
        {/* Hero status */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border p-4",
            anomaly
              ? "border-destructive/40 bg-destructive/5 animate-pulse-glow"
              : "border-success/25 bg-success/5"
          )}
        >
          <div className="flex items-center gap-3">
            {anomaly ? (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-success" />
            )}
            <div className="flex flex-col leading-tight">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  anomaly ? "text-destructive" : "text-success"
                )}
              >
                System status
              </span>
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  anomaly ? "text-destructive" : "text-success"
                )}
              >
                {anomaly ? "ANOMALY" : "SAFE"}
              </span>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-muted-foreground">
            <div>scanning</div>
            <div className="text-foreground">1,243,891</div>
            <div>signatures</div>
          </div>
        </div>

        {/* Latency stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Latency" value={lastMs.toFixed(1)} unit="ms" tone="primary" />
          <Stat label="Avg 30s" value={avgMs.toFixed(1)} unit="ms" />
          <Stat label="Target" value="<10" unit="ms" tone="success" />
        </div>

        {/* Latency chart */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latency} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <ReferenceLine y={10} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Line
                type="monotone"
                dataKey="ms"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                isAnimationActive={false}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collapsible event log */}
      <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border/60">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-muted/20">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            Inference event log
            <span className="text-muted-foreground/60">· {logs.length}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="max-h-64 overflow-y-auto bg-black/40 px-6 pb-4 pt-2 font-mono text-[11px] leading-relaxed">
            {[...logs].reverse().map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground/50">{l.t}</span>
                <span className={cn("shrink-0", levelStyles[l.level])}>
                  [{l.level.toUpperCase().padEnd(5)}]
                </span>
                <span className="text-foreground/80">{l.msg}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </BentoCard>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "primary" | "success";
}) {
  const toneClass =
    tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-lg border border-border/50 bg-background/30 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-semibold", toneClass)}>
        {value}
        <span className="ml-1 text-[10px] font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
