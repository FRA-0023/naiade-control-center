import { Activity, Cloud, Cpu, LayoutGrid, Waves, CircleDot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { CompanySwitcher } from "./CompanySwitcher";
import { getCompany, type CompanyId } from "@/lib/companies";
import type { TabId } from "@/pages/Index";

const sections: { id: TabId; title: string; icon: typeof Activity; badge: string }[] = [
  { id: "overview", title: "System Overview", icon: LayoutGrid, badge: "DWP" },
  { id: "ingestion", title: "Live Ingestion", icon: Activity, badge: "50ms" },
  { id: "edge", title: "Edge-AI", icon: Cpu, badge: "<10ms" },
  { id: "mlops", title: "Global MLOps", icon: Cloud, badge: "FED" },
];

export function AppSidebar({
  activeTab,
  onTabChange,
  activeCompany,
  onCompanyChange,
}: {
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
  activeCompany: CompanyId;
  onCompanyChange: (id: CompanyId) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const company = getCompany(activeCompany);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        {/* Org switcher — premium Vercel/Linear style */}
        <div className={cn("px-2 pt-2", collapsed ? "flex justify-center" : "")}>
          <CompanySwitcher
            activeCompany={activeCompany}
            onChange={onCompanyChange}
            collapsed={collapsed}
          />
        </div>

        {/* Product identity */}
        <div
          className={cn(
            "flex items-center gap-3 py-2",
            collapsed ? "justify-center px-0" : "px-2"
          )}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/40">
            <Waves className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-foreground">NAIADE</span>
              <span className="font-mono text-[10px] text-muted-foreground">v3.2.1</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
            {company.node}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((s) => {
                const active = activeTab === s.id;
                return (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={s.title}
                      isActive={active}
                      className={cn(
                        "transition-colors",
                        active && "bg-primary/10 text-primary hover:bg-primary/15"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onTabChange(s.id)}
                        className="group flex w-full items-center gap-3"
                      >
                        <s.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left text-sm">{s.title}</span>
                            <span
                              className={cn(
                                "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                                active
                                  ? "border-primary/40 bg-primary/10 text-primary"
                                  : "border-border/60 bg-muted/40 text-muted-foreground"
                              )}
                            >
                              {s.badge}
                            </span>
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex flex-col gap-2 px-2 py-3">
            <ThemeToggle />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-success">
                <CircleDot className="h-3 w-3 animate-tick" /> NOMINAL
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/70">
              <span>uptime</span>
              <span>184d 06h</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/70">
              <span>region</span>
              <span>{company.region}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <ThemeToggle collapsed />
            <CircleDot className="h-4 w-4 animate-tick text-success" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
