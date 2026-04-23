import { Line, LineChart, ReferenceLine, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, ShieldCheck, Zap } from "lucide-react";
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
  const lastMs = latency[latency.length - 1]?.ms ?? 0;
  const avgMs = latency.length ? latency.reduce((a, p) => a + p.ms, 0) / latency.length : 0;

  return (
    <Card className="flex flex-col overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          {anomaly ? (
            <ShieldAlert className="h-4 w-4 text-destructive" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-success" />
          )}
          <span className="text-sm font-medium">Anomaly Detection</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">CNN · isolation forest</span>
      </div>

      <div className="space-y-4 p-4">
        <div
          className={`relative overflow-hidden rounded-lg border p-4 ${
            anomaly
              ? "border-destructive/50 bg-destructive/10 animate-pulse-glow"
              : "border-success/30 bg-success/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`font-mono text-[10px] uppercase tracking-widest ${
                  anomaly ? "text-destructive" : "text-success"
                }`}
              >
                System status
              </div>
              <div
                className={`mt-1 text-2xl font-bold tracking-tight ${
                  anomaly ? "text-destructive text-glow-destructive" : "text-success text-glow-success"
                }`}
              >
                {anomaly ? "ANOMALY DETECTED" : "SAFE"}
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-muted-foreground">
              <div>1,243,891</div>
              <div>chemical signatures</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Scanning against 1.2M chemical signatures · convolutional inference @ edge
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border/60 bg-muted/20 p-2">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Latency</div>
            <div className="font-mono text-lg font-semibold text-primary">{lastMs.toFixed(1)}<span className="text-xs text-muted-foreground"> ms</span></div>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-2">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Avg 30s</div>
            <div className="font-mono text-lg font-semibold">{avgMs.toFixed(1)}<span className="text-xs text-muted-foreground"> ms</span></div>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-2">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Target</div>
            <div className="font-mono text-lg font-semibold text-success">&lt; 10<span className="text-xs text-muted-foreground"> ms</span></div>
          </div>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latency} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <ReferenceLine y={10} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.5} />
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

      <div className="border-t border-border/60 bg-deep/40">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Inference event log
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">{logs.length} entries</span>
        </div>
        <ScrollArea className="h-44">
          <div className="space-y-0.5 px-4 pb-3 font-mono text-[11px]">
            {[...logs].reverse().map((l, i) => (
              <div key={i} className="flex gap-2 leading-tight">
                <span className="shrink-0 text-muted-foreground/60">{l.t}</span>
                <span className={`shrink-0 ${levelStyles[l.level]}`}>
                  [{l.level.toUpperCase().padEnd(5)}]
                </span>
                <span className="text-foreground/80">{l.msg}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
