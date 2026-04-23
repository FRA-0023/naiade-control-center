import { useEffect, useState } from "react";
import { Radio, Wifi } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function TopBar({ anomaly }: { anomaly: boolean }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-col leading-tight">
        <h1 className="text-sm font-semibold tracking-wide">Data Science & MLOps Control Center</h1>
        <span className="font-mono text-[10px] text-muted-foreground">/ realtime · edge · cloud</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] ${
            anomaly
              ? "border-destructive/60 bg-destructive/10 text-destructive animate-pulse-glow"
              : "border-success/40 bg-success/10 text-success"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${anomaly ? "bg-destructive" : "bg-success animate-tick"}`} />
          {anomaly ? "ANOMALY DETECTED" : "ALL SYSTEMS NOMINAL"}
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 font-mono text-[11px] text-muted-foreground sm:flex">
          <Wifi className="h-3 w-3 text-primary" />
          <span>uplink 12.4 Mb/s</span>
        </div>

        <div className="hidden items-center gap-2 font-mono text-[11px] text-muted-foreground md:flex">
          <Radio className="h-3 w-3 text-primary animate-tick" />
          <span>{now.toISOString().split("T")[1].replace("Z", "")}</span>
        </div>
      </div>
    </header>
  );
}
