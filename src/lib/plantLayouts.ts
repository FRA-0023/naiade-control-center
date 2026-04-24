import type { CompanyId } from "./companies";

export type SensorKind =
  | "raman"
  | "pressure"
  | "flow"
  | "conductivity"
  | "temperature"
  | "ph"
  | "turbidity"
  | "oxygen";

export type SensorPin = {
  id: string;          // e.g. "PR-12"
  kind: SensorKind;
  label: string;       // human readable
  unit: string;
  /** Position in viewBox units. */
  x: number;
  y: number;
  /** Anchor side controls where the permanent text label sits. */
  anchor?: "top" | "bottom" | "left" | "right";
  /** 1–2 sentence technical description for the details sidebar. */
  description?: string;
};

/**
 * Physical equipment shapes used in the P&ID schematic.
 */
export type EquipmentKind =
  | "tank"
  | "membrane"
  | "vessel"
  | "pump"
  | "intake"
  | "output"
  | "controller";

export type PlantEquipment = {
  id: string;
  kind: EquipmentKind;
  label: string;
  sub?: string;
  /** Bounding box in viewBox units. */
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: "muted" | "primary" | "success" | "warning";
  /** 1–2 sentence technical description for the details sidebar. */
  description?: string;
};

export type PlantPipe = {
  /** SVG path d="…" using the same viewBox. */
  d: string;
  /** If true, animate a flowing dot along the path. */
  flow?: boolean;
  /** Optional stroke width override (defaults to 2 — crisp schematic line). */
  width?: number;
};

export type PlantLayout = {
  title: string;
  subtitle: string;
  /** Width × height in viewBox units (used to set preserveAspectRatio). */
  viewBox: { w: number; h: number };
  equipment: PlantEquipment[];
  pipes: PlantPipe[];
  sensors: SensorPin[];
};

/* ─────────────── Shared technical descriptions ─────────────── */
const SENSOR_DESC: Record<SensorKind, string> = {
  pressure:
    "Piezo-resistive transmitter measuring line pressure. Used for fault detection on pumps and to monitor membrane fouling via differential pressure trends.",
  flow:
    "Inline electromagnetic flow meter measuring volumetric throughput. Critical for permeate accounting and recovery-rate calculations.",
  conductivity:
    "4-electrode conductivity probe quantifying ionic content of the water. Primary indicator of membrane salt-rejection performance.",
  raman:
    "Surface-Enhanced Raman spectrometer scanning the permeate for trace organics. Spectral peaks are streamed to the Edge-AI model for anomaly classification.",
  temperature:
    "PT100 RTD probe tracking process temperature. Compensates conductivity readings and protects the GO membrane from thermal stress.",
  ph:
    "Glass-electrode pH probe monitoring chemical balance. Drifts trigger automatic CIP (clean-in-place) cycles upstream.",
  turbidity:
    "Optical 90° scatter turbidity sensor (NTU) detecting particulate breakthrough. Early warning for pre-filter exhaustion.",
  oxygen:
    "Dissolved oxygen probe monitoring de-gas performance ahead of the polishing loop.",
};

const EQUIP_DESC: Partial<Record<string, string>> = {
  intake:
    "Inlet hopper that receives raw feed water. Includes a coarse strainer and over-flow protection before the booster pump.",
  prefilter:
    "5 µm depth filtration vessel removing suspended solids and protecting the GO membrane from particulate fouling.",
  "pump-1":
    "Centrifugal booster pump that pressurises the feed line to the operating set-point of the membrane train.",
  "pump-2":
    "Interstage booster restoring pressure between the two membrane stages to maximise recovery.",
  "buffer-1":
    "Surge dampener tank that smooths flow and pressure transients caused by pump cycling and CIP events.",
  "go-1":
    "Graphene-Oxide nanofiltration module (d-spacing 0.45 nm). Selectively rejects ions and organics while permeating water at high flux.",
  "go-2":
    "Second-stage GO membrane that polishes the partially-treated stream to ultra-pure water specification.",
  uv:
    "UV-254 reactor combined with vacuum de-gas to destroy residual TOC and strip dissolved CO₂/O₂ before distribution.",
  polish:
    "Electrodeionisation (EDI) re-polishing column for the recirculation loop, holding the network at >18 MΩ·cm.",
  output:
    "Distribution endpoint exporting validated ultra-pure water to the downstream process at >18.2 MΩ·cm.",
  edge:
    "On-site Edge-AI inference node running the federated CNN model. Classifies anomalies and orchestrates CIP / wash cycles in real-time.",
  erd:
    "Isobaric Energy Recovery Device that transfers pressure from the concentrate stream back to the feed, achieving ~98% energy recovery.",
};

