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
    <div className="relative flex w-full flex-col gap-2">
      <h1 className="break-words">{title}</h1>
      <p className="text-sm font-light leading-relaxed text-muted-foreground break-words">
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
      <div className="flex min-h-screen w-full bg-background md:h-screen md:overflow-hidden">
        <AppSidebar
          activeTab={tab}
          onTabChange={setTab}
          activeCompany={activeCompany}
          onCompanyChange={setActiveCompany}
        />
        <SidebarInset className="flex min-h-screen flex-1 flex-col min-w-0 max-w-full overflow-x-hidden md:h-full md:min-h-0 md:overflow-hidden">
          <TopBar
            anomaly={data.anomaly}
            tabs={tabs}
            activeTab={tab}
            onTabChange={setTab}
            activeCompany={activeCompany}
            onCompanyChange={setActiveCompany}
          />

          <main
            className={
              tab === "plant"
                ? "flex flex-1 flex-col overflow-x-hidden px-3 pt-[112px] pb-6 sm:px-4 md:overflow-hidden md:px-5 md:pt-6 md:pb-8"
                : tab === "ingestion"
                ? "flex-1 overflow-x-hidden overflow-y-auto px-3 pt-[112px] pb-6 sm:px-4 md:px-5 md:pt-6 md:pb-8"
                : "flex-1 overflow-x-hidden overflow-y-auto px-3 pt-[112px] pb-6 sm:px-4 md:px-5 md:pt-6 md:pb-8 lg:px-6"
            }
          >
            <div
              className={
                tab === "plant"
                  ? "flex h-full w-full min-w-0 flex-col"
                  : "mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-6 md:gap-8"
              }
            >
              {tab === "overview" && (
                <SystemOverview
                  onNavigate={setTab}
                  totalRegenerated={2_840_000 + ledgerHeight * 12}
                  efficiencyMultiplier={5.4}
                  ledgerHeight={ledgerHeight}
                />
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

                  <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
                    <div className="flex flex-col gap-2 self-start lg:col-span-8">
                      <RamanSpectrogram data={data.raman} company={data.company} />
                      <SensorStrip />
                    </div>

                    <div className="flex flex-col gap-2 self-start lg:col-span-4">
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
                  <div className="grid grid-cols-12 gap-3 md:gap-4">
                    <div className="col-span-12 lg:col-span-5">
                      <AnomalyPanel anomaly={data.anomaly} latency={data.latency} logs={data.logs} />
                    </div>
                    <div className="col-span-12 lg:col-span-7">
                      <PredictiveMaintenance dp={data.dp} company={data.company} />
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
                  <div className="grid grid-cols-12 gap-3 md:gap-4">
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
                <footer className="border-t border-border/40 pt-3 text-center font-mono text-[10px] text-muted-foreground">
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
