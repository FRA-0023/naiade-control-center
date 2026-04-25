import { Building2, Factory, Landmark, type LucideIcon } from "lucide-react";

export type CompanyId = "acme" | "nexus" | "aegis";

export type Company = {
  id: CompanyId;
  name: string;
  shortName: string;
  node: string;
  region: string;
  icon: LucideIcon;
  /** Per-company physical baseline used to re-seed all mock data. */
  baseline: {
    pressure: number;     // bar
    flow: number;         // m³/h
    conductivity: number; // µS/cm
    dpStart: number;      // bar (ΔP membrane start of window)
    dpEnd: number;        // bar (ΔP membrane end of window)
    latencyMs: number;    // base inference latency
    rul: number;          // % remaining useful life
    washFreq: number;     // %
    federatedRound: number;
    blockHeightStart: number;
    ramanShift: number;   // shifts spectral peaks
  };
  /** Per-company nominal operating ranges shown on KPI cards. */
  thresholds: {
    pressure: { min: number; max: number; label: string };
    flow: { min: number; max: number; label: string };
    conductivity: { min: number; max: number; label: string };
  };
};

export const companies: Company[] = [
  {
    id: "acme",
    name: "Acme Gigafab",
    shortName: "Acme",
    node: "Node #451",
    region: "EU-WEST · ZRH3",
    icon: Factory,
    baseline: {
      pressure: 11.0,        // High-pressure system (target 10–12 bar)
      flow: 2.0,
      conductivity: 40,      // ~40 µS/cm
      dpStart: 1.5,
      dpEnd: 2.2,
      latencyMs: 4,
      rul: 62,
      washFreq: 74,
      federatedRound: 2814,
      blockHeightStart: 184_201,
      ramanShift: 0,
    },
    thresholds: {
      pressure: { min: 8, max: 12, label: "Target: 8–12 bar" },
      flow: { min: 1.0, max: 2.5, label: "Target: 1.0–2.5 m³/h" },
      conductivity: { min: 0, max: 50, label: "Target: < 50 µS/cm" },
    },
  },
  {
    id: "nexus",
    name: "Nexus Water Corp",
    shortName: "Nexus",
    node: "Node #892",
    region: "EU-NORTH · ARN1",
    icon: Building2,
    baseline: {
      pressure: 3.5,         // Low-pressure municipal loop (3–4 bar)
      flow: 1.2,
      conductivity: 15,      // ~15 µS/cm
      dpStart: 0.4,
      dpEnd: 0.7,
      latencyMs: 5.5,
      rul: 78,
      washFreq: 52,
      federatedRound: 2871,
      blockHeightStart: 201_864,
      ramanShift: -8,
    },
  },
  {
    id: "aegis",
    name: "Aegis Facilities",
    shortName: "Aegis",
    node: "Node #104",
    region: "US-EAST · IAD2",
    icon: Landmark,
    baseline: {
      pressure: 22.0,        // Heavy industrial system (20–25 bar)
      flow: 3.4,
      conductivity: 85,      // ~85 µS/cm
      dpStart: 2.6,
      dpEnd: 3.6,
      latencyMs: 6.2,
      rul: 41,
      washFreq: 88,
      federatedRound: 2756,
      blockHeightStart: 158_902,
      ramanShift: 12,
    },
  },
];

export function getCompany(id: CompanyId): Company {
  return companies.find((c) => c.id === id) ?? companies[0];
}
