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
    <BentoCard eyebrow="CHANNELS" title="Sensor Health" meta="last sweep · 200ms ago">
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {sensors.map((s) => {
          const sty = statusStyles[s.status];
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background/40 px-3 py-2 font-mono text-[10px]",
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
    </BentoCard>
  );
}
