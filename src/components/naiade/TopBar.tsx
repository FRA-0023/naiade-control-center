import { useEffect, useState } from "react";
import { Radio, Waves, Wifi, type LucideIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CompanySwitcher } from "./CompanySwitcher";
import type { TabId } from "@/pages/Index";
import type { CompanyId } from "@/lib/companies";

type Tab = { id: TabId; label: string; sub: string; icon: LucideIcon };

export function TopBar({
  anomaly,
  tabs,
  activeTab,
  onTabChange,
  activeCompany,
  onCompanyChange,
}: {
  anomaly: boolean;
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
  activeCompany: CompanyId;
  onCompanyChange: (id: CompanyId) => void;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
        <div className="flex h-14 items-center gap-2 px-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/40">
              <Waves className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">NAIADE</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <CompanySwitcher
              activeCompany={activeCompany}
              onChange={onCompanyChange}
              collapsed
            />
          </div>
        </div>
      </div>

      <header className="hidden w-full border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 md:sticky md:top-0 md:z-50 md:block">
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="hidden h-6 md:block" />

          <div className="hidden flex-col leading-tight md:flex">
            <span className="text-sm font-semibold tracking-tight text-foreground">{current.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{current.sub}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] sm:px-3",
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
    </>
  );
}
