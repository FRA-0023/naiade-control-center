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
  /** Fine-tune label position so the capsule clears nearby geometry. */
  labelDx?: number;
  labelDy?: number;
  labelGap?: number;
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
   Compact "Control Panel" layout — viewBox 1000×500.
   ───────────────────────────────────────────────────────────────────────── */
const acme: PlantLayout = {
  title: "Linear Industrial Train · P&ID",
  subtitle: "High-pressure single-pass UPW production · top-down view",
  viewBox: { w: 1060, h: 500 },
  equipment: withDesc([
    { id: "intake",     kind: "intake",     label: "INTAKE",        sub: "Grey water",          x: 30,   y: 215, w: 110, h: 90, tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",          sub: "Booster",             x: 175,  y: 220, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",    sub: "5 µm mech.",          x: 285,  y: 215, w: 130, h: 95 },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",   sub: "Surge dampener",      x: 445,  y: 165, w: 90,  h: 200 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 565,  y: 235, w: 245, h: 60, tone: "primary" },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",    sub: "Polishing",           x: 820,  y: 215, w: 110, h: 95 },
    { id: "output",     kind: "output",     label: "UPW OUT",       sub: ">18.2 MΩ·cm",         x: 960,  y: 220, w: 80,  h: 80, tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",       sub: "Node #451",           x: 615,  y: 50,  w: 150, h: 60, tone: "primary" },
    { id: "erd",        kind: "controller", label: "ERD ISOBARIC",  sub: "98% recovery",        x: 615,  y: 410, w: 150, h: 60, tone: "success" },
  ]),
  pipes: [
    // main horizontal spine ~ y=263
    { d: "M 140 263 H 175", flow: true, width: 3 },
    { d: "M 255 263 H 285", flow: true, width: 3 },
    { d: "M 415 263 H 445", flow: true, width: 3 },
    { d: "M 535 263 H 565", flow: true, width: 3 },
    { d: "M 810 263 H 820", flow: true, width: 3 },
    { d: "M 930 263 H 960", flow: true, width: 3 },
    // Edge-AI signal tap → membrane top
    { d: "M 690 110 V 235", width: 2 },
    // ERD recovery loop → membrane bottom
    { d: "M 690 410 V 295", width: 2 },
  ],
  sensors: withDesc([
    { id: "PR-01", kind: "pressure",     label: "Inlet Pressure",     unit: "bar",    x: 158,  y: 263, anchor: "top", labelDy: -6 },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks",  x: 270,  y: 263, anchor: "top", labelDy: -8 },
    { id: "TM-09", kind: "temperature",  label: "Feed Temperature",   unit: "°C",     x: 430,  y: 263, anchor: "bottom", labelDy: 8 },
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure",  unit: "bar",    x: 550,  y: 263, anchor: "top", labelDy: -6 },
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",   x: 815,  y: 263, anchor: "top", labelDy: -6 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm",  x: 945,  y: 263, anchor: "bottom", labelDy: 8 },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",          unit: "NTU",    x: 690,  y: 350, anchor: "right", labelDx: 8, labelGap: 14 },
  ]),
};

/* ─────────────────────────────────────────────────────────────────────────
   Nexus Water Corp — Modular U-shaped municipal loop (low-pressure)
   Wide-U layout: top row flows L→R, U-turns on the far right, bottom row
   returns R→L. Uses the entire canvas to eliminate the dead bottom-right.
   ───────────────────────────────────────────────────────────────────────── */
