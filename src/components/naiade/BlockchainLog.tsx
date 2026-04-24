import { useEffect, useRef, useState } from "react";
import { BentoCard } from "./BentoCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block } from "@/hooks/useMockData";

export function BlockchainLog({ blocks }: { blocks: Block[] }) {
  const [open, setOpen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [blocks]);

  const last = blocks[blocks.length - 1];

  return (
    <BentoCard
      eyebrow="COMPLIANCE · APPEND-ONLY"
      title="Blockchain Audit Log"
      subtitle="Immutable append-only ledger for sanitary authority compliance and water quality certification."
      meta={
        <span className="flex items-center gap-1.5">
          <Lock className="h-3 w-3" /> Sanitary Authority
        </span>
      }
      padded={false}
    >
      <div className="grid grid-cols-3 gap-px border-b border-border/60 bg-border/60">
        <Stat label="Latest block" value={`#${last.height.toLocaleString()}`} />
        <Stat label="Total entries" value={`${blocks.length}`} />
        <Stat label="Last verdict" value={last.prediction} tone={last.prediction === "SAFE" ? "success" : "warning"} />
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-muted/20">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Ledger stream
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            ref={ref}
            className="terminal-surface max-h-64 overflow-y-auto px-6 pb-4 font-mono text-[11px] leading-relaxed"
          >
            {blocks.map((b) => (
              <div key={b.height} className="mb-3 border-l-2 border-border/60 pl-3">
                <div className="flex items-center justify-between text-muted-foreground/70">
                  <span>
                    <span className="text-foreground">block</span> #{b.height.toLocaleString()}
                  </span>
                  <span>{b.ts}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/70">hash    </span>
                  <span className="text-primary">{b.hash}</span>
                </div>
                <div className="text-muted-foreground/50">
                  <span>prev    </span>
                  <span>{b.prev}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/70">predict </span>
                  <span className={b.prediction === "SAFE" ? "text-success" : "text-warning"}>
                    {b.prediction}
                  </span>
                  <span className="text-muted-foreground/70"> · sig </span>
                  <span className="text-foreground/70">{b.signature}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-block h-3 w-1.5 animate-tick bg-primary" />
              <span>awaiting next prediction…</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </BentoCard>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="bg-card/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-lg font-semibold tracking-tight", toneClass)}>{value}</div>
    </div>
  );
}
