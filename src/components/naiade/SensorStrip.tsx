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
      <div className="flex flex-col gap-1 p-2">
        <div className="flex items-baseline justify-between leading-none px-1">
          <span className="text-[10px] font-semibold text-foreground">Sensor Health</span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/80">8 ch</span>
        </div>
        <div className="grid grid-cols-8 gap-1 w-full shrink-0">
          {sensors.map((s) => {
            const sty = statusStyles[s.status];
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-1 rounded border bg-background/40 px-1 py-0.5 font-mono",
                  sty.ring
                )}
              >
                <span className={cn("h-1 w-1 shrink-0 rounded-full", sty.dot)} />
                <div className="flex min-w-0 flex-col leading-none">
                  <span className="truncate text-[8px] text-foreground">{s.id}</span>
                  <span className={cn("truncate text-[7px]", sty.label)}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
