import { useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  plantLayouts,
  type PlantEquipment,
  type PlantLayout,
  type SensorPin,
} from "@/lib/plantLayouts";
import { getCompany, type CompanyId } from "@/lib/companies";
import { useTheme } from "@/components/naiade/ThemeProvider";
import type { useMockData } from "@/hooks/useMockData";

type LiveData = ReturnType<typeof useMockData>;

type PinStatus = "ok" | "warn" | "offline";

function lastValue(arr: { v?: number }[]): number | null {
  if (!arr || arr.length === 0) return null;
  const last = arr[arr.length - 1];
  return typeof last.v === "number" ? last.v : null;
}

type Resolved = {
  value: string;
  status: PinStatus;
  raw: number | null;
  /** Operating target string for the side panel. */
  target: string;
};

/** Resolve live value + threshold-based status for a pin (company-aware). */
function resolvePin(
  pin: SensorPin,
  data: LiveData,
  activeCompany: CompanyId
): Resolved {
  const baseline = getCompany(activeCompany).baseline;
  switch (pin.kind) {
    case "pressure": {
      const v = lastValue(data.pressure);
      const target = `${(baseline.pressure * 0.9).toFixed(1)}–${(baseline.pressure * 1.1).toFixed(1)} bar`;
      if (v == null) return { value: "—", status: "ok", raw: null, target };
      const dev = Math.abs(v - baseline.pressure) / baseline.pressure;
      const status: PinStatus = dev > 0.15 ? "warn" : "ok";
      return { value: `${v.toFixed(2)} ${pin.unit}`, status, raw: v, target };
    }
    case "flow": {
      const v = lastValue(data.flow);
      const target = `${(baseline.flow * 0.85).toFixed(2)}–${(baseline.flow * 1.15).toFixed(2)} m³/h`;
      if (v == null) return { value: "—", status: "ok", raw: null, target };
      const dev = Math.abs(v - baseline.flow) / baseline.flow;
      const status: PinStatus = dev > 0.2 ? "warn" : "ok";
      return { value: `${v.toFixed(2)} ${pin.unit}`, status, raw: v, target };
    }
    case "conductivity": {
      const v = lastValue(data.conductivity);
      const target = `< ${Math.round(baseline.conductivity * 1.2)} µS/cm`;
      if (v == null) return { value: "—", status: "ok", raw: null, target };
      const dev = Math.abs(v - baseline.conductivity) / baseline.conductivity;
      const status: PinStatus = dev > 0.2 ? "warn" : "ok";
      return { value: `${v.toFixed(0)} ${pin.unit}`, status, raw: v, target };
    }
    case "raman": {
      const peaks = 4;
      return {
        value: `${peaks} peaks`,
        status: data.anomaly ? "warn" : "ok",
        raw: peaks,
        target: "3–5 peaks @ 1080 cm⁻¹",
      };
    }
    case "temperature": {
      const ms = data.latency[data.latency.length - 1]?.ms ?? 5;
      const v = 22 + (ms % 3);
      return { value: `${v.toFixed(1)} ${pin.unit}`, status: "ok", raw: v, target: "18–28 °C" };
    }
    case "ph":
      return { value: `7.2 ${pin.unit}`, status: "ok", raw: 7.2, target: "6.8–7.6 pH" };
    case "turbidity":
      return { value: `0.08 ${pin.unit}`, status: "ok", raw: 0.08, target: "< 0.2 NTU" };
    case "oxygen":
      return { value: "—", status: "offline", raw: null, target: "< 10 ppb" };
    default:
      return { value: "—", status: "ok", raw: null, target: "—" };
  }
}

const statusToken: Record<
  PinStatus,
  { glow: string; ring: string; dot: string; text: string; label: string; chip: string; bgSoft: string }