const nexus: PlantLayout = {
  title: "Municipal U-Loop · P&ID",
  subtitle: "Low-pressure modular skid · counter-flow polishing",
  viewBox: { w: 1100, h: 560 },
  equipment: withDesc([
    // ── TOP ROW (feed, L → R) — spine y=140
    { id: "intake",     kind: "intake",     label: "MUNICIPAL FEED", sub: "Mains supply",       x: 30,   y: 95,  w: 110, h: 90, tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "Lift pump",          x: 175,  y: 100, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm mech.",         x: 285,  y: 95,  w: 130, h: 90 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 445, y: 110, w: 280, h: 60, tone: "primary" },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",    sub: "Surge",              x: 760,  y: 80,  w: 90,  h: 200 },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #892",          x: 905,  y: 100, w: 150, h: 60, tone: "primary" },

    // ── BOTTOM RETURN ROW (R → L) — spine y=420
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",          x: 445,  y: 380, w: 280, h: 80 },
    { id: "polish",     kind: "vessel",     label: "RE-POLISH",      sub: "Loop EDI",           x: 285,  y: 380, w: 130, h: 80 },
    { id: "output",     kind: "output",     label: "DISTRIBUTION",   sub: ">18 MΩ·cm",          x: 50,   y: 385, w: 130, h: 80, tone: "success" },
  ]),
  pipes: [
    // ── TOP feed spine y=140
    { d: "M 140 140 H 175", flow: true, width: 3 },
    { d: "M 255 140 H 285", flow: true, width: 3 },
    { d: "M 415 140 H 460", flow: true, width: 3 },
    // M-01 right cap (cx=710, cy=140) → buffer top inlet (805, 80)
    { d: "M 710 140 H 805 V 80", flow: true, width: 3 },

    // ── U-TURN on the right — buffer bottom (805, 280) → down to spine y=420 → back to UV right cap (cx=710, cy=420)
    { d: "M 805 280 V 420 H 725", flow: true, width: 3 },

    // ── BOTTOM return spine y=420 (R → L through UV → RE-POLISH → DISTRIBUTION)
    { d: "M 445 420 H 415", flow: true, width: 3 },
    { d: "M 285 420 H 180", flow: true, width: 3 },

    // ── EDGE-AI signal → buffer top
    { d: "M 980 160 V 200 H 850", width: 2 },
  ],
  sensors: withDesc([
    // Top spine sensors
    { id: "PR-01", kind: "pressure",     label: "Mains Pressure",    unit: "bar",   x: 158, y: 140, anchor: "top", labelDy: -6 },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",     unit: "peaks", x: 437, y: 140, anchor: "top", labelDy: -8 },
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure", unit: "bar",   x: 750, y: 140, anchor: "top", labelDy: -8 },
    // Buffer right-side temperature
    { id: "TM-09", kind: "temperature",  label: "Buffer Temp",       unit: "°C",    x: 850, y: 220, anchor: "right", labelDx: 8, labelGap: 14 },
    // Bottom return spine sensors
    { id: "FL-07", kind: "flow",         label: "Loop Flow",         unit: "m³/h",  x: 430, y: 420, anchor: "bottom", labelDy: 8 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",      unit: "µS/cm", x: 250, y: 420, anchor: "top", labelDy: -8 },
    { id: "PH-02", kind: "ph",           label: "pH",                unit: "pH",    x: 200, y: 420, anchor: "bottom", labelDy: 8 },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",         unit: "NTU",   x: 770, y: 420, anchor: "bottom", labelDy: 8 },
  ]),
};

/* ─────────────────────────────────────────────────────────────────────────
   Aegis Facilities — Heavy industrial dual-stage (very high pressure)
   Spacing expanded ~1.5× — both stages spread across full canvas.
   ───────────────────────────────────────────────────────────────────────── */
const aegis: PlantLayout = {
  title: "Heavy Industrial Skid · P&ID",
  subtitle: "Dual-stage high-pressure plant · 20–25 bar service",
  viewBox: { w: 1800, h: 880 },
  equipment: withDesc([
    { id: "intake",     kind: "intake",     label: "PROCESS FEED",   sub: "Reservoir R-01",    x: 60,   y: 380, w: 130, h: 100, tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "HP booster",        x: 290,  y: 390, w: 90,  h: 90 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm + carbon",     x: 470,  y: 380, w: 150, h: 110 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "Stage 1",         x: 720,  y: 200, w: 420, h: 65,  tone: "primary" },
    { id: "go-2",       kind: "membrane",   label: "GO MEMBRANE M-02", sub: "Stage 2",         x: 720,  y: 600, w: 420, h: 65,  tone: "primary" },
    { id: "buffer-1",   kind: "tank",       label: "INTERSTAGE T-01", sub: "HP buffer",        x: 870,  y: 350, w: 120, h: 160 },
    { id: "pump-2",     kind: "pump",       label: "P-02",           sub: "Interstage",        x: 1060, y: 395, w: 80,  h: 80 },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",         x: 1280, y: 380, w: 160, h: 110 },
    { id: "output",     kind: "output",     label: "UPW OUT",        sub: ">18.2 MΩ·cm",       x: 1620, y: 390, w: 110, h: 90,  tone: "success" },
    { id: "erd",        kind: "controller", label: "ERD ARRAY",      sub: "98% recovery",      x: 80,   y: 90,  w: 180, h: 80,  tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #104",         x: 1500, y: 90,  w: 180, h: 80,  tone: "primary" },
  ]),
  pipes: [
    // Main horizontal feed line at y=435 (intake → P-01 → PRE-FILTER)
    { d: "M 190 435 H 290", flow: true },
    { d: "M 380 435 H 470", flow: true },
    // Prefilter out → up & over to M-01 (left cap @ cx=738, cy=232)
    { d: "M 620 435 V 232 H 738", flow: true },
    // M-01 right cap (cx=1122, cy=232) → down to buffer top (cx=930, cy=350)
    { d: "M 1122 232 V 350 H 930", flow: true },
    // Buffer right (990, 430) → P-02 inlet (1060, 435)
    { d: "M 990 430 H 1060", flow: true },
    // P-02 outlet (1140, 435) → down to M-02 inlet (left cap cx=738, cy=632)
    { d: "M 1140 435 V 632 H 738", flow: true },
    // M-02 right cap (cx=1122, cy=632) → up to spine y=435 then to UV inlet (1280, 435)
    { d: "M 1122 632 V 435 H 1280", flow: true },
    // UV outlet → output
    { d: "M 1440 435 H 1620", flow: true },
    // ERD ARRAY signal/recovery line — bottom-center (170, 170) → spine (170, 435)
    { d: "M 170 170 V 410 H 240 V 435", width: 1.2 },
    // EDGE-AI signal line — bottom-center (1590, 170) → UV top (1360, 380)
    { d: "M 1590 170 V 320 H 1360 V 380", width: 1.2 },
  ],
  sensors: withDesc([
    { id: "PR-01", kind: "pressure",     label: "Pump Discharge",     unit: "bar",   x: 240, y: 435, anchor: "bottom", labelDy: 8 },
    // Raman tap on the prefilter→M-01 horizontal segment (y=232, x:620-738)
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks", x: 700, y: 232, anchor: "top", labelDy: -8 },
    // Stage-1 pressure on the vertical riser at x=620 (y:232-435)
    { id: "PR-12", kind: "pressure",     label: "M-01 Pressure",      unit: "bar",   x: 620, y: 340, anchor: "left", labelDx: -6, labelGap: 24 },
    // Interstage temperature on the buffer→P-02 pipe segment (y=430)
    { id: "TM-09", kind: "temperature",  label: "Interstage Temp",    unit: "°C",    x: 1025, y: 430, anchor: "top", labelDy: -8 },
    // Stage-2 pressure on the riser between M-02 and the spine (x=1122, y:435-632)
    { id: "PR-22", kind: "pressure",     label: "M-02 Pressure",      unit: "bar",   x: 1122, y: 540, anchor: "right", labelDx: 8, labelGap: 26 },
    // Permeate flow on UV → OUT pipe (x:1440-1620, y=435)
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",  x: 1530, y: 435, anchor: "top", labelDy: -8 },
    // Conductivity on the same UV → OUT pipe near the output
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm", x: 1600, y: 435, anchor: "bottom", labelDy: 8 },
    // pH tap on the M-02 inlet horizontal pipe (x:738-1140, y=632)
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",    x: 900, y: 632, anchor: "bottom", labelDy: 8 },
  ]),
};

export const plantLayouts: Record<CompanyId, PlantLayout> = {
  acme,
  nexus,
  aegis,
};
