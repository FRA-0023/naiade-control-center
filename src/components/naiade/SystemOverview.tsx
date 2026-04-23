import { Activity, Cpu, Cloud, Droplets, Radio, ShieldCheck, Zap, Gauge, Layers, Database } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { cn } from "@/lib/utils";
import type { TabId } from "@/pages/Index";

type LayerNode = {
  id: TabId;
  layer: string;
  title: string;
  sub: string;
  icon: typeof Activity;
  items: { icon: typeof Activity; label: string }[];
};

const nodes: LayerNode[] = [
  {
    id: "ingestion",
    layer: "L1 · CORE",
    title: "Naiade Core",
    sub: "Physical filtration stack",
    icon: Layers,
    items: [
      { icon: Droplets, label: "Pre-filter" },
      { icon: Layers, label: "GO Membrane" },
      { icon: Zap, label: "UV / EDI" },
    ],
  },
  {
    id: "ingestion",
    layer: "L2 · LINK",
    title: "Naiade Link",
    sub: "5G / LoRaWAN mesh",
    icon: Radio,
    items: [
      { icon: Radio, label: "Raman sensors" },
      { icon: Activity, label: "Telemetry bus" },
      { icon: Gauge, label: "Edge gateway" },
    ],
  },
  {
    id: "edge",
    layer: "L3 · BRAIN",
    title: "Naiade Brain",
    sub: "Edge-AI · Cloud · Ledger",
    icon: Cpu,
    items: [
      { icon: Cpu, label: "MobileNetV3" },
      { icon: Cloud, label: "Digital Twin" },
      { icon: ShieldCheck, label: "Blockchain" },
    ],
  },
];

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
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-9rem)]">
      {/* Header — system health */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

      {/* Topology + impact cards */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-4">
        {/* Topology diagram */}
        <div className="col-span-12 min-h-[360px] lg:col-span-8 lg:min-h-0">
          <BentoCard
            eyebrow="DECENTRALIZED WATER PROTOCOL"
            title="System Topology"
            subtitle="Three-layer architecture connecting physical hardware, IoT mesh, and intelligence — click any node to inspect."
            meta="DWP v3.2"
            padded={false}
          >
            <Topology nodes={nodes} onNavigate={onNavigate} />
          </BentoCard>
        </div>

        {/* Impact cards */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4 lg:min-h-0">
          <ImpactCard
            eyebrow="L1 · INGESTION"
            title="Every building, a source"
            body="Molecular certification every 50ms via Raman spectroscopy. Each unit becomes a verified water producer in the decentralized grid."
            cta="View ingestion"
            onClick={() => onNavigate("ingestion")}
          />
          <ImpactCard
            eyebrow="L3 · EDGE-AI"
            title="Zero-Liquid-Discharge"
            body="On-device inference protects the GO membrane, isolates contaminants in <10ms, and guarantees 99.5% water recovery."
            cta="View diagnostics"
            onClick={() => onNavigate("edge")}
          />
          <ImpactCard
            eyebrow="L3 · MLOPS"
            title="Water-as-a-Service"
            body="Federated learning across the fleet drives global optimization — energy consumption pushed below 0.65 kWh/m³."
            cta="View MLOps"
            onClick={() => onNavigate("mlops")}
          />
        </div>
      </div>
    </div>
  );
}

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
  const ringClass = tone === "success" ? "ring-success/30 bg-success/10" : "ring-primary/30 bg-primary/10";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1", ringClass)}>
        <Icon className={cn("h-4 w-4", toneClass)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
          {label}
        </div>
        <div className={cn("font-mono text-lg font-semibold tracking-tight", toneClass)}>{value}</div>
        <div className="font-mono text-[10px] text-muted-foreground/70">{sub}</div>
      </div>
    </div>
  );
}

function Topology({ nodes, onNavigate }: { nodes: LayerNode[]; onNavigate: (t: TabId) => void }) {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden p-6">
      {/* Blueprint grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] grid-bg" />

      {/* SVG flow lines (desktop) */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="flowLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <line x1="20" y1="50" x2="50" y2="50" stroke="url(#flowLine)" strokeWidth="0.3" />
        <line x1="50" y1="50" x2="80" y2="50" stroke="url(#flowLine)" strokeWidth="0.3" />
      </svg>

      {/* Animated flow pulses */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:block">
        <div className="relative mx-auto h-px w-[70%] bg-border/40">
          <span className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-data-flow" />
          <span
            className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-data-flow"
            style={{ animationDelay: "1s" }}
          />
          <span
            className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-data-flow"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>

      {/* Nodes */}
      <div className="relative flex h-full flex-col items-stretch justify-center gap-6 md:flex-row md:items-center md:justify-between md:gap-3">
        {nodes.map((n) => (
          <TopologyNode key={n.layer} node={n} onClick={() => onNavigate(n.id)} />
        ))}
      </div>
    </div>
  );
}

function TopologyNode({ node, onClick }: { node: LayerNode; onClick: () => void }) {
  const Icon = node.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-1 flex-col items-stretch gap-2 rounded-xl border border-border/60 bg-card/60 p-4 text-left backdrop-blur-md transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_24px_-8px_hsl(var(--primary)/0.5)]"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/40 transition-all group-hover:ring-primary/70">
          <Icon className="h-4 w-4 text-primary" />
          <span className="absolute inset-0 rounded-lg ring-2 ring-primary/0 transition-all group-hover:animate-pulse-glow" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-primary/80">
            {node.layer}
          </div>
          <div className="text-sm font-semibold tracking-tight text-foreground">{node.title}</div>
        </div>
      </div>
      <div className="font-mono text-[10px] text-muted-foreground/80">{node.sub}</div>
      <div className="mt-1 flex flex-col gap-1 border-t border-border/50 pt-2">
        {node.items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <it.icon className="h-3 w-3 text-primary/60" />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

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
      className="group flex flex-1 flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-4 text-left backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/60"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary/80">
        {eyebrow}
      </div>
      <div className="text-sm font-semibold tracking-tight text-foreground">{title}</div>
      <p className="text-xs font-light leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-auto pt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
        {cta} →
      </div>
    </button>
  );
}
