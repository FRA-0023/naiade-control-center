import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { plantLayouts, type PlantNode, type SensorPin } from "@/lib/plantLayouts";
import { getCompany, type CompanyId } from "@/lib/companies";
import type { useMockData } from "@/hooks/useMockData";

type LiveData = ReturnType<typeof useMockData>;

type PinStatus = "ok" | "warn" | "offline";

function lastValue(arr: { v?: number }[]): number | null {
  if (!arr || arr.length === 0) return null;
  const last = arr[arr.length - 1];
  return typeof last.v === "number" ? last.v : null;
}

/** Resolve live value + threshold-based status for a pin. */
function resolvePin(pin: SensorPin, data: LiveData): { value: string; status: PinStatus; raw: number | null } {
  switch (pin.kind) {
    case "pressure": {
      const v = lastValue(data.pressure);
      if (v == null) return { value: "—", status: "ok", raw: null };
      const status: PinStatus = v > 11.5 || v < 7.5 ? "warn" : "ok";
      return { value: `${v.toFixed(2)} ${pin.unit}`, status, raw: v };
    }
    case "flow": {
      const v = lastValue(data.flow);
      if (v == null) return { value: "—", status: "ok", raw: null };
      const status: PinStatus = v < 1.0 || v > 2.5 ? "warn" : "ok";
      return { value: `${v.toFixed(2)} ${pin.unit}`, status, raw: v };
    }
    case "conductivity": {
      const v = lastValue(data.conductivity);
      if (v == null) return { value: "—", status: "ok", raw: null };
      const status: PinStatus = v > 50 ? "warn" : "ok";
      return { value: `${v.toFixed(0)} ${pin.unit}`, status, raw: v };
    }
    case "raman": {
      const peaks = 4;
      return { value: `${peaks} peaks`, status: data.anomaly ? "warn" : "ok", raw: peaks };
    }
    case "temperature": {
      // derive deterministic-ish reading from latency tick
      const ms = data.latency[data.latency.length - 1]?.ms ?? 5;
      const v = 22 + (ms % 3);
      return { value: `${v.toFixed(1)} ${pin.unit}`, status: "ok", raw: v };
    }
    case "ph":
      return { value: `7.2 ${pin.unit}`, status: "ok", raw: 7.2 };
    case "turbidity":
      return { value: `0.08 ${pin.unit}`, status: "ok", raw: 0.08 };
    case "oxygen":
      return { value: "—", status: "offline", raw: null };
    default:
      return { value: "—", status: "ok", raw: null };
  }
}

const statusToken: Record<PinStatus, { glow: string; ring: string; dot: string; text: string; label: string }> = {
  ok: {
    glow: "shadow-[0_0_14px_hsl(var(--success)/0.55)]",
    ring: "ring-success/60",
    dot: "bg-success",
    text: "text-success",
    label: "Nominal",
  },
  warn: {
    glow: "shadow-[0_0_14px_hsl(var(--warning)/0.6)]",
    ring: "ring-warning/70",
    dot: "bg-warning",
    text: "text-warning",
    label: "Warning",
  },
  offline: {
    glow: "shadow-[0_0_10px_hsl(var(--destructive)/0.5)]",
    ring: "ring-destructive/60",
    dot: "bg-destructive",
    text: "text-destructive",
    label: "Offline",
  },
};

