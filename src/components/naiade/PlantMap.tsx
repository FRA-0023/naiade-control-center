import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  type EquipmentKind,
  type PlantLayout,
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

  // ── Auto-fit viewBox: tight bbox of all equipment + sensors with 8% padding.
  // This guarantees the SVG content fills its container with no dead corners.
  const fittedViewBox = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const eq of layout.equipment) {
      minX = Math.min(minX, eq.x);
      minY = Math.min(minY, eq.y);
      maxX = Math.max(maxX, eq.x + eq.w);
      maxY = Math.max(maxY, eq.y + eq.h);
    }
    for (const s of layout.sensors) {
      minX = Math.min(minX, s.x - 30);
      minY = Math.min(minY, s.y - 30);
      maxX = Math.max(maxX, s.x + 30);
      maxY = Math.max(maxY, s.y + 30);
    }
    const w = maxX - minX;
    const h = maxY - minY;
    const padX = w * 0.06;
    const padY = h * 0.08;
    return { x: minX - padX, y: minY - padY, w: w + padX * 2, h: h + padY * 2 };
  }, [layout]);

  const resolvedPins = useMemo(
    () => layout.sensors.map((p) => ({ pin: p, ...resolvePin(p, data, activeCompany) })),
    [layout, data, activeCompany]
  );

  const nominal = resolvedPins.filter((p) => p.status === "ok").length;
  const warn = resolvedPins.filter((p) => p.status === "warn").length;
  const offline = resolvedPins.filter((p) => p.status === "offline").length;

  // Reset selection + recenter view when company changes
  const lastCompany = useRef(activeCompany);
  if (lastCompany.current !== activeCompany) {
    lastCompany.current = activeCompany;
    if (selection) setSelection(null);
  }

  // Recenter the zoom/pan view on mount and on company switch.
  // We only reset the transform — the SVG's preserveAspectRatio="xMidYMid meet"
  // already fits the content into the container, so forcing centerView() with
  // a fixed scale would shrink the canvas instead of filling it.
  useEffect(() => {
    const t = transformRef.current;
    if (!t) return;
    const id = requestAnimationFrame(() => {
      t.resetTransform(0);
    });
    return () => cancelAnimationFrame(id);
  }, [activeCompany]);

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
                viewBox={fittedViewBox}
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
  viewBox,
  resolvedPins,
  selection,
  onSelectSensor,
  onSelectEquipment,
}: {
  layout: PlantLayout;
  viewBox: { x: number; y: number; w: number; h: number };
  resolvedPins: { pin: SensorPin; value: string; status: PinStatus; raw: number | null; target: string }[];
  selection: Selection;
  onSelectSensor: (pin: SensorPin, r: Resolved) => void;
  onSelectEquipment: (eq: PlantEquipment) => void;
}) {
  const labelTheme = {
    bg: "hsl(var(--background))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    sub: "hsl(var(--muted-foreground))",
  };

  return (
    <svg
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="relative z-10 h-full w-full select-none"
      style={{ shapeRendering: "geometricPrecision", touchAction: "none" }}
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

      {/* Layer 1 — Pipes (drawn first so labels & pins render on top) */}
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

      {/* Layer 2 — Equipment (rectangles + capsule labels above pipes) */}
      {layout.equipment.map((eq) => (
        <Equipment
          key={eq.id}
          eq={eq}
          labelTheme={labelTheme}
          selected={selection?.type === "equipment" && selection.eq.id === eq.id}
          onSelect={() => onSelectEquipment(eq)}
        />
      ))}

      {/* Layer 3 — Sensor pins on TOP of pipes & equipment */}
      {resolvedPins.map(({ pin, value, status, raw, target }) => (
        <SensorMark
          key={pin.id}
          pin={pin}
          status={status}
          labelTheme={labelTheme}
          selected={selection?.type === "sensor" && selection.pin.id === pin.id}
          onSelect={() => onSelectSensor(pin, { value, status, raw, target })}
        />
      ))}
    </svg>
  );
}

type LabelTheme = {
  bg: string;
  border: string;
  text: string;
  sub: string;
};

