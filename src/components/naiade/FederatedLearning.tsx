import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cloud, GitBranch, Server } from "lucide-react";

export function FederatedLearning({ progress }: { progress: number }) {
  const phase =
    progress < 30 ? "Training local model" : progress < 70 ? "Pushing weights → Cloud" : "Aggregating global round";

  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Federated Learning Sync</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">round #2814</span>
      </div>

      <div className="p-4">
        {/* Node ↔ Cloud diagram */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex flex-1 flex-col items-center rounded-lg border border-primary/40 bg-primary/5 p-3">
            <Server className="mb-1 h-5 w-5 text-primary" />
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Edge</span>
            <span className="font-mono text-xs font-semibold text-primary">Node #451</span>
          </div>

          <div className="relative h-px flex-1 overflow-hidden bg-border">
            <div className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary animate-data-flow" />
            <div className="absolute inset-y-0 -left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary animate-data-flow" style={{ animationDelay: "0.7s" }} />
          </div>

          <div className="flex flex-1 flex-col items-center rounded-lg border border-accent/40 bg-accent/5 p-3">
            <Cloud className="mb-1 h-5 w-5 text-accent" />
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Cloud</span>
            <span className="font-mono text-xs font-semibold text-accent">Aggregator</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-muted-foreground">{phase}</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="mt-4 space-y-1 rounded-md border border-border/60 bg-deep/40 p-3 font-mono text-[10px]">
          <div className="text-success">› Local model trained · 3,402 samples</div>
          <div className="text-primary">› Pushing updated weights (4.3 MB) → Cloud</div>
          <div className="text-muted-foreground">› Raw water-quality data kept local · privacy preserved</div>
          <div className="text-accent">› Differential privacy ε = 1.2</div>
        </div>
      </div>
    </Card>
  );
}
