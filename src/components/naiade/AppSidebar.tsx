import { Activity, Cpu, Cloud, Waves, CircleDot } from "lucide-react";
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

const sections = [
  { id: "ingestion", title: "Data Ingestion", icon: Activity, badge: "50ms" },
  { id: "edge", title: "Edge-AI Ops", icon: Cpu, badge: "<10ms" },
  { id: "mlops", title: "MLOps & Cloud", icon: Cloud, badge: "FED" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            <Waves className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-wide text-foreground">NAIADE</span>
              <span className="font-mono text-[10px] text-muted-foreground">MLOPS · v3.2.1</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest">
            Node #451
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((s) => (
                <SidebarMenuItem key={s.id}>
                  <SidebarMenuButton asChild tooltip={s.title}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-3"
                    >
                      <s.icon className="h-4 w-4 text-primary" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{s.title}</span>
                          <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                            {s.badge}
                          </span>
                        </>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex flex-col gap-2 px-2 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">System health</span>
              <span className="flex items-center gap-1.5 font-mono text-success">
                <CircleDot className="h-3 w-3 animate-tick" /> NOMINAL
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>uptime</span>
              <span>184d 06h</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>region</span>
              <span>EU-WEST · ZRH3</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-3">
            <CircleDot className="h-4 w-4 animate-tick text-success" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