function getEquipmentCenter(eq: PlantEquipment) {
  return {
    x: eq.x + eq.w / 2,
    y: eq.y + eq.h / 2,
  };
}

function getEquipmentTextGeometry(eq: PlantEquipment) {
  const center = getEquipmentCenter(eq);

  if (!eq.sub || eq.kind === "pump") {
    return {
      labelX: center.x,
      labelY: center.y,
      subY: undefined,
    };
  }

  const config: Record<Exclude<EquipmentKind, "pump">, { labelOffset: number; subOffset: number }> = {
    tank: { labelOffset: 18, subOffset: 20 },
    membrane: { labelOffset: 7, subOffset: 13 },
    vessel: { labelOffset: 8, subOffset: 17 },
    intake: { labelOffset: 8, subOffset: 17 },
    output: { labelOffset: 8, subOffset: 17 },
    controller: { labelOffset: 8, subOffset: 17 },
  };

  const offsets = config[eq.kind as Exclude<EquipmentKind, "pump">] ?? { labelOffset: 8, subOffset: 17 };

  return {
    labelX: center.x,
    labelY: center.y - offsets.labelOffset / 2,
    subY: center.y + offsets.subOffset / 2,
  };
}

/* ─────────────── Equipment renderer ───────────────────────────────────────── */
function Equipment({
  eq,
  labelTheme,
  selected,
  onSelect,
}: {
  eq: PlantEquipment;
  labelTheme: LabelTheme;
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
      : labelTheme.text;
  const W = eq.w;
  const H = eq.h;
  const center = getEquipmentCenter(eq);
  const textGeometry = getEquipmentTextGeometry(eq);
  const sw = selected ? 2.4 : 1.4;

  // Opaque mask under each equipment shape so the cyan pipes can't bleed
  // through the semi-transparent gradient fills (fixes "lines crossing
  // components" bug). Uses theme background so it works in light + dark mode.
  const maskPad = 2;
  const wrap = (children: ReactNode) => (
    <g
      onClick={onSelect}
      className="plant-equipment cursor-pointer transition-opacity hover:opacity-90"
      style={{ outline: "none" }}
    >
      <rect
        x={eq.x - maskPad}
        y={eq.y - maskPad}
        width={W + maskPad * 2}
        height={H + maskPad * 2}
        rx={eq.kind === "controller" || eq.kind === "vessel" || eq.kind === "output" ? 10 : 6}
        fill="hsl(var(--background))"
        pointerEvents="none"
      />
      {children}
      {selected && (
        <rect
          x={eq.x - 6}
          y={eq.y - 6}
          width={W + 12}
          height={H + 12}
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
          <rect x={eq.x} y={eq.y + 14} width={W} height={H - 28} fill="url(#tank-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={center.x} cy={eq.y + 14} rx={W / 2} ry={14} fill="url(#tank-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={center.x} cy={eq.y + H - 14} rx={W / 2} ry={14} fill="url(#tank-grad)" stroke={stroke} strokeWidth={sw} />
          <rect x={eq.x + 8} y={eq.y + H * 0.45} width={W - 16} height={H * 0.4} fill="hsl(var(--primary) / 0.18)" />
          <CenteredEquipmentText
            label={eq.label}
            sub={eq.sub}
            x={textGeometry.labelX}
            y={textGeometry.labelY}
            subY={textGeometry.subY}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={W - 18}
          />
        </g>
      );

    case "membrane": {
      // Inner cylinder body excludes the two end-cap ellipses (radius 18 each).
      const innerW = W - 36;
      return wrap(
        <g>
          <rect x={eq.x + 18} y={eq.y} width={innerW} height={H} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={eq.x + 18} cy={center.y} rx={18} ry={H / 2} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={eq.x + W - 18} cy={center.y} rx={18} ry={H / 2} fill="url(#membrane-grad)" stroke={stroke} strokeWidth={sw} />
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={i}
              x1={eq.x + 30}
              x2={eq.x + W - 30}
              y1={eq.y + ((i + 1) * H) / 6}
              y2={eq.y + ((i + 1) * H) / 6}
              stroke={stroke}
              strokeOpacity={0.35}
              strokeWidth={0.7}
            />
          ))}
          <CenteredEquipmentText
            label={eq.label}
            sub={eq.sub}
            x={textGeometry.labelX}
            y={textGeometry.labelY}
            subY={textGeometry.subY}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={innerW - 12}
            fontSize={13}
            subSize={10}
          />
        </g>
      );
    }

    case "vessel":
      return wrap(
        <g>
          <rect x={eq.x} y={eq.y} width={W} height={H} rx={14} fill="hsl(var(--muted) / 0.25)" stroke={stroke} strokeWidth={sw} />
          <line
            x1={eq.x + 8}
            x2={eq.x + W - 8}
            y1={eq.y + H * 0.5}
            y2={eq.y + H * 0.5}
            stroke={stroke}
            strokeOpacity={0.35}
            strokeDasharray="3 3"
          />
          <CenteredEquipmentText
            label={eq.label}
            sub={eq.sub}
            x={textGeometry.labelX}
            y={textGeometry.labelY}
            subY={textGeometry.subY}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={W - 20}
          />
        </g>
      );

    case "pump": {
      const r = Math.min(W, H) / 2;
      return wrap(
        <g>
          <circle cx={center.x} cy={center.y} r={r} fill="hsl(var(--muted) / 0.30)" stroke={stroke} strokeWidth={sw} />
          <line x1={center.x - r * 0.6} y1={center.y} x2={center.x + r * 0.6} y2={center.y} stroke={stroke} strokeWidth={1.2} />
          <line x1={center.x} y1={center.y - r * 0.6} x2={center.x} y2={center.y + r * 0.6} stroke={stroke} strokeWidth={1.2} />
          <rect x={center.x - 4} y={eq.y - 8} width={8} height={10} fill={stroke} opacity={0.7} />
          <CenteredEquipmentText
            label={eq.label}
            x={center.x}
            y={center.y}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={W - 18}
            fontSize={10}
          />
          {eq.sub && <SubLabel x={center.x} y={eq.y + H + 18} text={eq.sub} labelTheme={labelTheme} />}
        </g>
      );
    }

    case "intake": {
      const path = `M ${eq.x} ${eq.y} L ${eq.x + W} ${eq.y} L ${eq.x + W - 16} ${eq.y + H} L ${eq.x + 16} ${eq.y + H} Z`;
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
          <CenteredEquipmentText
            label={eq.label}
            sub={eq.sub}
            x={textGeometry.labelX}
            y={textGeometry.labelY}
            subY={textGeometry.subY}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={W - 20}
            fontSize={10}
          />
        </g>
      );
    }

    case "output":
      return wrap(
        <g>
          <rect x={eq.x} y={eq.y} width={W} height={H} rx={6} fill="hsl(var(--success) / 0.12)" stroke={stroke} strokeWidth={sw} />
          <CenteredEquipmentText
            label={eq.label}
            sub={eq.sub}
            x={textGeometry.labelX}
            y={textGeometry.labelY}
            subY={textGeometry.subY}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={W - 14}
          />
        </g>
      );

    case "controller":
    default:
      return wrap(
        <g>
          <rect
            x={eq.x}
            y={eq.y}
            width={W}
            height={H}
            rx={8}
            fill="hsl(var(--primary) / 0.08)"
            stroke={stroke}
            strokeDasharray="4 3"
            strokeWidth={sw}
          />
          <CenteredEquipmentText
            label={eq.label}
            sub={eq.sub}
            x={textGeometry.labelX}
            y={textGeometry.labelY}
            subY={textGeometry.subY}
            color={labelColor}
            labelTheme={labelTheme}
            maxWidth={W - 18}
          />
        </g>
      );
  }
}

