import { useState } from "react";
import { Activity, Cloud, Cpu, Droplets, Gauge, LayoutGrid, Zap } from "lucide-react";
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
import { useMockData } from "@/hooks/useMockData";

export type TabId = "overview" | "ingestion" | "edge" | "mlops";

const tabs: { id: TabId; label: string; sub: string; icon: typeof Activity }[] = [
  { id: "overview", label: "System Overview", sub: "Topology · Health · Impact", icon: LayoutGrid },
  { id: "ingestion", label: "Live Ingestion", sub: "Sensors & Spectrogram", icon: Activity },
  { id: "edge", label: "Edge-AI Diagnostics", sub: "Anomaly · CNN Maintenance", icon: Cpu },
  { id: "mlops", label: "Global MLOps", sub: "Federated · Blockchain", icon: Cloud },
];

const Index = () => {
  const data = useMockData();
  const [tab, setTab] = useState<TabId>("overview");
  const ledgerHeight = data.blocks[data.blocks.length - 1]?.height ?? 0;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar activeTab={tab} onTabChange={setTab} />
        <SidebarInset className="flex h-full flex-1 flex-col overflow-hidden">
          <TopBar anomaly={data.anomaly} tabs={tabs} activeTab={tab} onTabChange={setTab} />

          <main
            className={
              tab === "ingestion"
                ? "flex-1 overflow-hidden p-3 md:p-4"
                : "flex-1 overflow-y-auto p-6 md:p-8"
            }
          >
            <div
              className={
                tab === "ingestion"
                  ? "mx-auto flex h-full max-h-screen w-full max-w-[1600px] flex-col overflow-hidden"
                  : "mx-auto w-full max-w-[1600px]"
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

              {tab === "ingestion" && (
                <>
                  {/* Page header — compact */}
                  <div className="mb-2 shrink-0">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      Live Ingestion
                    </h2>
                    <p className="mt-0.5 text-xs font-light leading-snug text-muted-foreground">
                      Continuous physical telemetry via LPWAN/5G mesh sensor network · 50ms refresh.
                    </p>
                  </div>

                  {/* Strict 3-col viewport grid — compact, no scroll */}
                  <div className="grid min-h-0 flex-1 grid-cols-3 gap-3 overflow-hidden">
                    {/* Left — Spectrogram + Sensor Health (col-span-2) */}
                    <div className="col-span-2 flex min-h-0 flex-col gap-3">
                      <RamanSpectrogram data={data.raman} />
                      <SensorStrip />
                    </div>

                    {/* Right — Metric cards (col-span-1, aligned to left block height) */}
                    <div className="col-span-1 flex h-[calc(280px+120px)] flex-col justify-between gap-3 overflow-hidden">
                      <div className="flex-1 min-h-0">
                        <KPICard label="Pressure" unit="bar" data={data.pressure} icon={Gauge} target="Target: 8–12 bar" targetValue={10} warnRange={[8, 12]} />
                      </div>
                      <div className="flex-1 min-h-0">
                        <KPICard label="Flow rate" unit="m³/h" data={data.flow} icon={Droplets} target="Target: 1.0–2.5 m³/h" targetValue={1.75} warnRange={[1.0, 2.5]} />
                      </div>
                      <div className="flex-1 min-h-0">
                        <KPICard label="Conductivity" unit="μS/cm" data={data.conductivity} icon={Zap} decimals={0} target="Target: < 50 µS/cm" targetValue={50} warnRange={[0, 50]} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === "edge" && (
                <div className="grid grid-cols-12 gap-4 md:gap-5">
                  <div className="col-span-12 lg:col-span-5">
                    <AnomalyPanel anomaly={data.anomaly} latency={data.latency} logs={data.logs} />
                  </div>
                  <div className="col-span-12 lg:col-span-7">
                    <PredictiveMaintenance dp={data.dp} />
                  </div>
                </div>
              )}

              {tab === "mlops" && (
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
                </div>
              )}

              <footer className="mt-6 border-t border-border/40 pt-4 text-center font-mono text-[10px] text-muted-foreground">
                NAIADE · Decentralized Water Filtration · Graphene Oxide × Edge-AI
              </footer>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
