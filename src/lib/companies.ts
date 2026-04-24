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
      pressure: 10.0,
      flow: 2.0,
      conductivity: 40,
      dpStart: 1.5,
      dpEnd: 2.2,
      latencyMs: 4,
      rul: 62,
      washFreq: 74,
      federatedRound: 2814,
      blockHeightStart: 184_201,
      ramanShift: 0,
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
      pressure: 8.5,
      flow: 1.6,
      conductivity: 32,
      dpStart: 1.2,
      dpEnd: 1.7,
      latencyMs: 5.5,
      rul: 78,
      washFreq: 68,
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
      pressure: 11.2,
      flow: 2.3,
      conductivity: 48,
      dpStart: 1.7,
      dpEnd: 2.35,
      latencyMs: 6.2,
      rul: 41,
      washFreq: 83,
      federatedRound: 2756,
      blockHeightStart: 158_902,
      ramanShift: 12,
    },
  },
];

export function getCompany(id: CompanyId): Company {
  return companies.find((c) => c.id === id) ?? companies[0];
}