/* Solid background capsule label — pipes will not strike through.
   Auto-centered with text-anchor="middle" + dominant-baseline="central".
   If `maxWidth` is provided, the font auto-shrinks so the capsule never
   overflows the host shape (fixes "GO MEMBRANE M-02" overhanging the
   cylinder). */
function CenteredEquipmentText({
  label,
  sub,
  x,
  y,
  subY,
  color,
  labelTheme,
  maxWidth,
  fontSize = 11,
  subSize = 8.5,
}: {
  label: string;
  sub?: string;
  x: number;
  y: number;
  subY?: number;
  color: string;
  labelTheme: LabelTheme;
  maxWidth?: number;
  fontSize?: number;
  subSize?: number;
}) {
  const estimatedWidth = label.length * fontSize * 0.62;
  const shouldClamp = Boolean(maxWidth && estimatedWidth > maxWidth);
  return (
    <g pointerEvents="none">
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        textLength={shouldClamp ? maxWidth : undefined}
        lengthAdjust={shouldClamp ? "spacingAndGlyphs" : undefined}
        style={{ font: `700 ${fontSize}px Inter, system-ui, sans-serif` }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={subY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={labelTheme.sub}
          style={{ font: `500 ${subSize}px JetBrains Mono, ui-monospace, monospace`, textTransform: "uppercase" }}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function SubLabel({
  x,
  y,
  text,
  labelTheme,
}: {
  x: number;
  y: number;
  text: string;
  labelTheme: LabelTheme;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={labelTheme.sub}
      pointerEvents="none"
      style={{ font: "500 9px JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
    >
      {text}
    </text>
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
  labelTheme,
  selected,
  onSelect,
}: {
  pin: SensorPin;
  status: PinStatus;
  labelTheme: LabelTheme;
  selected: boolean;
  onSelect: () => void;
}) {
  const color =
    status === "warn"
      ? "hsl(var(--warning))"
      : status === "offline"
      ? "hsl(var(--destructive))"
      : "hsl(var(--success))";

  // STRICT OFFSET: capsule is positioned so its NEAREST EDGE clears the
  // pulsing dot (radius ~7px max). We place the capsule center at GAP px
  // from the pin in the chosen anchor direction.
  const anchor = pin.anchor ?? "right";
  const GAP = pin.labelGap ?? 16;       // distance from pin → capsule center
  const labelW = pin.id.length * 6.2 + 10;
  const labelH = 13;
  const labelDx = pin.labelDx ?? 0;
  const labelDy = pin.labelDy ?? 0;

  // Capsule center relative to pin
  const capsule = (() => {
    switch (anchor) {
      case "top":
        return { cx: pin.x + labelDx, cy: pin.y - GAP - labelH / 2 + labelDy, textAnchor: "middle" as const };
      case "bottom":
        return { cx: pin.x + labelDx, cy: pin.y + GAP + labelH / 2 + labelDy, textAnchor: "middle" as const };
      case "left":
        return { cx: pin.x - GAP - labelW / 2 + labelDx, cy: pin.y + labelDy, textAnchor: "middle" as const };
      case "right":
      default:
        return { cx: pin.x + GAP + labelW / 2 + labelDx, cy: pin.y + labelDy, textAnchor: "middle" as const };
    }
  })();

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="plant-pin cursor-pointer"
    >
      {/* Crosshair tying pin to pipe */}
      <line x1={pin.x - 5} y1={pin.y} x2={pin.x + 5} y2={pin.y} stroke={color} strokeOpacity={0.55} strokeWidth={0.8} />
      <line x1={pin.x} y1={pin.y - 5} x2={pin.x} y2={pin.y + 5} stroke={color} strokeOpacity={0.55} strokeWidth={0.8} />

      {/* Outer pulse */}
      <circle cx={pin.x} cy={pin.y} r={5} fill={color} fillOpacity={0.18}>
        {status !== "offline" && (
          <animate attributeName="r" values="3.5;7;3.5" dur="2.2s" repeatCount="indefinite" />
        )}
      </circle>
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

      {/* ID capsule */}
      <g pointerEvents="none">
        <rect
          x={capsule.cx - labelW / 2}
          y={capsule.cy - labelH / 2}
          width={labelW}
          height={labelH}
          rx={3}
          fill={labelTheme.bg}
          stroke={labelTheme.border}
          strokeOpacity={0.95}
          strokeWidth={0.6}
        />
        <text
          x={capsule.cx}
          y={capsule.cy}
          textAnchor="middle"
          dominantBaseline="middle"
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
