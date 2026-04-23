import {
  Activity,
  Cpu,
  Droplets,
  ShieldCheck,
  Zap,
  Layers,
  Filter,
  Sun,
  Sparkles,
  Recycle,
  Brain,
  ArrowRight,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { cn } from "@/lib/utils";
import type { TabId } from "@/pages/Index";

export function SystemOverview({
  onNavigate,
  totalRegenerated,
  efficiencyMultiplier,
  ledgerHeight,
}: {
  onNavigate: (t: TabId) => void;
  totalRegenerated: number;
  efficiencyMultiplier: number;
  ledgerHeight: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      {/* TOP — KPI strip */}
      <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-3">
        <HealthStat
          label="Water regenerated"
          value={`${(totalRegenerated / 1_000_000).toFixed(2)}M m³`}
          sub="cumulative · all nodes"
          icon={Droplets}
          tone="primary"
        />
        <HealthStat
          label="Energy vs legacy RO"
          value={`${efficiencyMultiplier.toFixed(1)}× more efficient`}
          sub="0.62 kWh/m³ · target < 0.65"
          icon={Zap}
          tone="success"
        />
        <HealthStat
          label="Ledger integrity"
          value="VERIFIED"
          sub={`block #${ledgerHeight.toLocaleString()} · 0 forks`}
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      {/* MIDDLE — Executive schema (full width, fills remaining space) */}
      <div className="min-h-0 flex-1">
        <BentoCard
          eyebrow="NAIADE EXECUTIVE SCHEMA · DWP v3.2"
          title="Physical Process Flow"
          subtitle="End-to-end water treatment chain — Edge-AI supervises the GO membrane while ERD recovers pressure energy."
          meta="click any node to inspect"
          padded={false}
          className="h-full"
        >
          <ExecutiveSchema onNavigate={onNavigate} />
        </BentoCard>
      </div>

      {/* BOTTOM — 3 impact cards */}
      <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-3">
        <ImpactCard
          eyebrow="L1 · INGESTION"
          title="Every building, a source"
          body="Molecular certification every 50ms via Raman spectroscopy. Each unit becomes a verified water producer."
          cta="View ingestion"
          onClick={() => onNavigate("ingestion")}
        />
        <ImpactCard
          eyebrow="L2 · EDGE-AI"
          title="Zero-Liquid-Discharge"
          body="On-device inference protects the GO membrane, isolates contaminants in <10ms, guarantees 99.5% recovery."
          cta="View diagnostics"
          onClick={() => onNavigate("edge")}
        />
        <ImpactCard
          eyebrow="L3 · MLOPS"
          title="Water-as-a-Service"
          body="Federated learning across the fleet drives global optimization — energy pushed below 0.65 kWh/m³."
          cta="View MLOps"
          onClick={() => onNavigate("mlops")}
        />
      </div>
    </div>
  );
}

/* ───────────────── Health stat tile ───────────────── */
function HealthStat({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Activity;
  tone: "primary" | "success";
}) {
  const toneClass = tone === "success" ? "text-success" : "text-primary";
  const ringClass =
    tone === "success" ? "ring-success/30 bg-success/10" : "ring-primary/30 bg-primary/10";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3 backdrop-blur-sm">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1", ringClass)}>
        <Icon className={cn("h-4 w-4", toneClass)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
          {label}
        </div>
        <div className={cn("font-mono text-base font-semibold tracking-tight", toneClass)}>{value}</div>
        <div className="font-mono text-[10px] text-muted-foreground/70">{sub}</div>
      </div>
    </div>
  );
}

/* ───────────────── Executive schema ───────────────── */
type SchemaNode = {
  id: string;
  label: string;
  sub?: string;
  icon: typeof Activity;
  tab?: TabId;
  highlight?: boolean;
  tone?: "muted" | "primary" | "success" | "warning";
};

