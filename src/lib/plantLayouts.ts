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
   Spacing expanded ~1.5× to use the full canvas.
   ───────────────────────────────────────────────────────────────────────── */
const acme: PlantLayout = {
  title: "Linear Industrial Train · P&ID",
  subtitle: "High-pressure single-pass UPW production · top-down view",
  viewBox: { w: 1800, h: 760 },
  equipment: withDesc([
    { id: "intake",     kind: "intake",     label: "INTAKE",        sub: "Grey water",          x: 60,   y: 340, w: 130, h: 100, tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",          sub: "Booster",             x: 290,  y: 350, w: 90,  h: 90 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",    sub: "5 µm mech.",          x: 470,  y: 340, w: 150, h: 110 },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",   sub: "Surge dampener",      x: 720,  y: 250, w: 100, h: 280 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 920,  y: 365, w: 380, h: 65, tone: "primary" },
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",    sub: "Polishing",           x: 1400, y: 340, w: 160, h: 110 },
    { id: "output",     kind: "output",     label: "UPW OUT",       sub: ">18.2 MΩ·cm",         x: 1640, y: 350, w: 100, h: 90, tone: "success" },
    { id: "edge",       kind: "controller", label: "EDGE-AI",       sub: "Node #451",           x: 1030, y: 80,  w: 180, h: 80, tone: "primary" },
    { id: "erd",        kind: "controller", label: "ERD ISOBARIC",  sub: "98% recovery",        x: 1030, y: 620, w: 180, h: 80, tone: "success" },
  ]),
  pipes: [
    // main horizontal spine ~ y=395
    { d: "M 190 395 H 290", flow: true },
    { d: "M 380 395 H 470", flow: true },
    { d: "M 620 395 H 720", flow: true },
    { d: "M 820 395 H 920", flow: true },
    { d: "M 1300 395 H 1400", flow: true },
    { d: "M 1560 395 H 1640", flow: true },
    // Edge-AI signal tap → membrane top
    { d: "M 1120 160 V 365", width: 1.2 },
    // ERD recovery loop → membrane bottom
    { d: "M 1120 620 V 430", width: 1.2 },
  ],
  sensors: withDesc([
    { id: "PR-01", kind: "pressure",     label: "Inlet Pressure",     unit: "bar",    x: 240,  y: 395, anchor: "top", labelDy: -6 },
    // Raman tap on the P-01 → PRE-FILTER pipe (between x:380-470 at y:395)
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks",  x: 425,  y: 395, anchor: "top", labelDy: -8 },
    // Feed temperature on the PRE-FILTER → BUFFER pipe (x:620-720 at y:395)
    { id: "TM-09", kind: "temperature",  label: "Feed Temperature",   unit: "°C",     x: 670,  y: 395, anchor: "bottom", labelDy: 8 },
    // Membrane inlet pressure on the BUFFER → M-01 pipe (x:820-920 at y:395)
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure",  unit: "bar",    x: 880,  y: 395, anchor: "top", labelDy: -6 },
    // Permeate flow on the M-01 → UV pipe (x:1300-1400 at y:395)
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",   x: 1340, y: 395, anchor: "top", labelDy: -6 },
    // pH on the UV → OUT pipe segment (x:1560-1640 at y:395)
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",     x: 1580, y: 395, anchor: "bottom", labelDy: 8 },
    // Conductivity on the same outlet pipe, closer to OUT
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm",  x: 1620, y: 395, anchor: "top", labelDy: -6 },
    // Turbidity tap on the ERD recovery riser (x=1120, y:430-620)
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",          unit: "NTU",    x: 1120, y: 530, anchor: "right", labelDx: 8, labelGap: 22 },
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
  viewBox: { w: 1800, h: 900 },
  equipment: withDesc([
    // ── TOP ROW (feed, L → R) — y ~ 160-260, spine y=215
    { id: "intake",     kind: "intake",     label: "MUNICIPAL FEED", sub: "Mains supply",       x: 60,   y: 170, w: 130, h: 100, tone: "muted" },
    { id: "pump-1",     kind: "pump",       label: "P-01",           sub: "Lift pump",          x: 290,  y: 180, w: 80,  h: 80 },
    { id: "prefilter",  kind: "vessel",     label: "PRE-FILTER",     sub: "5 µm mech.",         x: 470,  y: 165, w: 150, h: 100 },
    { id: "go-1",       kind: "membrane",   label: "GO MEMBRANE M-01", sub: "d-spacing 0.45 nm", x: 720,  y: 185, w: 380, h: 60, tone: "primary" },
    { id: "buffer-1",   kind: "tank",       label: "BUFFER T-01",    sub: "Surge",              x: 1240, y: 130, w: 110, h: 280 },
    { id: "edge",       kind: "controller", label: "EDGE-AI",        sub: "Node #892",          x: 1450, y: 165, w: 180, h: 80, tone: "primary" },

    // ── BOTTOM RETURN ROW (R → L) — y much further down (≥ +200 vs top)
    // U-turn happens on the far right at x≈1620.
    { id: "uv",         kind: "vessel",     label: "UV + DEGAS",     sub: "Polishing",          x: 720,  y: 660, w: 380, h: 90 },
    { id: "polish",     kind: "vessel",     label: "RE-POLISH",      sub: "Loop EDI",           x: 470,  y: 655, w: 150, h: 100 },
    { id: "output",     kind: "output",     label: "DISTRIBUTION",   sub: ">18 MΩ·cm",          x: 80,   y: 660, w: 130, h: 90, tone: "success" },
  ]),
  pipes: [
    // ── TOP feed spine y=215
    { d: "M 190 215 H 290", flow: true },
    { d: "M 370 215 H 470", flow: true },
    // Prefilter out → M-01 left cap (cx=738, cy=215)
    { d: "M 620 215 H 738", flow: true },
    // M-01 right cap (cx=1082, cy=215) → buffer top inlet (1295, 130)
    { d: "M 1082 215 H 1295 V 130", flow: true },

    // ── WIDE U-TURN on the far right side of the canvas.
    // Buffer bottom (1295, 410) → down to bottom return spine y=705 →
    // far-right elbow at x=1620 → back left to UV right cap (cx=1082, cy=705)
    { d: "M 1295 410 V 705 H 1100", flow: true },

    // Optional decorative right-side elbow framing the canvas
    { d: "M 1295 420 V 770 H 1620 V 215 H 1450", width: 1.2 },

    // ── BOTTOM return spine y=705 (R → L through UV → RE-POLISH → DISTRIBUTION)
    { d: "M 720 705 H 620", flow: true },
    { d: "M 470 705 H 210", flow: true },

    // ── EDGE-AI signal — bottom-center (1540, 245) → buffer right edge (1350, 270)
    { d: "M 1540 245 V 270 H 1350", width: 1.2 },
  ],
  sensors: withDesc([
    // Top spine sensors
    { id: "PR-01", kind: "pressure",     label: "Mains Pressure",    unit: "bar",   x: 240, y: 215, anchor: "top", labelDy: -6 },
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",     unit: "peaks", x: 680, y: 215, anchor: "top", labelDy: -8 },
    { id: "PR-12", kind: "pressure",     label: "Membrane Pressure", unit: "bar",   x: 1140, y: 215, anchor: "top", labelDy: -8 },
    // Buffer right-side temperature
    { id: "TM-09", kind: "temperature",  label: "Buffer Temp",       unit: "°C",    x: 1350, y: 320, anchor: "right", labelDx: 8, labelGap: 22 },
    // Bottom return spine sensors
    { id: "FL-07", kind: "flow",         label: "Loop Flow",         unit: "m³/h",  x: 670, y: 705, anchor: "bottom", labelDy: 8 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",      unit: "µS/cm", x: 420, y: 705, anchor: "top", labelDy: -10 },
    { id: "PH-02", kind: "ph",           label: "pH",                unit: "pH",    x: 290, y: 705, anchor: "bottom", labelDy: 8 },
    { id: "TB-05", kind: "turbidity",    label: "Turbidity",         unit: "NTU",   x: 1180, y: 705, anchor: "bottom", labelDy: 8 },
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
    { id: "RM-04", kind: "raman",        label: "Raman Spectro",      unit: "peaks", x: 545, y: 370, anchor: "top", labelDy: -12 },
    // Stage-1 pressure on the riser to M-01 (left of membrane label)
    { id: "PR-12", kind: "pressure",     label: "M-01 Pressure",      unit: "bar",   x: 620, y: 285, anchor: "left", labelDx: -6, labelGap: 24 },
    // Interstage temperature on the buffer→P-02 pipe segment (y=430)
    { id: "TM-09", kind: "temperature",  label: "Interstage Temp",    unit: "°C",    x: 1025, y: 430, anchor: "top", labelDy: -8 },
    // Stage-2 pressure on the riser between M-02 and the spine
    { id: "PR-22", kind: "pressure",     label: "M-02 Pressure",      unit: "bar",   x: 1122, y: 540, anchor: "right", labelDx: 8, labelGap: 26 },
    { id: "FL-07", kind: "flow",         label: "Permeate Flow",      unit: "m³/h",  x: 1530, y: 435, anchor: "top", labelDy: -8 },
    { id: "EC-03", kind: "conductivity", label: "Conductivity",       unit: "µS/cm", x: 1660, y: 370, anchor: "top", labelDy: -8 },
    { id: "PH-02", kind: "ph",           label: "pH",                 unit: "pH",    x: 900, y: 632, anchor: "bottom", labelDy: 8 },
  ]),
};

export const plantLayouts: Record<CompanyId, PlantLayout> = {
  acme,
  nexus,
  aegis,
};
