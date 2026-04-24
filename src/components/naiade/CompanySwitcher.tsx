import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { companies, getCompany, type CompanyId } from "@/lib/companies";

export function CompanySwitcher({
  activeCompany,
  onChange,
  collapsed = false,
}: {
  activeCompany: CompanyId;
  onChange: (id: CompanyId) => void;
  collapsed?: boolean;
}) {
  const current = getCompany(activeCompany);
  const Icon = current.icon;

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Switch organization (current: ${current.name})`}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Icon className="h-4 w-4 text-primary" />
        </DropdownMenuTrigger>
        <SwitcherContent activeCompany={activeCompany} onChange={onChange} side="right" />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Switch organization (current: ${current.name})`}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2 py-1.5 text-left transition-colors",
          "hover:bg-sidebar-accent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/40">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            {current.shortName}
          </span>
          <span className="truncate font-mono text-[10px] text-muted-foreground">
            {current.node}
          </span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </DropdownMenuTrigger>
      <SwitcherContent activeCompany={activeCompany} onChange={onChange} side="bottom" />
    </DropdownMenu>
  );
}

function SwitcherContent({
  activeCompany,
  onChange,
  side,
}: {
  activeCompany: CompanyId;
  onChange: (id: CompanyId) => void;
  side: "right" | "bottom";
}) {
  return (
    <DropdownMenuContent
      side={side}
      align="start"
      sideOffset={6}
      className="w-64 border-border bg-popover"
    >
      <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Organizations
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {companies.map((c) => {
        const Icon = c.icon;
        const active = c.id === activeCompany;
        return (
          <DropdownMenuItem
            key={c.id}
            onSelect={() => onChange(c.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 px-2 py-2",
              active && "bg-primary/5"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1",
                active
                  ? "bg-primary/15 ring-primary/50"
                  : "bg-muted ring-border"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
              <span className="truncate font-mono text-[10px] text-muted-foreground">
                {c.node} · {c.region}
              </span>
            </span>
            {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );
}
