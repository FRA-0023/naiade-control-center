import { useState } from "react";
import { BentoCard } from "./BentoCard";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Cloud, Server, Terminal, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function FederatedLearning({ progress }: { progress: number }) {
  const [open, setOpen] = useState(false);
  const phase =
    progress < 30
      ? "Training locally"
      : progress < 70
      ? "Uploading model weights"
      : "Global knowledge merged";

  return (
    <BentoCard
      eyebrow="FLEET INTELLIGENCE"
      title="Fleet-Wide AI Sync (Privacy-Preserving)"
      subtitle="Local Edge nodes share only mathematical learnings (model weights) with the global network, never transmitting raw, sensitive plant telemetry."
      meta="update #2,814"
      padded={false}
    >
      <div className="flex flex-col gap-3.5 p-3 md:p-4">
        {/* Diagram */}
        <div className="flex items-stretch gap-2">
          <NodeBox label="Local Plant" name="Node #451" icon={Server} tone="primary" />
          <div className="flex flex-1 items-center">
            <div className="relative h-px w-full overflow-visible bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 animate-pulse">
              <div className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-data-flow" />
              <div
                className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-data-flow"
                style={{ animationDelay: "0.7s" }}
              />
              <div
                className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-data-flow"
                style={{ animationDelay: "1.4s" }}
              />
            </div>
          </div>
          <NodeBox label="Global Network" name="Aggregator" icon={Cloud} tone="muted" />
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 self-start rounded-full border border-success/40 bg-success/10 px-3 py-1">
          <ShieldCheck className="h-3 w-3 text-success" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-success">
            Network: Synchronized
          </span>
        </div>

        {/* Hero metric — Global Knowledge Update progress */}
        <div>
          <div className="text-eyebrow mb-1">Current Global Knowledge Update</div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="metric-hero text-foreground">{Math.round(progress)}</span>
            <span className="text-unit">% complete · {phase}</span>
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </div>

        {/* Quick facts — operator-friendly */}
        <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
          <Fact k="local lessons learned" v="3,402" />
          <Fact k="weights uploaded" v="4.3 MB" />
          <Fact k="plants in sync" v="412 / 412" tone="success" />
          <Fact k="raw data shared" v="never" tone="success" />
        </div>
      </div>

      {/* Collapsible technical log */}
      <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border/60">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-muted/20">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Terminal className="h-3 w-3 text-primary" />
            Sync log
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="terminal-surface max-h-44 overflow-y-auto px-4 pb-3 font-mono text-[11px] leading-relaxed">
            <div className="text-success">› Local model trained · 3,402 samples</div>
            <div className="text-primary">› Pushing updated weights (4.3 MB) → Global Aggregator</div>
            <div className="text-muted-foreground">› Raw plant telemetry kept local · privacy preserved</div>
            <div className="text-muted-foreground">› Differential privacy ε = 1.2</div>
            <div className="text-muted-foreground">› Update #2,814 · 412 plants participating</div>
            <div className="text-success">› Acknowledged by aggregator · 142ms RTT</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </BentoCard>
  );
}

function NodeBox({
  label,
  name,
  icon: Icon,
  tone,
}: {
  label: string;
  name: string;
  icon: typeof Server;
  tone: "primary" | "muted";
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-lg border bg-background/30 p-3",
        tone === "primary" ? "border-primary/30" : "border-border/60"
      )}
    >
      <Icon className={cn("h-4 w-4", tone === "primary" ? "text-primary" : "text-muted-foreground")} />
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-[11px] font-semibold", tone === "primary" ? "text-primary" : "text-foreground")}>
        {name}
      </span>
    </div>
  );
}

function Fact({ k, v, tone }: { k: string; v: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/30 px-3 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn(tone === "success" ? "text-success" : "text-foreground")}>{v}</span>
    </div>
  );
}
