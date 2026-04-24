import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  plantLayouts,
  type PlantEquipment,
  type SensorPin,
} from "@/lib/plantLayouts";
import { getCompany, type CompanyId } from "@/lib/companies";
import type { useMockData } from "@/hooks/useMockData";

type LiveData = ReturnType<typeof useMockData>;

type PinStatus = "ok" | "warn" | "offline";

function lastValue(arr: { v?: number }[]): number | null {
  if (!arr || arr.length === 0) return null;
  const last = arr[arr.length - 1];
  return typeof last.v === "number" ? last.v : null;
}

/** Resolve live value + threshold-based status for a pin (company-aware). */
function resolvePin(
  pin: SensorPin,
  data: LiveData,
  activeCompany: CompanyId
): { value: string; status: PinStatus; raw: number | null } {
  const baseline = getCompany(activeCompany).baseline;
  switch (pin.kind) {
    case "pressure": {
      const v = lastValue(data.pressure);
      if (v == null) return { value: "—", status: "ok", raw: null };
      // Warn if >15% off baseline
      const dev = Math.abs(v - baseline.pressure) / baseline.pressure;
      const status: PinStatus = dev > 0.15 ? "warn" : "ok";
      return { value: `${v.toFixed(2)} ${pin.unit}`, status, raw: v };
    }
    case "flow": {
      const v = lastValue(data.flow);
      if (v == null) return { value: "—", status: "ok", raw: null };
      const dev = Math.abs(v - baseline.flow) / baseline.flow;
      const status: PinStatus = dev > 0.2 ? "warn" : "ok";
      return { value: `${v.toFixed(2)} ${pin.unit}`, status, raw: v };
    }
    case "conductivity": {
      const v = lastValue(data.conductivity);
      if (v == null) return { value: "—", status: "ok", raw: null };
      const dev = Math.abs(v - baseline.conductivity) / baseline.conductivity;
      const status: PinStatus = dev > 0.2 ? "warn" : "ok";
      return { value: `${v.toFixed(0)} ${pin.unit}`, status, raw: v };
    }
    case "raman": {
      const peaks = 4;
      return { value: `${peaks} peaks`, status: data.anomaly ? "warn" : "ok", raw: peaks };
    }
    case "temperature": {
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

const statusToken: Record<PinStatus, { glow: string; ring: string; dot: string; text: string; label: string; chip: string }> = {
  ok: {
    glow: "shadow-[0_0_14px_hsl(var(--success)/0.55)]",
    ring: "ring-success/60",
    dot: "bg-success",
    text: "text-success",
    label: "Nominal",
    chip: "border-success/40 bg-success/10 text-success",
  },
  warn: {
    glow: "shadow-[0_0_14px_hsl(var(--warning)/0.6)]",
    ring: "ring-warning/70",
    dot: "bg-warning",
    text: "text-warning",
    label: "Warning",
    chip: "border-warning/40 bg-warning/10 text-warning",
  },
  offline: {
    glow: "shadow-[0_0_10px_hsl(var(--destructive)/0.5)]",
    ring: "ring-destructive/60",
    dot: "bg-destructive",
    text: "text-destructive",
    label: "Offline",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
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
    () => layout.sensors.map((p) => ({ pin: p, ...resolvePin(p, data, activeCompany) })),
    [layout, data, activeCompany]
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
            DIGITAL TWIN · {company.node} · {company.region}
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
          <defs>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Steel pipe gradient */}
            <linearGradient id="pipe-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
            </linearGradient>
            {/* Tank gradient — vertical cylinder */}
            <linearGradient id="tank-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.15" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.15" />
            </linearGradient>
            {/* Membrane tube gradient — horizontal */}
            <linearGradient id="membrane-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.10" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.30" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Pipes — drawn FIRST so equipment sits on top */}
          <g>
            {layout.pipes.map((p, i) => {
              const w = p.width ?? 8;
              return (
                <g key={i}>
                  {/* Glow underlay (dark only) */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeOpacity={0.25}
                    strokeWidth={w + 4}
                    strokeLinecap="round"
                    className="hidden dark:block"
                    filter="url(#line-glow)"
                  />
                  {/* Outer pipe wall */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeOpacity={0.55}
                    strokeWidth={w}
                    strokeLinecap="round"
                  />
                  {/* Inner highlight — gives the steel look */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="hsl(var(--background))"
                    strokeOpacity={0.35}
                    strokeWidth={Math.max(1, w - 5)}
                    strokeLinecap="round"
                  />
                  {p.flow && <FlowDot d={p.d} delay={(i % 3) * 0.6} />}
                </g>
              );
            })}
          </g>

          {/* Equipment */}
          {layout.equipment.map((eq) => (
            <Equipment key={eq.id} eq={eq} />
          ))}
        </svg>

        {/* Sensor pins overlay (HTML for popovers + permanent labels) */}
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

/* ─────────────── Equipment renderer ─────────────── */
function Equipment({ eq }: { eq: PlantEquipment }) {
  const tone = eq.tone ?? "muted";
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

  const cx = eq.x + eq.w / 2;
  const cy = eq.y + eq.h / 2;

  switch (eq.kind) {
    case "tank":
      return (
        <g>
          {/* Vertical cylinder body */}
          <rect
            x={eq.x}
            y={eq.y + 14}
            width={eq.w}
            height={eq.h - 28}
            fill="url(#tank-grad)"
            stroke={stroke}
            strokeWidth={1.6}
          />
          {/* Top dome */}
          <ellipse cx={cx} cy={eq.y + 14} rx={eq.w / 2} ry={14} fill="url(#tank-grad)" stroke={stroke} strokeWidth={1.6} />
          {/* Bottom dome */}
          <ellipse cx={cx} cy={eq.y + eq.h - 14} rx={eq.w / 2} ry={14} fill="url(#tank-grad)" stroke={stroke} strokeWidth={1.6} />
          {/* Liquid level indicator */}
          <rect
            x={eq.x + 8}
            y={eq.y + eq.h * 0.45}
            width={eq.w - 16}
            height={eq.h * 0.4}
            fill="hsl(var(--primary) / 0.18)"
          />
          <EquipmentLabel x={cx} y={eq.y + eq.h + 18} label={eq.label} sub={eq.sub} color={labelColor} />
        </g>
      );

    case "membrane":
      return (
        <g>
          {/* Horizontal tube body */}
          <rect
            x={eq.x + 18}
            y={eq.y}
            width={eq.w - 36}
            height={eq.h}
            fill="url(#membrane-grad)"
            stroke={stroke}
            strokeWidth={1.8}
          />
          {/* End caps */}
          <ellipse cx={eq.x + 18} cy={cy} rx={18} ry={eq.h / 2} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={1.8} />
          <ellipse cx={eq.x + eq.w - 18} cy={cy} rx={18} ry={eq.h / 2} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={1.8} />
          {/* Internal striations — membrane fibers */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={i}
              x1={eq.x + 30}
              x2={eq.x + eq.w - 30}
              y1={eq.y + ((i + 1) * eq.h) / 6}
              y2={eq.y + ((i + 1) * eq.h) / 6}
              stroke={stroke}
              strokeOpacity={0.35}
              strokeWidth={0.8}
            />
          ))}
          {/* Inline label inside tube */}
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fill={labelColor}
            style={{ font: "600 12px Inter, system-ui, sans-serif", letterSpacing: "0.04em" }}
          >
            {eq.label}
          </text>
          {eq.sub && (
            <text
              x={cx}
              y={eq.y + eq.h + 16}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              style={{ font: "500 10px JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {eq.sub}
            </text>
          )}
        </g>
      );

    case "vessel":
      return (
        <g>
          <rect
            x={eq.x}
            y={eq.y}
            width={eq.w}
            height={eq.h}
            rx={14}
            fill="hsl(var(--muted) / 0.25)"
            stroke={stroke}
            strokeWidth={1.6}
          />
          {/* Internal divider hint */}
          <line
            x1={eq.x + 8}
            x2={eq.x + eq.w - 8}
            y1={eq.y + eq.h * 0.5}
            y2={eq.y + eq.h * 0.5}
            stroke={stroke}
            strokeOpacity={0.35}
            strokeDasharray="3 3"
          />
          <EquipmentLabel x={cx} y={cy + 4} label={eq.label} sub={eq.sub} color={labelColor} inline />
        </g>
      );

    case "pump": {
      const r = Math.min(eq.w, eq.h) / 2;
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="hsl(var(--muted) / 0.30)" stroke={stroke} strokeWidth={1.8} />
          {/* Impeller cross */}
          <line x1={cx - r * 0.6} y1={cy} x2={cx + r * 0.6} y2={cy} stroke={stroke} strokeWidth={1.4} />
          <line x1={cx} y1={cy - r * 0.6} x2={cx} y2={cy + r * 0.6} stroke={stroke} strokeWidth={1.4} />
          {/* Discharge notch */}
          <rect x={cx - 4} y={eq.y - 8} width={8} height={10} fill={stroke} opacity={0.7} />
          <EquipmentLabel x={cx} y={eq.y + eq.h + 16} label={eq.label} sub={eq.sub} color={labelColor} />
        </g>
      );
    }

    case "intake": {
      // Trapezoidal hopper
      const path = `M ${eq.x} ${eq.y} L ${eq.x + eq.w} ${eq.y} L ${eq.x + eq.w - 16} ${eq.y + eq.h} L ${eq.x + 16} ${eq.y + eq.h} Z`;
      return (
        <g>
          <path d={path} fill="hsl(var(--muted) / 0.30)" stroke={stroke} strokeWidth={1.6} />
          {/* Wave hint */}
          <path
            d={`M ${eq.x + 14} ${eq.y + 26} q 10 -8 20 0 t 20 0 t 20 0`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeOpacity={0.55}
            strokeWidth={1.4}
          />
          <EquipmentLabel x={cx} y={eq.y + eq.h + 16} label={eq.label} sub={eq.sub} color={labelColor} />
        </g>
      );
    }

    case "output":
      return (
        <g>
          <rect
            x={eq.x}
            y={eq.y}
            width={eq.w}
            height={eq.h}
            rx={6}
            fill="hsl(var(--success) / 0.12)"
            stroke={stroke}
            strokeWidth={1.8}
          />
          <EquipmentLabel x={cx} y={cy + 4} label={eq.label} sub={eq.sub} color={labelColor} inline />
        </g>
      );

    case "controller":
    default:
      return (
        <g>
          <rect
            x={eq.x}
            y={eq.y}
            width={eq.w}
            height={eq.h}
            rx={8}
            fill="hsl(var(--primary) / 0.08)"
            stroke={stroke}
            strokeDasharray="4 3"
            strokeWidth={1.4}
          />
          <EquipmentLabel x={cx} y={cy + 4} label={eq.label} sub={eq.sub} color={labelColor} inline />
        </g>
      );
  }
}

function EquipmentLabel({
  x,
  y,
  label,
  sub,
  color,
  inline,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
  color: string;
  inline?: boolean;
}) {
  return (
    <>
      <text
        x={x}
        y={inline ? y - 6 : y}
        textAnchor="middle"
        fill={color}
        style={{ font: "700 12px Inter, system-ui, sans-serif", letterSpacing: "0.06em" }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={inline ? y + 10 : y + 14}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          style={{ font: "500 10px JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          {sub}
        </text>
      )}
    </>
  );
}

/* ─────────────── Animated flow dot along a path ─────────────── */
function FlowDot({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <circle r={3} fill="hsl(var(--primary))" filter="url(#line-glow)">
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

  // Permanent label position relative to pin
  const anchor = pin.anchor ?? "right";
  const labelPos: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

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
            {/* Crosshair tick — anchors visually to pipe */}
            <span
              className={cn(
                "absolute h-px w-3.5 opacity-70",
                tok.dot
              )}
            />
            <span
              className={cn(
                "absolute h-3.5 w-px opacity-70",
                tok.dot
              )}
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

            {/* Permanent compact tag (sensor ID) */}
            <span
              className={cn(
                "pointer-events-none absolute whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none tracking-wider shadow-sm",
                tok.chip,
                labelPos[anchor]
              )}
            >
              {pin.id}
            </span>

            {/* Hover detail label */}
            {isHovered && (
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full mt-5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-mono text-foreground shadow-md animate-fade-in z-20"
                )}
              >
                {pin.label} · {value}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          className="w-60 border-border bg-popover p-0 text-popover-foreground"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                TAG · {pin.id}
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
