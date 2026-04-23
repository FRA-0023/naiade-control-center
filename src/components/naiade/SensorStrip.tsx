import { Card } from "@/components/ui/card";

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

const statusStyles: Record<string, string> = {
  ok: "border-success/40 bg-success/10 text-success",
  drift: "border-warning/40 bg-warning/10 text-warning",
  offline: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function SensorStrip() {
  return (
    <Card className="border-border/60 bg-card/60 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Sensor health · 8 ingestion channels</span>
        <span className="font-mono text-[10px] text-muted-foreground">last sweep · 200ms ago</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {sensors.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-2 rounded-md border px-2 py-1.5 font-mono text-[10px] ${statusStyles[s.status]}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                s.status === "ok"
                  ? "bg-success animate-tick"
                  : s.status === "drift"
                  ? "bg-warning animate-tick"
                  : "bg-destructive"
              }`}
            />
            <span className="truncate">
              {s.id} <span className="text-muted-foreground/70">{s.label}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
