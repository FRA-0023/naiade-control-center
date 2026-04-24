import { LucideIcon } from "lucide-react";

export function SectionHeader({
  id,
  index,
  title,
  subtitle,
  icon: Icon,
}: {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <div id={id} className="flex items-center gap-4 scroll-mt-20">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">{index}</span>
        <h2>{title}</h2>
      </div>
      <div className="ml-2 hidden text-xs text-muted-foreground sm:block">{subtitle}</div>
      <div className="ml-auto h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
    </div>
  );
}