function ExecutiveSchema({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const mainline: SchemaNode[] = [
    { id: "input", label: "Input", sub: "Grey water", icon: Droplets, tone: "muted" },
    { id: "prefilter", label: "Pre-filter", sub: "Mechanical 5µm", icon: Filter, tab: "ingestion" },
    {
      id: "go",
      label: "GO Membrane",
      sub: "d-spacing 0.45 nm",
      icon: Layers,
      tab: "edge",
      highlight: true,
      tone: "primary",
    },
    { id: "uv", label: "UV + Degas", sub: "Polishing", icon: Sun, tab: "ingestion" },
    {
      id: "output",
      label: "Output",
      sub: "Ultra-pure · >18.2 MΩ·cm",
      icon: Sparkles,
      tone: "success",
    },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden p-5">
      {/* Blueprint grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] grid-bg" />

      {/* Scanline accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative flex h-full flex-col justify-between gap-4">
        {/* TOP supervisory branch — Naiade Brain */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <SchemaTile
              node={{
                id: "brain",
                label: "Naiade Brain",
                sub: "Edge-AI · Raman",
                icon: Brain,
                tab: "edge",
                tone: "primary",
              }}
              onClick={() => onNavigate("edge")}
              compact
            />
            <ArrowDown className="mt-1 h-4 w-4 animate-tick text-primary/70" />
            <div className="font-mono text-[9px] uppercase tracking-widest text-primary/70">
              supervises
            </div>
          </div>
        </div>

        {/* MAIN horizontal flow */}
        <div className="flex items-stretch justify-between gap-2">
          {mainline.map((n, i) => (
            <div key={n.id} className="flex flex-1 items-center gap-2">
              <SchemaTile
                node={n}
                onClick={n.tab ? () => onNavigate(n.tab!) : undefined}
              />
              {i < mainline.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>

        {/* BOTTOM recovery branch — ERD */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-success/80">
              energy recovery
            </div>
            <ArrowUp className="mb-1 h-4 w-4 animate-tick text-success/70" />
            <SchemaTile
              node={{
                id: "erd",
                label: "ERD",
                sub: "98% efficiency",
                icon: Recycle,
                tone: "success",
              }}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SchemaTile({
  node,
  onClick,
  compact,
}: {
  node: SchemaNode;
  onClick?: () => void;
  compact?: boolean;
}) {
  const Icon = node.icon;
  const toneRing = {
    muted: "ring-border/60 bg-muted/30",
    primary: "ring-primary/50 bg-primary/10",
    success: "ring-success/40 bg-success/10",
    warning: "ring-warning/40 bg-warning/10",
  }[node.tone ?? "muted"];
  const toneIcon = {
    muted: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
  }[node.tone ?? "muted"];

  const interactive = !!onClick;
  const Wrapper: any = interactive ? "button" : "div";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-xl border bg-card/60 px-3 py-3 text-center backdrop-blur-md transition-all",
        compact ? "min-w-[140px]" : "flex-1 min-w-0",
        node.highlight
          ? "border-primary/60 shadow-[0_0_28px_-6px_hsl(var(--primary)/0.55)]"
          : "border-border/60",
        interactive && "hover:border-primary/50 hover:bg-card/80 cursor-pointer"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-all",
          toneRing,
          node.highlight && "animate-pulse-glow"
        )}
      >
        <Icon className={cn("h-4 w-4", toneIcon)} />
      </div>
      <div className="text-xs font-semibold tracking-tight text-foreground">{node.label}</div>
      {node.sub && (
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80">
          {node.sub}
        </div>
      )}
    </Wrapper>
  );
}

function FlowArrow() {
  return (
    <div className="relative flex items-center">
      <div className="relative h-px w-6 bg-border/60 md:w-8">
        <span className="absolute -top-[2.5px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-data-flow" />
      </div>
      <ArrowRight className="h-3 w-3 text-muted-foreground/70" />
    </div>
  );
}

/* ───────────────── Impact card ───────────────── */
function ImpactCard({
  eyebrow,
  title,
  body,
  cta,
  onClick,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-1.5 rounded-xl border border-border/60 bg-card/40 p-4 text-left backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/60"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary/80">
        {eyebrow}
      </div>
      <div className="text-sm font-semibold tracking-tight text-foreground">{title}</div>
      <p className="text-xs font-light leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
        {cta} →
      </div>
    </button>
  );
}
