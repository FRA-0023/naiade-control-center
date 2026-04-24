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
};

/**
 * Physical equipment shapes used in the P&ID schematic.
 *  - tank        : vertical cylinder (buffer / surge)
 *  - membrane    : horizontal tube (GO membrane module)
 *  - vessel      : rounded rectangle (UV / degas / pre-filter)
 *  - pump        : circle with notch (centrifugal pump)
 *  - intake      : open trapezoidal hopper
 *  - output      : labeled rectangle endpoint
 *  - controller  : dashed-bordered card (Edge-AI / ERD logic)
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
};

export type PlantPipe = {
  /** SVG path d="…" using the same viewBox. */
  d: string;
  /** If true, animate a flowing dot along the path. */
  flow?: boolean;
  /** Optional stroke width override (defaults to 8 — thick industrial pipe). */
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

/* ─────────────────────────────────────────────────────────────────────────
   Acme Gigafab — Linear horizontal P&ID train (high-pressure)
   ───────────────────────────────────────────────────────────────────────── */
const acme: PlantLayout = {
  title: "Linear Industrial Train · P&ID",
  subtitle: "High-pressure single-pass UPW production · top-down view",
  viewBox: { w: 1200, h: 560 },
  equipment: [
    { id: "intake",     kind: "intake",     label: "INTAKE",        sub: "Grey water",          x: 30,   y: 240, w: 110, h: 90,  tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",          sub: "Booster",             x: 200,  y: 250, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",    sub: "5 µm mech.",          x: 320,  y: 240, w: 130, h: 100 },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",   sub: "Surge dampener",      x: 500,  y: 180, w: 90,  h: 220 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 640,  y: 260, w: 280, h: 60,  tone: "primary" },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",    sub: "Polishing",           x: 960,  y: 240, w: 130, h: 100 },
    { id: "output",     kind: "output",     label: "UPW OUT",       sub: ">18.2 MΩ·cm",         x: 1110, y: 250, w: 80,  h: 80,  tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",       sub: "Node #451",           x: 700,  y: 60,  w: 160, h: 70,  tone: "primary" },
    { id: "erd",        kind: "controller", label: "ERD ISOBARIC",  sub: "98% recovery",        x: 700,  y: 460, w: 160, h: 70,  tone: "success" },
  ],
  pipes: [
    // main horizontal spine ~ y=290
    { d: "M 140 290 H 200", flow: true },
    { d: "M 280 290 H 320", flow: true },
    { d: "M 450 290 H 500", flow: true },
    { d: "M 590 290 H 640", flow: true },
    { d: "M 920 290 H 960", flow: true },
    { d: "M 1090 290 H 1110", flow: true },
    // Edge-AI signal taps (dashed-feel = thinner)
    { d: "M 780 130 V 260", width: 3 },
    // ERD recovery loop
    { d: "M 780 460 V 320", width: 3 },
  ],
  sensors: [
    { id: "PR-01", kind: "pressure",     label: "Inlet Pressure",     unit: "bar",    x: 170,  y: 290, anchor: "top" },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks",  x: 385,  y: 240, anchor: "top" },
    { id: "TM-09", kind: "temperature",  label: "Feed Temperature",   unit: "°C",     x: 545,  y: 180, anchor: "top" },
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure",  unit: "bar",    x: 700,  y: 290, anchor: "bottom" },
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",   x: 860,  y: 290, anchor: "bottom" },
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",     x: 1025, y: 240, anchor: "top" },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm",  x: 1150, y: 250, anchor: "top" },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",          unit: "NTU",    x: 545,  y: 400, anchor: "bottom" },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Nexus Water Corp — Modular U-shaped municipal loop (low-pressure)
   ───────────────────────────────────────────────────────────────────────── */
const nexus: PlantLayout = {
  title: "Municipal U-Loop · P&ID",
  subtitle: "Low-pressure modular skid · counter-flow polishing",
  viewBox: { w: 1200, h: 600 },
  equipment: [
    { id: "intake",     kind: "intake",     label: "MUNICIPAL FEED", sub: "Mains supply",       x: 40,   y: 110, w: 110, h: 90,  tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "Lift pump",          x: 210,  y: 120, w: 70,  h: 70 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm mech.",         x: 320,  y: 110, w: 130, h: 90 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 510,  y: 125, w: 320, h: 60, tone: "primary" },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",    sub: "Surge",              x: 900,  y: 90,  w: 90,  h: 220 },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #892",          x: 1040, y: 110, w: 140, h: 70,  tone: "primary" },
    // bottom return loop
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",          x: 510,  y: 410, w: 320, h: 80 },
    { id: "polish",     kind: "vessel",     label: "RE-POLISH",      sub: "Loop EDI",           x: 320,  y: 410, w: 130, h: 80 },
    { id: "output",     kind: "output",     label: "DISTRIBUTION",   sub: ">18 MΩ·cm",          x: 60,   y: 410, w: 110, h: 80,  tone: "success" },
  ],
  pipes: [
    // top spine
    { d: "M 150 155 H 210", flow: true },
    { d: "M 280 155 H 320", flow: true },
    { d: "M 450 155 H 510", flow: true },
    { d: "M 830 155 H 900", flow: true },
    // right turnaround
    { d: "M 945 310 V 420", flow: true },
    { d: "M 945 310 V 200" },
    // bottom spine (right→left)
    { d: "M 900 450 H 830", flow: true },
    { d: "M 510 450 H 450", flow: true },
    { d: "M 320 450 H 170", flow: true },
    // edge-ai tap
    { d: "M 1110 180 V 220", width: 3 },
  ],
  sensors: [
    { id: "PR-01", kind: "pressure",     label: "Mains Pressure",    unit: "bar",   x: 180, y: 155, anchor: "top" },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",     unit: "peaks", x: 385, y: 110, anchor: "top" },
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure", unit: "bar",   x: 670, y: 155, anchor: "bottom" },
    { id: "TM-09", kind: "temperature",  label: "Buffer Temp",       unit: "°C",    x: 945, y: 220, anchor: "right" },
    { id: "FL-07", kind: "flow",         label: "Loop Flow",         unit: "m³/h",  x: 670, y: 450, anchor: "bottom" },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",      unit: "µS/cm", x: 385, y: 450, anchor: "top" },
    { id: "PH-02", kind: "ph",           label: "pH",                unit: "pH",    x: 115, y: 450, anchor: "top" },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",         unit: "NTU",   x: 250, y: 450, anchor: "bottom" },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Aegis Facilities — Heavy industrial dual-stage (very high pressure)
   ───────────────────────────────────────────────────────────────────────── */
const aegis: PlantLayout = {
  title: "Heavy Industrial Skid · P&ID",
  subtitle: "Dual-stage high-pressure plant · 20–25 bar service",
  viewBox: { w: 1200, h: 600 },
  equipment: [
    { id: "intake",     kind: "intake",     label: "PROCESS FEED",   sub: "Reservoir R-01",    x: 30,   y: 260, w: 110, h: 90,  tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "HP booster",        x: 200,  y: 270, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm + carbon",     x: 320,  y: 260, w: 130, h: 100 },
    // dual stacked membranes
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "Stage 1",         x: 500,  y: 160, w: 320, h: 60,  tone: "primary" },
    { id: "go-2",       kind: "membrane",   label: "GO MEMBRANE M-02", sub: "Stage 2",         x: 500,  y: 380, w: 320, h: 60,  tone: "primary" },
    // central buffer between stages
    { id: "buffer-1",   kind: "tank",       label: "INTERSTAGE T-01", sub: "HP buffer",        x: 600,  y: 240, w: 100, h: 120 },
    // booster between stages
    { id: "pump-2",     kind: "pump",       label: "P-02",           sub: "Interstage",        x: 740,  y: 270, w: 70,  h: 70 },
    // outlet path
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",         x: 880,  y: 260, w: 130, h: 100 },
    { id: "output",     kind: "output",     label: "UPW OUT",        sub: ">18.2 MΩ·cm",       x: 1080, y: 270, w: 90,  h: 80,  tone: "success" },
    // ancillary
    { id: "erd",        kind: "controller", label: "ERD ARRAY",      sub: "98% recovery",      x: 60,   y: 60,  w: 160, h: 70,  tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #104",         x: 1000, y: 60,  w: 160, h: 70,  tone: "primary" },
  ],
  pipes: [
    // intake → prefilter → stage 1
    { d: "M 140 310 H 200", flow: true, width: 10 },
    { d: "M 280 310 H 320", flow: true, width: 10 },
    { d: "M 450 310 V 190 H 500", flow: true, width: 10 },
    // stage 1 → interstage tank
    { d: "M 820 190 V 240 H 700", flow: true, width: 10 },
    // interstage → P-02 → stage 2
    { d: "M 700 305 H 740", flow: true, width: 10 },
    { d: "M 810 305 V 410 H 820 M 810 410 H 500", flow: true, width: 10 },
    // stage 2 → UV → output
    { d: "M 820 410 V 310 H 880", flow: true, width: 10 },
    { d: "M 1010 310 H 1080", flow: true, width: 10 },
    // ERD recovery tap
    { d: "M 140 130 V 200", width: 3 },
    // Edge-AI tap
    { d: "M 1080 130 V 260", width: 3 },
  ],
  sensors: [
    { id: "PR-01", kind: "pressure",     label: "Pump Discharge",     unit: "bar",   x: 170, y: 310, anchor: "bottom" },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks", x: 385, y: 260, anchor: "top" },
    { id: "PR-12", kind: "pressure",     label: "M-01 Pressure",      unit: "bar",   x: 660, y: 190, anchor: "top" },
    { id: "TM-09", kind: "temperature",  label: "Interstage Temp",    unit: "°C",    x: 650, y: 360, anchor: "bottom" },
    { id: "PR-22", kind: "pressure",     label: "M-02 Pressure",      unit: "bar",   x: 660, y: 410, anchor: "bottom" },
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",  x: 945, y: 260, anchor: "top" },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm", x: 1125, y: 270, anchor: "top" },
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",    x: 945, y: 360, anchor: "bottom" },
  ],
};

export const plantLayouts: Record<CompanyId, PlantLayout> = {
  acme,
  nexus,
  aegis,
};
