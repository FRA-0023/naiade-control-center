import { useState } from "react";
import { Activity, Cloud, Cpu, Droplets, Gauge, LayoutGrid, Map, Zap } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/naiade/AppSidebar";
import { TopBar } from "@/components/naiade/TopBar";
import { RamanSpectrogram } from "@/components/naiade/RamanSpectrogram";
import { KPICard } from "@/components/naiade/KPICard";
import { SensorStrip } from "@/components/naiade/SensorStrip";
import { AnomalyPanel } from "@/components/naiade/AnomalyPanel";
import { PredictiveMaintenance } from "@/components/naiade/PredictiveMaintenance";
import { FederatedLearning } from "@/components/naiade/FederatedLearning";
import { WashOptimization } from "@/components/naiade/WashOptimization";
import { RULPanel } from "@/components/naiade/RULPanel";
import { BlockchainLog } from "@/components/naiade/BlockchainLog";
import { SystemOverview } from "@/components/naiade/SystemOverview";
import { PlantMap } from "@/components/naiade/PlantMap";
import { useMockData } from "@/hooks/useMockData";
import type { CompanyId } from "@/lib/companies";

export type TabId = "overview" | "ingestion" | "edge" | "mlops" | "plant";

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 shrink-0">
      <h1>{title}</h1>
      <p className="mt-1 text-sm font-light leading-snug text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

const tabs: { id: TabId; label: string; sub: string; icon: typeof Activity }[] = [
  { id: "overview", label: "System Overview", sub: "Topology · Health · Impact", icon: LayoutGrid },
  { id: "plant", label: "Plant Map", sub: "Digital Twin · Live Sensors", icon: Map },
  { id: "ingestion", label: "Live Ingestion", sub: "Sensors & Spectrogram", icon: Activity },
  { id: "edge", label: "Edge-AI Diagnostics", sub: "Anomaly · CNN Maintenance", icon: Cpu },
  { id: "mlops", label: "Global MLOps", sub: "Federated · Blockchain", icon: Cloud },
];

const Index = () => {
  const [activeCompany, setActiveCompany] = useState<CompanyId>("acme");
  const data = useMockData(activeCompany);
  const [tab, setTab] = useState<TabId>("overview");
  const ledgerHeight = data.blocks[data.blocks.length - 1]?.height ?? 0;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar
          activeTab={tab}
          onTabChange={setTab}
          activeCompany={activeCompany}
          onCompanyChange={setActiveCompany}
        />
        <SidebarInset className="flex h-full flex-1 flex-col overflow-hidden">
          <TopBar anomaly={data.anomaly} tabs={tabs} activeTab={tab} onTabChange={setTab} />

          <main
            className={
              tab === "plant"
                ? "flex-1 overflow-hidden p-4 md:p-6 flex"
                : tab === "ingestion"
                ? "flex-1 overflow-y-auto p-6"
                : "flex-1 overflow-y-auto p-6 md:p-8"
            }
          >
            <div
              className={
                tab === "plant"
                  ? "flex h-full w-full flex-col"
                  : tab === "ingestion"
                  ? "mx-auto flex w-full max-w-[1600px] flex-col"
                  : "mx-auto w-full max-w-[1600px]"
              }
            >
              {tab === "overview" && (
                <>
                  <PageHeader
                    title="System Overview"
                    subtitle="Topology, health, and global impact across all NAIADE nodes."
                  />
                  <SystemOverview
                  onNavigate={setTab}
                  totalRegenerated={2_840_000 + ledgerHeight * 12}
                  efficiencyMultiplier={5.4}
                  ledgerHeight={ledgerHeight}
                  />
                </>
              )}

              {tab === "plant" && (
                <PlantMap activeCompany={activeCompany} data={data} />
              )}

              {tab === "ingestion" && (
                <>
                  <PageHeader
                    title="Live Ingestion"
                    subtitle="Continuous physical telemetry via LPWAN/5G mesh · 50ms refresh."
                  />

                  <div className="grid grid-cols-12 items-start gap-3">
                    <div className="col-span-8 flex flex-col gap-2 self-start">
                      <RamanSpectrogram data={data.raman} />
                      <SensorStrip />
                    </div>

                    <div className="col-span-4 flex flex-col gap-2 self-start">
                      <KPICard label="Pressure" unit="bar" data={data.pressure} icon={Gauge} target={data.company.thresholds.pressure.label} targetValue={(data.company.thresholds.pressure.min + data.company.thresholds.pressure.max) / 2} warnRange={[data.company.thresholds.pressure.min, data.company.thresholds.pressure.max]} />
                      <KPICard label="Flow rate" unit="m³/h" data={data.flow} icon={Droplets} target={data.company.thresholds.flow.label} targetValue={(data.company.thresholds.flow.min + data.company.thresholds.flow.max) / 2} warnRange={[data.company.thresholds.flow.min, data.company.thresholds.flow.max]} />
                      <KPICard label="Conductivity" unit="μS/cm" data={data.conductivity} icon={Zap} decimals={0} target={data.company.thresholds.conductivity.label} targetValue={data.company.thresholds.conductivity.max} warnRange={[data.company.thresholds.conductivity.min, data.company.thresholds.conductivity.max]} />
                    </div>
                  </div>
                </>
              )}

              {tab === "edge" && (
                <>
                  <PageHeader
                    title="Edge-AI Diagnostics"
                    subtitle="On-device anomaly detection and CNN-based predictive maintenance."
                  />
                  <div className="grid grid-cols-12 gap-4 md:gap-5">
                  <div className="col-span-12 lg:col-span-5">
                    <AnomalyPanel anomaly={data.anomaly} latency={data.latency} logs={data.logs} />
                  </div>
                  <div className="col-span-12 lg:col-span-7">
                    <PredictiveMaintenance dp={data.dp} />
                  </div>
                  </div>
                </>
              )}

              {tab === "mlops" && (
                <>
                  <PageHeader
                    title="Global MLOps"
                    subtitle="Federated learning across the fleet and tamper-proof blockchain audit."
                  />
                  <div className="grid grid-cols-12 gap-4 md:gap-5">
                  <div className="col-span-12 lg:col-span-4">
                    <FederatedLearning progress={data.federatedProgress} />
                  </div>
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <WashOptimization value={data.washFreq} />
                  </div>
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <RULPanel rul={data.rul} />
                  </div>
                  <div className="col-span-12">
                    <BlockchainLog blocks={data.blocks} />
                  </div>
                  <div className="col-span-12 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-2.5 font-mono text-[11px]">
                    <span className="flex items-center gap-2 text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-tick" />
                      Blockchain Integrity: 100%
                    </span>
                    <span className="text-muted-foreground">
                      Last Hash: <span className="text-foreground">0x8F2{data.blocks[data.blocks.length - 1]?.hash?.slice(0, 4) ?? "a91c"}…</span>
                    </span>
                    <span className="text-muted-foreground">
                      Verified by <span className="text-foreground">Sanitary Authority</span>
                    </span>
                  </div>
                  </div>
                </>
              )}

              {tab !== "plant" && (
                <footer className="mt-6 border-t border-border/40 pt-4 text-center font-mono text-[10px] text-muted-foreground">
                  NAIADE · Decentralized Water Filtration · Graphene Oxide × Edge-AI
                </footer>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