export function PlantMap({
  activeCompany,
  data,
}: {
  activeCompany: CompanyId;
  data: LiveData;
}) {
  const layout = plantLayouts[activeCompany];
  const company = getCompany(activeCompany);
  const [hovered, setHovered] = useState<string | null>(null);

  const resolvedPins = useMemo(
    () => layout.sensors.map((p) => ({ pin: p, ...resolvePin(p, data) })),
    [layout, data]
  );

  const nominal = resolvedPins.filter((p) => p.status === "ok").length;
  const warn = resolvedPins.filter((p) => p.status === "warn").length;
  const offline = resolvedPins.filter((p) => p.status === "offline").length;

  return (
    <div className="flex h-full w-full flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary/80">
            DIGITAL TWIN · {company.node}
          </span>
          <h1>{layout.title}</h1>
          <p className="mt-0.5 text-sm font-light text-muted-foreground">{layout.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Legend tone="success" label={`${nominal} nominal`} />
          <Legend tone="warning" label={`${warn} warning`} />
          <Legend tone="destructive" label={`${offline} offline`} />
        </div>
      </div>

      {/* Map surface */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm light:bg-card light:shadow-sm">
        {/* Blueprint grid */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.18] light:opacity-[0.4]" />
        {/* Faint scan line accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <svg
          viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="relative z-10 h-full w-full"
        >
          {/* Pipe defs */}
          <defs>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Pipes */}
          <g className="text-primary">
            {layout.pipes.map((p, i) => (
              <g key={i}>
                {/* Glow underlay (dark mode) */}
                <path
                  d={p.d}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeOpacity={0.25}
                  strokeWidth={6}
                  strokeLinecap="round"
                  className="hidden dark:block"
                  filter="url(#line-glow)"
                />
                {/* Solid line — readable in both themes */}
                <path
                  d={p.d}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
                {p.flow && <FlowDot d={p.d} delay={(i % 3) * 0.6} />}
              </g>
            ))}
          </g>

          {/* Nodes */}
          {layout.nodes.map((n) => (
            <Node key={n.id} node={n} />
          ))}
        </svg>

        {/* Sensor pins overlay (HTML for popovers) */}
        <div className="pointer-events-none absolute inset-0">
          {resolvedPins.map(({ pin, value, status }) => (
            <Pin
              key={pin.id}
              pin={pin}
              value={value}
              status={status}
              viewBox={layout.viewBox}
              isHovered={hovered === pin.id}
              setHovered={setHovered}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Node (SVG group) ─────────────── */
function Node({ node }: { node: PlantNode }) {
  const tone = node.tone ?? "muted";
  const fill =
    tone === "primary"
      ? "hsl(var(--primary) / 0.10)"
      : tone === "success"
      ? "hsl(var(--success) / 0.10)"
      : tone === "warning"
      ? "hsl(var(--warning) / 0.10)"
      : "hsl(var(--muted) / 0.30)";
  const stroke =
    tone === "primary"
      ? "hsl(var(--primary))"
      : tone === "success"
      ? "hsl(var(--success))"
      : tone === "warning"
      ? "hsl(var(--warning))"
      : "hsl(var(--border))";

  const labelColor =
    tone === "primary"
      ? "hsl(var(--primary))"
      : tone === "success"
      ? "hsl(var(--success))"
      : "hsl(var(--foreground))";

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeOpacity={tone === "muted" ? 0.6 : 0.8}
        strokeWidth={1.4}
      />
      <text
        x={node.x + node.w / 2}
        y={node.y + node.h / 2 - 4}
        textAnchor="middle"
        fill={labelColor}
        style={{ font: "600 14px Inter, system-ui, sans-serif" }}
      >
        {node.label}
      </text>
      {node.sub && (
        <text
          x={node.x + node.w / 2}
          y={node.y + node.h / 2 + 14}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          style={{ font: "500 10px JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          {node.sub}
        </text>
      )}
    </g>
  );
}

/* ─────────────── Animated flow dot along a path ─────────────── */
function FlowDot({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <circle r={2.5} fill="hsl(var(--primary))" filter="url(#line-glow)">
      <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${delay}s`} path={d} />
    </circle>
  );
}

/* ─────────────── Sensor pin (HTML overlay) ─────────────── */
function Pin({
  pin,
  value,
  status,
  viewBox,
  isHovered,
  setHovered,
}: {
  pin: SensorPin;
  value: string;
  status: PinStatus;
  viewBox: { w: number; h: number };
  isHovered: boolean;
  setHovered: (id: string | null) => void;
}) {
  const tok = statusToken[status];
  const left = `${(pin.x / viewBox.w) * 100}%`;
  const top = `${(pin.y / viewBox.h) * 100}%`;

  return (
    <div
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left, top }}
      onMouseEnter={() => setHovered(pin.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`${pin.label} sensor ${pin.id}: ${value}`}
            className="group relative flex h-5 w-5 items-center justify-center"
          >
            {/* Outer pulse ring */}
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-60",
                status === "offline" ? "" : "animate-ping",
                tok.dot
              )}
              style={{ animationDuration: "2.2s" }}
            />
            {/* Inner solid dot */}
            <span
              className={cn(
                "relative h-2.5 w-2.5 rounded-full ring-2 transition-transform group-hover:scale-125",
                tok.dot,
                tok.ring,
                tok.glow
              )}
            />
            {/* Hover label */}
            {isHovered && (
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-mono text-foreground shadow-md animate-fade-in"
                )}
              >
                {pin.id} · {value}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          className="w-56 border-border bg-popover p-0 text-popover-foreground"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {pin.id}
              </span>
              <span className="text-sm font-semibold text-foreground">{pin.label}</span>
            </div>
            <span className={cn("flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest", tok.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", tok.dot)} />
              {tok.label}
            </span>
          </div>
          <div className="px-3 py-3">
            <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              live · 1Hz · {pin.kind}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ─────────────── Legend chip ─────────────── */
function Legend({ tone, label }: { tone: "success" | "warning" | "destructive"; label: string }) {
  const dot =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";
  const text =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive";
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1", text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
