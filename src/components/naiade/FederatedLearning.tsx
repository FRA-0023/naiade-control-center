import { useState } from "react";
import { BentoCard } from "./BentoCard";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Cloud, Server, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function FederatedLearning({ progress }: { progress: number }) {
  const [open, setOpen] = useState(false);
  const phase =
    progress < 30 ? "Training local" : progress < 70 ? "Pushing weights" : "Aggregating round";

  return (
    <BentoCard
      eyebrow="FEDERATED"
      title="Learning Sync"
      subtitle="Local models trained on edge. Pushing updated weights to Cloud while keeping raw data strictly local."
      meta="round #2814"
      padded={false}
    >
      <div className="flex flex-col gap-5 p-6">
        {/* Diagram */}
        <div className="flex items-stretch gap-2">
          <NodeBox label="Edge" name="Node #451" icon={Server} tone="primary" />
          <div className="flex flex-1 items-center">
            <div className="relative h-px w-full bg-border">
              <div className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary animate-data-flow" />
              <div
                className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary animate-data-flow"
                style={{ animationDelay: "0.7s" }}
              />
            </div>
          </div>
          <NodeBox label="Cloud" name="Aggregator" icon={Cloud} tone="muted" />
        </div>

        {/* Hero metric */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
              {Math.round(progress)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">% · {phase}</span>
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
          <Fact k="samples" v="3,402" />
          <Fact k="payload" v="4.3 MB" />
          <Fact k="ε privacy" v="1.2" />
          <Fact k="raw data" v="local" tone="success" />
        </div>
      </div>

      {/* Collapsible terminal */}
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
          <div className="max-h-48 overflow-y-auto bg-background/40 px-6 pb-4 font-mono text-[11px] leading-relaxed">
            <div className="text-success">› Local model trained · 3,402 samples</div>
            <div className="text-primary">› Pushing updated weights (4.3 MB) → Cloud</div>
            <div className="text-muted-foreground">› Raw data kept local · privacy preserved</div>
            <div className="text-muted-foreground">› Differential privacy ε = 1.2</div>
            <div className="text-muted-foreground">› Round #2814 · 412 nodes participating</div>
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
