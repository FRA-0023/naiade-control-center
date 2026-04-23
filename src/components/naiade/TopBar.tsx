import { useEffect, useState } from "react";
import { Radio, Wifi, type LucideIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TabId } from "@/pages/Index";

type Tab = { id: TabId; label: string; sub: string; icon: LucideIcon };

export function TopBar({
  anomaly,
  tabs,
  activeTab,
  onTabChange,
}: {
  anomaly: boolean;
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      {/* Row 1 — Identity + status */}
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex flex-col leading-tight">
          <h1 className="text-sm font-semibold tracking-tight">{current.label}</h1>
          <span className="font-mono text-[10px] text-muted-foreground">{current.sub}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px]",
              anomaly
                ? "border-destructive/50 bg-destructive/10 text-destructive animate-pulse-glow"
                : "border-success/30 bg-success/10 text-success"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                anomaly ? "bg-destructive" : "bg-success animate-tick"
              )}
            />
            {anomaly ? "ANOMALY" : "NOMINAL"}
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-2.5 py-1 font-mono text-[10px] text-muted-foreground sm:flex">
            <Wifi className="h-3 w-3" />
            <span>12.4 Mb/s</span>
          </div>
          <div className="hidden items-center gap-1.5 font-mono text-[10px] text-muted-foreground md:flex">
            <Radio className="h-3 w-3 animate-tick" />
            <span>{now.toISOString().split("T")[1].replace("Z", "")}</span>
          </div>
        </div>
      </div>

    </header>
  );
}
