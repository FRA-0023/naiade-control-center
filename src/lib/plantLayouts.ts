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
  /** Position in viewBox units (0–1000 × 0–600). */
  x: number;
  y: number;
};

export type PlantNode = {
  id: string;
  label: string;
  sub?: string;
  /** Bounding box center in viewBox units. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Visual emphasis. */
  tone?: "muted" | "primary" | "success" | "warning";
};

export type PlantPipe = {
  /** SVG path d="…" using the same viewBox. */
  d: string;
  /** If true, animate a flowing dot along the path. */
  flow?: boolean;
};

export type PlantLayout = {
  title: string;
  subtitle: string;
  /** Width × height in viewBox units (used to set preserveAspectRatio). */
  viewBox: { w: number; h: number };
  nodes: PlantNode[];
  pipes: PlantPipe[];
  sensors: SensorPin[];
};

/* ─────────────────────────────────────────────────────────────────────────
   Acme Gigafab — linear horizontal flow
   ───────────────────────────────────────────────────────────────────────── */
const acme: PlantLayout = {
  title: "Linear Industrial Flow",
  subtitle: "Single-pass treatment train · horizontal layout",
  viewBox: { w: 1000, h: 500 },
  nodes: [
    { id: "intake", label: "Intake", sub: "Grey water", x: 80, y: 250, w: 120, h: 70, tone: "muted" },
    { id: "prefilter", label: "Pre-filter", sub: "5 µm mech.", x: 250, y: 250, w: 130, h: 70 },
    { id: "go-membrane", label: "GO Membrane", sub: "d-spacing 0.45 nm", x: 460, y: 250, w: 170, h: 90, tone: "primary" },
    { id: "uv", label: "UV + Degas", sub: "Polishing", x: 700, y: 250, w: 130, h: 70 },
    { id: "output", label: "Output", sub: "UPW > 18.2 MΩ·cm", x: 880, y: 250, w: 110, h: 70, tone: "success" },
    { id: "edge", label: "Edge-AI", sub: "Node #451", x: 460, y: 90, w: 170, h: 60, tone: "primary" },
    { id: "erd", label: "ERD Isobaric", sub: "98% recovery", x: 460, y: 410, w: 170, h: 60, tone: "success" },
  ],
  pipes: [
    { d: "M 200 285 H 250", flow: true },
    { d: "M 380 285 H 460", flow: true },
    { d: "M 630 285 H 700", flow: true },
    { d: "M 830 285 H 880", flow: true },
    // edge-ai vertical link
    { d: "M 545 150 V 250" },
    // erd vertical link
    { d: "M 545 340 V 410" },
  ],
  sensors: [
    { id: "RM-04", kind: "raman", label: "Raman Spectro", unit: "peaks", x: 215, y: 220 },
    { id: "PR-12", kind: "pressure", label: "Pressure", unit: "bar", x: 420, y: 220 },
    { id: "FL-07", kind: "flow", label: "Flow", unit: "m³/h", x: 660, y: 220 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity", unit: "µS/cm", x: 850, y: 220 },
    { id: "TM-09", kind: "temperature", label: "Temperature", unit: "°C", x: 380, y: 320 },
    { id: "PH-02", kind: "ph", label: "pH", unit: "pH", x: 545, y: 365 },
    { id: "TB-05", kind: "turbidity", label: "Turbidity", unit: "NTU", x: 740, y: 320 },
    { id: "OX-01", kind: "oxygen", label: "Dissolved O₂", unit: "mg/L", x: 920, y: 320 },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Nexus Water Corp — modular U-shaped process
   ───────────────────────────────────────────────────────────────────────── */
const nexus: PlantLayout = {
  title: "Modular U-Shaped Process",
  subtitle: "Counter-flow loop · shared service spine",
  viewBox: { w: 1000, h: 500 },
  nodes: [
    { id: "intake", label: "Intake", sub: "Municipal feed", x: 110, y: 110, w: 130, h: 70, tone: "muted" },
    { id: "prefilter", label: "Pre-filter", sub: "5 µm mech.", x: 290, y: 110, w: 130, h: 70 },
    { id: "go-membrane", label: "GO Membrane", sub: "d-spacing 0.45 nm", x: 470, y: 110, w: 170, h: 90, tone: "primary" },
    { id: "buffer", label: "Buffer Tank", sub: "Surge dampening", x: 760, y: 220, w: 160, h: 80 },
    { id: "uv", label: "UV + Degas", sub: "Polishing", x: 470, y: 360, w: 170, h: 70 },
    { id: "output", label: "Output", sub: "UPW > 18.2 MΩ·cm", x: 110, y: 360, w: 130, h: 70, tone: "success" },
    { id: "prefilter2", label: "Re-polish", sub: "Loop", x: 290, y: 360, w: 130, h: 70 },
    { id: "edge", label: "Edge-AI", sub: "Node #892", x: 760, y: 110, w: 160, h: 60, tone: "primary" },
  ],
  pipes: [
    // top spine
    { d: "M 240 145 H 290", flow: true },
    { d: "M 420 145 H 470", flow: true },
    { d: "M 640 155 H 760", flow: true },
    { d: "M 840 170 V 220" },
    // turn down to buffer & out
    { d: "M 840 300 V 380" },
    { d: "M 760 395 H 640", flow: true },
    // bottom spine
    { d: "M 470 395 H 420", flow: true },
    { d: "M 290 395 H 240", flow: true },
    // edge to membrane
    { d: "M 760 140 H 640" },
  ],
  sensors: [
    { id: "RM-04", kind: "raman", label: "Raman Spectro", unit: "peaks", x: 255, y: 80 },
    { id: "PR-12", kind: "pressure", label: "Pressure", unit: "bar", x: 440, y: 80 },
    { id: "FL-07", kind: "flow", label: "Flow", unit: "m³/h", x: 700, y: 130 },
    { id: "TM-09", kind: "temperature", label: "Temperature", unit: "°C", x: 870, y: 260 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity", unit: "µS/cm", x: 700, y: 425 },
    { id: "PH-02", kind: "ph", label: "pH", unit: "pH", x: 440, y: 460 },
    { id: "TB-05", kind: "turbidity", label: "Turbidity", unit: "NTU", x: 255, y: 425 },
    { id: "OX-01", kind: "oxygen", label: "Dissolved O₂", unit: "mg/L", x: 175, y: 330 },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Aegis Facilities — compact vertical multi-stage stack
   ───────────────────────────────────────────────────────────────────────── */
const aegis: PlantLayout = {
  title: "Vertical Multi-Stage Stack",
  subtitle: "Gravity-assisted compact filtration column",
  viewBox: { w: 1000, h: 600 },
  nodes: [
    { id: "intake", label: "Intake", sub: "Roof reservoir", x: 420, y: 50, w: 160, h: 60, tone: "muted" },
    { id: "prefilter", label: "Pre-filter", sub: "5 µm mech.", x: 420, y: 150, w: 160, h: 60 },
    { id: "go-membrane", label: "GO Membrane", sub: "d-spacing 0.45 nm", x: 400, y: 250, w: 200, h: 80, tone: "primary" },
    { id: "uv", label: "UV + Degas", sub: "Polishing", x: 420, y: 370, w: 160, h: 60 },
    { id: "output", label: "Output", sub: "UPW > 18.2 MΩ·cm", x: 420, y: 470, w: 160, h: 60, tone: "success" },
    { id: "edge", label: "Edge-AI", sub: "Node #104", x: 720, y: 250, w: 160, h: 60, tone: "primary" },
    { id: "erd", label: "ERD", sub: "98% recovery", x: 120, y: 250, w: 160, h: 60, tone: "success" },
  ],
  pipes: [
    { d: "M 500 110 V 150", flow: true },
    { d: "M 500 210 V 250", flow: true },
    { d: "M 500 330 V 370", flow: true },
    { d: "M 500 430 V 470", flow: true },
    // edge link
    { d: "M 720 280 H 600" },
    // erd link
    { d: "M 280 280 H 400" },
  ],
  sensors: [
    { id: "RM-04", kind: "raman", label: "Raman Spectro", unit: "peaks", x: 380, y: 180 },
    { id: "PR-12", kind: "pressure", label: "Pressure", unit: "bar", x: 380, y: 290 },
    { id: "FL-07", kind: "flow", label: "Flow", unit: "m³/h", x: 620, y: 290 },
    { id: "TM-09", kind: "temperature", label: "Temperature", unit: "°C", x: 620, y: 180 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity", unit: "µS/cm", x: 380, y: 400 },
    { id: "PH-02", kind: "ph", label: "pH", unit: "pH", x: 620, y: 400 },
    { id: "TB-05", kind: "turbidity", label: "Turbidity", unit: "NTU", x: 380, y: 500 },
    { id: "OX-01", kind: "oxygen", label: "Dissolved O₂", unit: "mg/L", x: 620, y: 500 },
  ],
};

export const plantLayouts: Record<CompanyId, PlantLayout> = {
  acme,
  nexus,
  aegis,
};
