import { Area, AreaChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, PackageCheck } from "lucide-react";

function buildCurve(currentRul: number) {
  // Past degradation + future projection
  const arr: { t: number; v: number; future?: number }[] = [];
  for (let i = 0; i <= 40; i++) {
    const past = 100 - (100 - currentRul) * (i / 40) - Math.random() * 1.2;
    arr.push({ t: i, v: Math.max(currentRul, past) });
  }
  for (let i = 41; i <= 60; i++) {
    const future = currentRul - ((i - 40) / 20) * (currentRul - 8);
    arr.push({ t: i, v: NaN as unknown as number, future: Math.max(0, future) });
  }
  return arr;
}

export function RULPanel({ rul }: { rul: number }) {
  const data = buildCurve(rul);
  const critical = rul < 25;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Remaining Useful Life</span>
          <span className="ml-2 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
            LSTM
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">membrane GO-04</span>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Structural lifespan</div>
            <div className={`font-mono text-3xl font-bold ${critical ? "text-warning text-glow-destructive" : "text-primary"}`}>
              {rul.toFixed(1)}<span className="text-base text-muted-foreground"> %</span>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-muted-foreground">
            <div>est. replacement</div>
            <div className="text-foreground">{Math.round(rul * 1.4)}d</div>
          </div>
        </div>

        <Progress value={rul} className="mb-4 h-2" />

        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rulPast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rulFuture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis hide domain={[0, 100]} />
              <ReferenceLine y={15} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.6} />
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.6} fill="url(#rulPast)" isAnimationActive={false} dot={false} />
              <Area type="monotone" dataKey="future" stroke="hsl(var(--warning))" strokeDasharray="4 3" strokeWidth={1.6} fill="url(#rulFuture)" isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
          <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-warning">Supply chain</div>
            <div className="text-xs text-foreground">
              RUL trending toward 15% threshold ·{" "}
              <span className="font-semibold text-warning">spare parts dispatch armed</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