function withDesc<T extends { id: string; kind: string }>(items: T[]): T[] {
  return items.map((it) => {
    if ("description" in it && (it as { description?: string }).description) return it;
    // Equipment description first (by id), else fall back to sensor kind
    const eqDesc = EQUIP_DESC[it.id];
    if (eqDesc) return { ...it, description: eqDesc };
    const sd = SENSOR_DESC[it.kind as SensorKind];
    if (sd) return { ...it, description: sd };
    return it;
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   Acme Gigafab — Linear horizontal P&ID train (high-pressure)
   ───────────────────────────────────────────────────────────────────────── */
const acme: PlantLayout = {
  title: "Linear Industrial Train · P&ID",
  subtitle: "High-pressure single-pass UPW production · top-down view",
  viewBox: { w: 1200, h: 560 },
  equipment: withDesc([
    { id: "intake",     kind: "intake",     label: "INTAKE",        sub: "Grey water",          x: 30,   y: 240, w: 110, h: 90,  tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",          sub: "Booster",             x: 200,  y: 250, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",    sub: "5 µm mech.",          x: 320,  y: 240, w: 130, h: 100 },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",   sub: "Surge dampener",      x: 500,  y: 180, w: 90,  h: 220 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 640,  y: 260, w: 280, h: 60,  tone: "primary" },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",    sub: "Polishing",           x: 960,  y: 240, w: 130, h: 100 },
    { id: "output",     kind: "output",     label: "UPW OUT",       sub: ">18.2 MΩ·cm",         x: 1110, y: 250, w: 80,  h: 80,  tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",       sub: "Node #451",           x: 700,  y: 60,  w: 160, h: 70,  tone: "primary" },
    { id: "erd",        kind: "controller", label: "ERD ISOBARIC",  sub: "98% recovery",        x: 700,  y: 460, w: 160, h: 70,  tone: "success" },
  ]),
  pipes: [
    // main horizontal spine ~ y=290
    { d: "M 140 290 H 200", flow: true },
    { d: "M 280 290 H 320", flow: true },
    { d: "M 450 290 H 500", flow: true },
    { d: "M 590 290 H 640", flow: true },
    { d: "M 920 290 H 960", flow: true },
    { d: "M 1090 290 H 1110", flow: true },
    // Edge-AI signal taps
    { d: "M 780 130 V 260", width: 1.2 },
    // ERD recovery loop
    { d: "M 780 460 V 320", width: 1.2 },
  ],
  sensors: withDesc([
    { id: "PR-01", kind: "pressure",     label: "Inlet Pressure",     unit: "bar",    x: 170,  y: 290, anchor: "top" },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks",  x: 385,  y: 230, anchor: "top" },
    { id: "TM-09", kind: "temperature",  label: "Feed Temperature",   unit: "°C",     x: 545,  y: 170, anchor: "top" },
    // Membrane pressure on the inlet pipe just before M-01 (off the label).
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure",  unit: "bar",    x: 615,  y: 290, anchor: "top" },
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",   x: 940,  y: 290, anchor: "top" },
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",     x: 1025, y: 230, anchor: "top" },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm",  x: 1100, y: 240, anchor: "top" },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",          unit: "NTU",    x: 545,  y: 410, anchor: "bottom" },
  ]),
};

/* ─────────────────────────────────────────────────────────────────────────
   Nexus Water Corp — Modular U-shaped municipal loop (low-pressure)
   ───────────────────────────────────────────────────────────────────────── */
const nexus: PlantLayout = {
  title: "Municipal U-Loop · P&ID",
  subtitle: "Low-pressure modular skid · counter-flow polishing",
  viewBox: { w: 1200, h: 600 },
  equipment: withDesc([
    { id: "intake",     kind: "intake",     label: "MUNICIPAL FEED", sub: "Mains supply",       x: 40,   y: 110, w: 110, h: 90,  tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "Lift pump",          x: 210,  y: 120, w: 70,  h: 70 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm mech.",         x: 320,  y: 110, w: 130, h: 90 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 510,  y: 125, w: 320, h: 60, tone: "primary" },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",    sub: "Surge",              x: 900,  y: 90,  w: 90,  h: 220 },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #892",          x: 1040, y: 110, w: 140, h: 70,  tone: "primary" },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",          x: 510,  y: 410, w: 320, h: 80 },
    { id: "polish",     kind: "vessel",     label: "RE-POLISH",      sub: "Loop EDI",           x: 320,  y: 410, w: 130, h: 80 },
    { id: "output",     kind: "output",     label: "DISTRIBUTION",   sub: ">18 MΩ·cm",          x: 60,   y: 410, w: 110, h: 80,  tone: "success" },
  ]),
  pipes: [
    // Top horizontal feed at y=155
    { d: "M 150 155 H 210", flow: true },
    { d: "M 280 155 H 320", flow: true },
    // Prefilter out → M-01 left cap (cx=528, cy=155)
    { d: "M 450 155 H 528", flow: true },
    // M-01 right cap (cx=812, cy=155) → buffer top inlet
    { d: "M 812 155 H 945 V 90", flow: true },
    // Buffer (945, 310) → bottom return spine y=450 → up to UV @ (830, 450)
    { d: "M 945 310 V 450", flow: true },
    { d: "M 945 310 V 200" },
    { d: "M 900 450 H 830", flow: true },
    { d: "M 510 450 H 450", flow: true },
    { d: "M 320 450 H 170", flow: true },
    // EDGE-AI signal — bottom-center (1110, 180) routes orthogonally to
    // buffer right edge (990, 200). No floating gap.
    { d: "M 1110 180 V 200 H 990", width: 1.2 },
  ],
  sensors: withDesc([
    { id: "PR-01", kind: "pressure",     label: "Mains Pressure",    unit: "bar",   x: 180, y: 155, anchor: "top" },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",     unit: "peaks", x: 385, y: 100, anchor: "top" },
    // Membrane pressure — anchored on the inlet pipe just before M-01 so the
    // sensor dot does not sit inside the membrane label.
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure", unit: "bar",   x: 870, y: 155, anchor: "top" },
    { id: "TM-09", kind: "temperature",  label: "Buffer Temp",       unit: "°C",    x: 945, y: 260, anchor: "right" },
    // Loop flow — moved off the UV label, onto the bottom return spine
    // between UV and the polish vessel.
    { id: "FL-07", kind: "flow",         label: "Loop Flow",         unit: "m³/h",  x: 480, y: 450, anchor: "bottom" },
    // Conductivity — moved between RE-POLISH and Distribution.
    { id: "EC-03", kind: "conductivity", label: "Conductivity",      unit: "µS/cm", x: 280, y: 450, anchor: "top" },
    { id: "PH-02", kind: "ph",           label: "pH",                unit: "pH",    x: 220, y: 450, anchor: "bottom" },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",         unit: "NTU",   x: 870, y: 450, anchor: "bottom" },
  ]),
};

/* ─────────────────────────────────────────────────────────────────────────
   Aegis Facilities — Heavy industrial dual-stage (very high pressure)
   ───────────────────────────────────────────────────────────────────────── */
const aegis: PlantLayout = {
  title: "Heavy Industrial Skid · P&ID",
  subtitle: "Dual-stage high-pressure plant · 20–25 bar service",
  viewBox: { w: 1200, h: 600 },
  equipment: withDesc([
    { id: "intake",     kind: "intake",     label: "PROCESS FEED",   sub: "Reservoir R-01",    x: 30,   y: 260, w: 110, h: 90,  tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "HP booster",        x: 200,  y: 270, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm + carbon",     x: 320,  y: 260, w: 130, h: 100 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "Stage 1",         x: 500,  y: 160, w: 320, h: 60,  tone: "primary" },
    { id: "go-2",       kind: "membrane",   label: "GO MEMBRANE M-02", sub: "Stage 2",         x: 500,  y: 380, w: 320, h: 60,  tone: "primary" },
    { id: "buffer-1",   kind: "tank",       label: "INTERSTAGE T-01", sub: "HP buffer",        x: 600,  y: 240, w: 100, h: 120 },
    { id: "pump-2",     kind: "pump",       label: "P-02",           sub: "Interstage",        x: 740,  y: 270, w: 70,  h: 70 },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",         x: 880,  y: 260, w: 130, h: 100 },
    { id: "output",     kind: "output",     label: "UPW OUT",        sub: ">18.2 MΩ·cm",       x: 1080, y: 270, w: 90,  h: 80,  tone: "success" },
    { id: "erd",        kind: "controller", label: "ERD ARRAY",      sub: "98% recovery",      x: 60,   y: 60,  w: 160, h: 70,  tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #104",         x: 1000, y: 60,  w: 160, h: 70,  tone: "primary" },
  ]),
  pipes: [
    // Main horizontal feed line at y=310
    { d: "M 140 310 H 200", flow: true },
    { d: "M 280 310 H 320", flow: true },
    // Prefilter out → up & over to M-01 (left cap @ cx=518, cy=190)
    { d: "M 450 310 V 190 H 518", flow: true },
    // M-01 right cap (cx=802, cy=190) → down to buffer top
    { d: "M 802 190 V 240 H 700", flow: true },
    // Buffer right (700, 300) → P-02 inlet (775, 305)
    { d: "M 700 300 H 740", flow: true },
    // P-02 outlet (810, 305) → down to M-02 inlet (left cap cx=518, cy=410)
    { d: "M 810 305 V 410 H 518", flow: true },
    // M-02 right cap (cx=802, cy=410) → up to spine then to UV inlet (880, 310)
    { d: "M 802 410 V 310 H 880", flow: true },
    // UV outlet → output
    { d: "M 1010 310 H 1080", flow: true },
    // ERD ARRAY signal/recovery line — bottom-center (140, 130)
    // routes orthogonally down to the main spine at y=310 (lands left of P-01).
    { d: "M 140 130 V 280 H 170 V 310", width: 1.2 },
    // EDGE-AI signal line — bottom-center (1080, 130) routes down to UV top (945, 260)
    // then onto the UV vessel inlet area (avoids floating endpoint).
    { d: "M 1080 130 V 220 H 945 V 260", width: 1.2 },
  ],
  sensors: withDesc([
    { id: "PR-01", kind: "pressure",     label: "Pump Discharge",     unit: "bar",   x: 170, y: 310, anchor: "bottom" },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks", x: 385, y: 245, anchor: "top" },
    // Stage-1 pressure tap on the inlet riser to M-01 (off the membrane label).
    { id: "PR-12", kind: "pressure",     label: "M-01 Pressure",      unit: "bar",   x: 450, y: 245, anchor: "left" },
    { id: "TM-09", kind: "temperature",  label: "Interstage Temp",    unit: "°C",    x: 760, y: 305, anchor: "top" },
    // Stage-2 pressure on the discharge of M-02 (off the membrane label).
    { id: "PR-22", kind: "pressure",     label: "M-02 Pressure",      unit: "bar",   x: 820, y: 460, anchor: "right" },
    // Permeate flow on the short pipe between UV and OUT.
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",  x: 1045, y: 310, anchor: "top" },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm", x: 1125, y: 240, anchor: "top" },
    // pH on the lower return pipe segment, well below M-02.
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",    x: 600, y: 410, anchor: "bottom" },
  ]),
};

export const plantLayouts: Record<CompanyId, PlantLayout> = {
  acme,
  nexus,
  aegis,
};
