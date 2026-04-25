import {
  Activity,
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
  Map as MapIcon,
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
    <div className="flex w-full flex-col gap-6">
      {/* TOP — KPI strip */}
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

      {/* MIDDLE — Executive schema */}
      <BentoCard
        eyebrow="NAIADE EXECUTIVE SCHEMA · DWP v3.2"
        title="Physical Process Flow"
        subtitle="End-to-end water treatment chain — Edge-AI supervises the GO membrane while ERD recovers pressure energy."
        meta={
          <button
            type="button"
            onClick={() => onNavigate("plant")}
            className="group inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary transition-all hover:border-primary hover:bg-primary/20 hover:shadow-[0_0_18px_-4px_hsl(var(--primary)/0.6)]"
            aria-label="Open Digital Twin"
          >
            <MapIcon className="h-3.5 w-3.5" />
            Open Digital Twin
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        }
        padded={false}
        className="!overflow-visible"
      >
        <ExecutiveSchema onNavigate={onNavigate} />
      </BentoCard>

      {/* BOTTOM — 3 impact cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/80">
          {label}
        </div>
        <div className={cn("font-mono text-lg font-semibold tracking-tight", toneClass)}>{value}</div>
        <div className="font-mono text-[11px] text-muted-foreground/70">{sub}</div>
      </div>
    </div>
  );
}

/* ───────────────── Executive schema ───────────────── */
type Stage = {
  label: string;
  sub: string;
  icon: typeof Activity;
  tab?: TabId;
  highlight?: boolean;
  tone?: "muted" | "primary" | "success";
};

const stages: Stage[] = [
  { label: "Input", sub: "Grey water", icon: Droplets, tone: "muted" },
  { label: "Pre-filter", sub: "Mechanical 5µm", icon: Filter, tab: "ingestion" },
  {
    label: "GO Membrane",
    sub: "d-spacing 0.45 nm",
    icon: Layers,
    tab: "edge",
    highlight: true,
    tone: "primary",
  },
  { label: "UV + Degas", sub: "Polishing", icon: Sun, tab: "ingestion" },
  { label: "Output", sub: "UPW > 18.2 MΩ·cm", icon: Sparkles, tone: "success" },
];

function ExecutiveSchema({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  return (
    <div className="relative w-full px-5 py-24">
      {/* Blueprint grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] grid-bg" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* MAIN horizontal pipeline — GO Membrane is the absolute center anchor */}
      <div className="relative z-10 flex w-full flex-row items-center justify-center gap-2">
        {stages.map((s, i) => {
          const isCenter = s.label === "GO Membrane";
          return (
            <div key={s.label} className="flex flex-1 min-w-[120px] items-center gap-1.5">
              {isCenter ? (
                <div className="relative flex flex-1 flex-col items-center justify-center">
                  {/* Vertical connector UP to Edge-AI Brain */}
                  <span className="pointer-events-none absolute bottom-[calc(100%+0.25rem)] left-1/2 h-8 -translate-x-1/2 border-l border-dashed border-primary/40" />
                  {/* Edge-AI Brain — absolutely centered above */}
                  <div className="absolute bottom-[calc(100%+2rem)] left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <SatelliteNode
                      label="Edge-AI Brain"
                      sub="CNN Predictive · Raman"
                      icon={Brain}
                      tone="primary"
                      onClick={() => onNavigate("edge")}
                    />
                  </div>

                  <StageCard stage={s} onClick={s.tab ? () => onNavigate(s.tab!) : undefined} />

                  {/* Vertical connector DOWN to ERD */}
                  <span className="pointer-events-none absolute top-[calc(100%+0.25rem)] left-1/2 h-8 -translate-x-1/2 border-l border-dashed border-success/40" />
                  {/* ERD Isobaric — absolutely centered below */}
                  <div className="absolute top-[calc(100%+2rem)] left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <SatelliteNode
                      label="ERD Isobaric"
                      sub="98% Energy Recovery"
                      icon={Recycle}
                      tone="success"
                    />
                  </div>
                </div>
              ) : (
                <StageCard stage={s} onClick={s.tab ? () => onNavigate(s.tab!) : undefined} />
              )}
              {i < stages.length - 1 && <FlowArrow />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageCard({ stage, onClick }: { stage: Stage; onClick?: () => void }) {
  const Icon = stage.icon;
  const interactive = !!onClick;
  const toneRing = {
    muted: "ring-border/60 bg-muted/30",
    primary: "ring-primary/50 bg-primary/15",
    success: "ring-success/40 bg-success/10",
  }[stage.tone ?? "muted"];
  const toneIcon = {
    muted: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
  }[stage.tone ?? "muted"];

  const Wrapper: any = interactive ? "button" : "div";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col items-center gap-1.5 rounded-xl border bg-card/60 px-2 py-3 text-center backdrop-blur-md transition-all",
        stage.highlight
          ? "border-primary/60 shadow-[0_0_28px_-6px_hsl(var(--primary)/0.55)]"
          : "border-border/60",
        interactive && "cursor-pointer hover:border-primary/50 hover:bg-card/80"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-all",
          toneRing,
          stage.highlight && "animate-pulse-glow"
        )}
      >
        <Icon className={cn("h-4 w-4", toneIcon)} />
      </div>
      <div className="text-sm font-semibold tracking-tight text-foreground">{stage.label}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
        {stage.sub}
      </div>
    </Wrapper>
  );
}

function SatelliteNode({
  label,
  sub,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  sub: string;
  icon: typeof Activity;
  tone: "primary" | "success";
  onClick?: () => void;
}) {
  const interactive = !!onClick;
  const Wrapper: any = interactive ? "button" : "div";
  const ring = tone === "primary" ? "ring-primary/50 bg-primary/10" : "ring-success/40 bg-success/10";
  const text = tone === "primary" ? "text-primary" : "text-success";
  const border = tone === "primary" ? "border-primary/40" : "border-success/40";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-full border bg-card/70 px-3 py-1.5 backdrop-blur-md transition-all",
        border,
        interactive && "cursor-pointer hover:bg-card"
      )}
    >
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-full ring-1", ring)}>
        <Icon className={cn("h-3.5 w-3.5", text)} />
      </span>
      <span className="flex flex-col text-left leading-tight">
        <span className={cn("text-sm font-semibold tracking-tight", text)}>{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
          {sub}
        </span>
      </span>
    </Wrapper>
  );
}

function DashedConnector() {
  return (
    <div className="relative h-5 w-px">
      <div className="absolute inset-0 border-l border-dashed border-primary/40" />
      <span className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-tick" />
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="relative flex shrink-0 items-center">
      <div className="relative h-px w-4 bg-border/60">
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
      <div className="font-mono text-[11px] uppercase tracking-widest text-primary/80">
        {eyebrow}
      </div>
      <div className="text-base font-semibold tracking-tight text-foreground">{title}</div>
      <p className="text-sm font-light leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
        {cta} →
      </div>
    </button>
  );
}