> = {
  ok: {
    glow: "shadow-[0_0_10px_hsl(var(--success)/0.6)]",
    ring: "ring-success/70",
    dot: "bg-success",
    text: "text-success",
    label: "Nominal",
    chip: "border-success/40 bg-success/10 text-success",
    bgSoft: "bg-success/10",
  },
  warn: {
    glow: "shadow-[0_0_10px_hsl(var(--warning)/0.65)]",
    ring: "ring-warning/70",
    dot: "bg-warning",
    text: "text-warning",
    label: "Warning",
    chip: "border-warning/40 bg-warning/10 text-warning",
    bgSoft: "bg-warning/10",
  },
  offline: {
    glow: "shadow-[0_0_8px_hsl(var(--destructive)/0.55)]",
    ring: "ring-destructive/60",
    dot: "bg-destructive",
    text: "text-destructive",
    label: "Offline",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
    bgSoft: "bg-destructive/10",
  },
};

/* ─────────────── Selection model ─────────────── */
type Selection =
  | { type: "sensor"; pin: SensorPin; resolved: Resolved }
  | { type: "equipment"; eq: PlantEquipment }
  | null;

export function PlantMap({
  activeCompany,
  data,
}: {
  activeCompany: CompanyId;
  data: LiveData;
}) {
  const layout = plantLayouts[activeCompany];
  const company = getCompany(activeCompany);
  const [selection, setSelection] = useState<Selection>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const resolvedPins = useMemo(
    () => layout.sensors.map((p) => ({ pin: p, ...resolvePin(p, data, activeCompany) })),
    [layout, data, activeCompany]
  );

  const nominal = resolvedPins.filter((p) => p.status === "ok").length;
  const warn = resolvedPins.filter((p) => p.status === "warn").length;
  const offline = resolvedPins.filter((p) => p.status === "offline").length;

  // Reset selection when company changes
  const lastCompany = useRef(activeCompany);
  if (lastCompany.current !== activeCompany) {
    lastCompany.current = activeCompany;
    if (selection) setSelection(null);
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 animate-fade-in">
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

      {/* Map + Sidebar */}
      <div className="flex min-h-0 flex-1 gap-3">
        {/* Map surface */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm light:bg-card light:shadow-sm">
          {/* Blueprint grid */}
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.18] light:opacity-[0.4]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            limitToBounds={false}
            centerOnInit
            wheel={{ step: 0.15 }}
            doubleClick={{ disabled: true }}
            panning={{
              velocityDisabled: true,
              // Allow click-drag panning on the entire SVG surface; only
              // exclude interactive elements (pins / equipment groups) so
              // single clicks still register as selections.
              excluded: ["plant-pin", "plant-equipment"],
            }}
          >
            <TransformComponent
              wrapperClass="!h-full !w-full cursor-grab active:cursor-grabbing"
              contentClass="!h-full !w-full cursor-grab active:cursor-grabbing"
            >
              <PlantSvg
                layout={layout}
                resolvedPins={resolvedPins}
                selection={selection}
                onSelectSensor={(pin, resolved) =>
                  setSelection({ type: "sensor", pin, resolved })
                }
                onSelectEquipment={(eq) => setSelection({ type: "equipment", eq })}
              />
            </TransformComponent>

            {/* Floating zoom controls */}
            <ZoomControls />
          </TransformWrapper>
        </div>

        {/* Right details sidebar */}
        <DetailsSidebar
          selection={selection}
          activeCompany={activeCompany}
          onClose={() => setSelection(null)}
        />
      </div>
    </div>
  );
}

