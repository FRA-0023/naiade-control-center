import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Link2, Lock } from "lucide-react";
import type { Block } from "@/hooks/useMockData";

export function BlockchainLog({ blocks }: { blocks: Block[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [blocks]);

  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Blockchain Audit Log</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Sanitary Authority Compliance · append-only</span>
        </div>
      </div>

      <div
        ref={ref}
        className="relative h-[320px] overflow-auto bg-deep/60 p-4 font-mono text-[11px] leading-relaxed"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-deep/90 to-transparent" />
        {blocks.map((b) => (
          <div key={b.height} className="mb-3 border-l-2 border-primary/40 pl-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                <span className="text-primary">block</span> #{b.height.toLocaleString()}
              </span>
              <span>{b.ts}</span>
            </div>
            <div className="text-foreground/90">
              <span className="text-muted-foreground">hash    </span>
              <span className="text-accent">{b.hash}</span>
            </div>
            <div className="text-muted-foreground/70">
              <span>prev    </span>
              <span>{b.prev}</span>
            </div>
            <div>
              <span className="text-muted-foreground">predict </span>
              <span className={b.prediction === "SAFE" ? "text-success" : "text-warning"}>
                {b.prediction}
              </span>
              <span className="text-muted-foreground"> · sig </span>
              <span className="text-foreground/70">{b.signature}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-primary">
          <span className="inline-block h-3 w-1.5 animate-tick bg-primary" />
          <span>awaiting next prediction…</span>
        </div>
      </div>
    </Card>
  );
}
