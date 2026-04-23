import { BentoCard } from "./BentoCard";
import { cn } from "@/lib/utils";

const sensors = [
  { id: "RM-04", label: "Raman", status: "ok" },
  { id: "PR-12", label: "Pressure", status: "ok" },
  { id: "FL-07", label: "Flow", status: "ok" },
  { id: "EC-03", label: "Conductivity", status: "drift" },
  { id: "TM-09", label: "Temperature", status: "ok" },
  { id: "PH-02", label: "pH", status: "ok" },
  { id: "TB-05", label: "Turbidity", status: "ok" },
  { id: "OX-01", label: "Dissolved O₂", status: "offline" },
];

const statusStyles: Record<string, { ring: string; dot: string; label: string }> = {
  ok: { ring: "border-border/60", dot: "bg-success animate-tick", label: "text-muted-foreground" },
  drift: { ring: "border-warning/40", dot: "bg-warning animate-tick", label: "text-warning" },
  offline: { ring: "border-destructive/40", dot: "bg-destructive", label: "text-destructive" },
};

export function SensorStrip() {
  return (
    <BentoCard padded={false} className="h-full">
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80">Channels</span>
          <span className="text-xs font-semibold text-foreground">Sensor Health</span>
        </div>
        <div className="ml-auto grid flex-1 grid-cols-4 gap-1.5 sm:grid-cols-8">
          {sensors.map((s) => {
            const sty = statusStyles[s.status];
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border bg-background/40 px-2 py-1.5 font-mono text-[10px]",
                  sty.ring
                )}
              >
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", sty.dot)} />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-foreground">{s.id}</span>
                  <span className={cn("truncate text-[9px]", sty.label)}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