/* ─────────────── Zoom control panel ─────────────── */
function ZoomControls() {
  // We rely on the TransformWrapper context via render-prop alternative — but
  // the simpler approach: imperative ref consumers. Use the hook from library:
  // keeping it lightweight by reading off the wrapper via querySelector-free
  // approach using the library's `useControls` hook.
  const { zoomIn, zoomOut, resetTransform } = useTransformControls();

  return (
    <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5 rounded-lg border border-border/60 bg-card/90 p-1.5 backdrop-blur-md shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-foreground hover:bg-primary/15 hover:text-primary"
        onClick={() => zoomIn(0.3)}
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-foreground hover:bg-primary/15 hover:text-primary"
        onClick={() => zoomOut(0.3)}
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-foreground hover:bg-primary/15 hover:text-primary"
        onClick={() => resetTransform()}
        aria-label="Reset view"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/** Tiny wrapper so callers can keep using the same name. */
function useTransformControls() {
  return useControls();
}

/* ─────────────── SVG renderer ─────────────── */
function PlantSvg({
  layout,
  resolvedPins,
  selection,
  onSelectSensor,
  onSelectEquipment,
}: {
  layout: PlantLayout;
  resolvedPins: { pin: SensorPin; value: string; status: PinStatus; raw: number | null; target: string }[];
  selection: Selection;
  onSelectSensor: (pin: SensorPin, r: Resolved) => void;
  onSelectEquipment: (eq: PlantEquipment) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="plant-interactive relative z-10 h-full w-full select-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <defs>
        <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="tank-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.15" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="membrane-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.10" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.30" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.10" />
        </linearGradient>
      </defs>

      {/* Pipes — clean, thin, schematic style */}
      <g>
        {layout.pipes.map((p, i) => {
          const w = p.width ?? 2;
          return (
            <g key={i}>
              <path
                d={p.d}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeOpacity={0.85}
                strokeWidth={w}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {p.flow && <FlowDot d={p.d} delay={(i % 3) * 0.6} />}
            </g>
          );
        })}
      </g>

      {/* Equipment */}
      {layout.equipment.map((eq) => (
        <Equipment
          key={eq.id}
          eq={eq}
          selected={selection?.type === "equipment" && selection.eq.id === eq.id}
          onSelect={() => onSelectEquipment(eq)}
        />
      ))}

      {/* Sensor pins (in-SVG so they zoom with the diagram) */}
      {resolvedPins.map(({ pin, value, status, raw, target }) => (
        <SensorMark
          key={pin.id}
          pin={pin}
          status={status}
          selected={selection?.type === "sensor" && selection.pin.id === pin.id}
          onSelect={() => onSelectSensor(pin, { value, status, raw, target })}
        />
      ))}
    </svg>
  );
}

/* ─────────────── Equipment renderer ─────────────── */
function Equipment({
  eq,
  selected,
  onSelect,
}: {
  eq: PlantEquipment;
  selected: boolean;
  onSelect: () => void;
}) {
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
  const sw = selected ? 2.4 : 1.4;

  const wrap = (children: React.ReactNode) => (
    <g
      onClick={onSelect}
      className="cursor-pointer transition-opacity hover:opacity-90"
      style={{ outline: "none" }}
    >
      {children}
      {/* Selection halo */}
      {selected && (
        <rect
          x={eq.x - 6}
          y={eq.y - 6}
          width={eq.w + 12}
          height={eq.h + 12}
          rx={10}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeOpacity={0.9}
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
      )}
    </g>
  );

  switch (eq.kind) {
    case "tank":
      return wrap(
        <g>
          <rect x={eq.x} y={eq.y + 14} width={eq.w} height={eq.h - 28} fill="url(#tank-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={cx} cy={eq.y + 14} rx={eq.w / 2} ry={14} fill="url(#tank-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={cx} cy={eq.y + eq.h - 14} rx={eq.w / 2} ry={14} fill="url(#tank-grad)" stroke={stroke} strokeWidth={sw} />
          <rect x={eq.x + 8} y={eq.y + eq.h * 0.45} width={eq.w - 16} height={eq.h * 0.4} fill="hsl(var(--primary) / 0.18)" />
          <EquipmentLabel x={cx} y={eq.y + eq.h + 22} label={eq.label} sub={eq.sub} color={labelColor} />
        </g>
      );

    case "membrane":
      return wrap(
        <g>
          <rect x={eq.x + 18} y={eq.y} width={eq.w - 36} height={eq.h} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={eq.x + 18} cy={cy} rx={18} ry={eq.h / 2} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={eq.x + eq.w - 18} cy={cy} rx={18} ry={eq.h / 2} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={sw} />
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={i}
              x1={eq.x + 30}
              x2={eq.x + eq.w - 30}
              y1={eq.y + ((i + 1) * eq.h) / 6}
              y2={eq.y + ((i + 1) * eq.h) / 6}
              stroke={stroke}
              strokeOpacity={0.35}
              strokeWidth={0.7}
            />
          ))}
          <CapsuleLabel x={cx} y={cy} label={eq.label} color={labelColor} />
          {eq.sub && <SubLabel x={cx} y={eq.y + eq.h + 18} text={eq.sub} />}
        </g>
      );

    case "vessel":
      return wrap(
        <g>
          <rect x={eq.x} y={eq.y} width={eq.w} height={eq.h} rx={14} fill="hsl(var(--muted) / 0.25)" stroke={stroke} strokeWidth={sw} />
          <line
            x1={eq.x + 8}
            x2={eq.x + eq.w - 8}
            y1={eq.y + eq.h * 0.5}
            y2={eq.y + eq.h * 0.5}
            stroke={stroke}
            strokeOpacity={0.35}
            strokeDasharray="3 3"
          />
          <CapsuleLabel x={cx} y={cy - 6} label={eq.label} color={labelColor} />
          {eq.sub && <SubLabel x={cx} y={cy + 14} text={eq.sub} />}
        </g>
      );

    case "pump": {
      const r = Math.min(eq.w, eq.h) / 2;
      return wrap(
        <g>
          <circle cx={cx} cy={cy} r={r} fill="hsl(var(--muted) / 0.30)" stroke={stroke} strokeWidth={sw} />
          <line x1={cx - r * 0.6} y1={cy} x2={cx + r * 0.6} y2={cy} stroke={stroke} strokeWidth={1.2} />
          <line x1={cx} y1={cy - r * 0.6} x2={cx} y2={cy + r * 0.6} stroke={stroke} strokeWidth={1.2} />
          <rect x={cx - 4} y={eq.y - 8} width={8} height={10} fill={stroke} opacity={0.7} />
          <EquipmentLabel x={cx} y={eq.y + eq.h + 22} label={eq.label} sub={eq.sub} color={labelColor} />
        </g>
      );
    }

    case "intake": {
      const path = `M ${eq.x} ${eq.y} L ${eq.x + eq.w} ${eq.y} L ${eq.x + eq.w - 16} ${eq.y + eq.h} L ${eq.x + 16} ${eq.y + eq.h} Z`;
      return wrap(
        <g>
          <path d={path} fill="hsl(var(--muted) / 0.30)" stroke={stroke} strokeWidth={sw} />
          <path
            d={`M ${eq.x + 14} ${eq.y + 26} q 10 -8 20 0 t 20 0 t 20 0`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeOpacity={0.55}
            strokeWidth={1.2}
          />
          <EquipmentLabel x={cx} y={eq.y + eq.h + 22} label={eq.label} sub={eq.sub} color={labelColor} />
        </g>
      );
    }

    case "output":
      return wrap(
        <g>
          <rect x={eq.x} y={eq.y} width={eq.w} height={eq.h} rx={6} fill="hsl(var(--success) / 0.12)" stroke={stroke} strokeWidth={sw} />
          <CapsuleLabel x={cx} y={cy - 4} label={eq.label} color={labelColor} />
          {eq.sub && <SubLabel x={cx} y={cy + 12} text={eq.sub} />}
        </g>
      );

    case "controller":
    default:
      return wrap(
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
            strokeWidth={sw}
          />
          <CapsuleLabel x={cx} y={cy - 4} label={eq.label} color={labelColor} />
          {eq.sub && <SubLabel x={cx} y={cy + 12} text={eq.sub} />}
        </g>
      );
  }
}

/* Solid background capsule label — pipes will not strike through. */
function CapsuleLabel({
  x,
  y,
  label,
  color,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
}) {
  // Approx width (chars * px). We avoid getBBox so this works during initial render.
  const padX = 8;
  const padY = 4;
  const charW = 6.6;
  const w = Math.max(40, label.length * charW + padX * 2);
  const h = 16 + padY * 2;
  return (
    <g pointerEvents="none">
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={4}
        className="fill-slate-900 dark:fill-slate-900"
        fill="hsl(222 47% 11%)"
        stroke="hsl(var(--border))"
        strokeOpacity={0.6}
        strokeWidth={0.8}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={color}
        style={{ font: "700 11px Inter, system-ui, sans-serif", letterSpacing: "0.06em" }}
      >
        {label}
      </text>
    </g>
  );
}

function SubLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="hsl(var(--muted-foreground))"
      pointerEvents="none"
      style={{ font: "500 9px JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
    >
      {text}
    </text>
  );
}

function EquipmentLabel({
  x,
  y,
  label,
  sub,
  color,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
  color: string;
}) {
  return (
    <g>
      <CapsuleLabel x={x} y={y} label={label} color={color} />
      {sub && <SubLabel x={x} y={y + 18} text={sub} />}
    </g>
  );
}

/* ─────────────── Animated flow dot along a path ─────────────── */
function FlowDot({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <circle r={2.2} fill="hsl(var(--primary))" filter="url(#line-glow)">
      <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${delay}s`} path={d} />
    </circle>
  );
}

/* ─────────────── Sensor mark (rendered in-SVG) ─────────────── */
function SensorMark({
  pin,
  status,
  selected,
  onSelect,
}: {
  pin: SensorPin;
  status: PinStatus;
  selected: boolean;
  onSelect: () => void;
}) {
  const color =
    status === "warn"
      ? "hsl(var(--warning))"
      : status === "offline"
      ? "hsl(var(--destructive))"
      : "hsl(var(--success))";

  // Permanent ID tag offset
  const anchor = pin.anchor ?? "right";
  const off = 14;
  const tag = (() => {
    switch (anchor) {
      case "top":
        return { tx: pin.x, ty: pin.y - off, anchor: "middle" as const };
      case "bottom":
        return { tx: pin.x, ty: pin.y + off + 8, anchor: "middle" as const };
      case "left":
        return { tx: pin.x - off, ty: pin.y + 3, anchor: "end" as const };
      case "right":
      default:
        return { tx: pin.x + off, ty: pin.y + 3, anchor: "start" as const };
    }
  })();

  // Capsule sizing for ID
  const labelW = pin.id.length * 6 + 10;
  const labelH = 13;
  const labelRect = (() => {
    switch (tag.anchor) {
      case "middle":
        return { x: tag.tx - labelW / 2, y: tag.ty - labelH + 2 };
      case "end":
        return { x: tag.tx - labelW + 2, y: tag.ty - labelH + 2 };
      case "start":
      default:
        return { x: tag.tx - 2, y: tag.ty - labelH + 2 };
    }
  })();

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="cursor-pointer"
    >
      {/* Anchor crosshair tying the pin to the pipe */}
      <line x1={pin.x - 5} y1={pin.y} x2={pin.x + 5} y2={pin.y} stroke={color} strokeOpacity={0.55} strokeWidth={0.8} />
      <line x1={pin.x} y1={pin.y - 5} x2={pin.x} y2={pin.y + 5} stroke={color} strokeOpacity={0.55} strokeWidth={0.8} />

      {/* Outer pulse */}
      <circle cx={pin.x} cy={pin.y} r={5} fill={color} fillOpacity={0.18}>
        {status !== "offline" && (
          <animate attributeName="r" values="3.5;7;3.5" dur="2.2s" repeatCount="indefinite" />
        )}
      </circle>
      {/* Selection halo */}
      {selected && (
        <circle cx={pin.x} cy={pin.y} r={9} fill="none" stroke={color} strokeOpacity={0.9} strokeWidth={1.2} strokeDasharray="2 2" />
      )}
      {/* Solid dot */}
      <circle
        cx={pin.x}
        cy={pin.y}
        r={2.6}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth={0.8}
        filter="url(#line-glow)"
      />

      {/* Permanent ID capsule */}
      <g pointerEvents="none">
        <rect
          x={labelRect.x}
          y={labelRect.y}
          width={labelW}
          height={labelH}
          rx={3}
          fill="hsl(222 47% 11%)"
          stroke={color}
          strokeOpacity={0.6}
          strokeWidth={0.6}
        />
        <text
          x={tag.tx + (tag.anchor === "start" ? 4 : tag.anchor === "end" ? -4 : 0)}
          y={tag.ty - 2}
          textAnchor={tag.anchor}
          fill={color}
          style={{ font: "600 9px JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.06em" }}
        >
          {pin.id}
        </text>
      </g>
    </g>
  );
}

/* ─────────────── Right-side details sidebar ─────────────── */
function DetailsSidebar({
  selection,
  activeCompany,
  onClose,
}: {
  selection: Selection;
  activeCompany: CompanyId;
  onClose: () => void;
}) {
  const company = getCompany(activeCompany);

  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm md:flex">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            COMPONENT DETAILS
          </span>
          <span className="text-sm font-semibold text-foreground">{company.shortName} · {company.node}</span>
        </div>
        {selection && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!selection && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-2 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-border/60 text-primary">
              <Plus className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-sm font-light text-muted-foreground">
              Select a node or sensor on the map to view technical details.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Scroll to zoom · Drag to pan
            </p>
          </div>
        )}

        {selection?.type === "sensor" && (
          <SensorDetails sel={selection} />
        )}

        {selection?.type === "equipment" && (
          <EquipmentDetails eq={selection.eq} />
        )}
      </div>
    </aside>
  );
}

function SensorDetails({
  sel,
}: {
  sel: Extract<Selection, { type: "sensor" }>;
}) {
  const { pin, resolved } = sel;
  const tok = statusToken[resolved.status];
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div>
        <span className={cn("inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest", tok.chip)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", tok.dot)} />
          {tok.label}
        </span>
        <h2 className="mt-2 text-base font-semibold text-foreground">{pin.label}</h2>
        <p className="font-mono text-[11px] text-muted-foreground">
          TAG · {pin.id} · {pin.kind.toUpperCase()}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {pin.description ?? "Live process sensor."}
      </p>

      <div className={cn("rounded-lg border border-border/60 px-3 py-3", tok.bgSoft)}>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          LIVE TELEMETRY
        </div>
        <div className={cn("mt-1 font-mono text-3xl font-semibold tracking-tight", tok.text)}>
          {resolved.value}
        </div>
        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
          1 Hz · streaming
        </div>
      </div>

      <DetailRow label="Operating target" value={resolved.target} />
      <DetailRow label="Status" value={tok.label} valueClass={tok.text} />
      <DetailRow label="Sensor kind" value={pin.kind} mono />
      <DetailRow label="Tag ID" value={pin.id} mono />
    </div>
  );
}

function EquipmentDetails({ eq }: { eq: PlantEquipment }) {
  const toneText =
    eq.tone === "primary"
      ? "text-primary"
      : eq.tone === "success"
      ? "text-success"
      : eq.tone === "warning"
      ? "text-warning"
      : "text-foreground";

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {eq.kind}
        </span>
        <h2 className={cn("mt-2 text-base font-semibold", toneText)}>{eq.label}</h2>
        {eq.sub && (
          <p className="font-mono text-[11px] text-muted-foreground">{eq.sub}</p>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {eq.description ?? "Process unit in the treatment train."}
      </p>

      <DetailRow label="Component ID" value={eq.id} mono />
      <DetailRow label="Type" value={eq.kind} mono />
      {eq.sub && <DetailRow label="Service" value={eq.sub} />}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClass,
  mono,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-right text-xs",
          mono && "font-mono",
          valueClass ?? "text-foreground"
        )}
      >
        {value}
      </span>
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
