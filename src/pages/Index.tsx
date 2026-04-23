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

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {tab === "overview" && (
                <SystemOverview
                  onNavigate={setTab}
                  totalRegenerated={2_840_000 + ledgerHeight * 12}
                  efficiencyMultiplier={5.4}
                  ledgerHeight={ledgerHeight}
                />
              )}

              {tab === "ingestion" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                  {/* Left — Spectrogram + Sensor Health */}
                  <div className="flex flex-col gap-4 xl:col-span-8">
                    <div className="min-h-[420px]">
                      <RamanSpectrogram data={data.raman} />
                    </div>
                    <SensorStrip />
                  </div>

                  {/* Right — Telemetry metrics */}
                  <div className="flex flex-col gap-4 xl:col-span-4">
                    <div className="rounded-xl border border-border/60 bg-card/30 px-4 py-3 backdrop-blur-sm">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
                        Telemetry
                      </div>
                      <p className="mt-1 text-xs font-light leading-snug text-muted-foreground">
                        Continuous physical telemetry via LPWAN/5G mesh sensor network for system stability monitoring.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-1">
                      <KPICard label="Pressure" unit="bar" data={data.pressure} icon={Gauge} target="Target: 8–12 bar" targetValue={10} />
                      <KPICard label="Flow rate" unit="m³/h" data={data.flow} icon={Droplets} target="Target: 1.0–2.5 m³/h" targetValue={1.75} />
                      <KPICard label="Conductivity" unit="μS/cm" data={data.conductivity} icon={Zap} decimals={0} target="Target: < 50 µS/cm" targetValue={50} />
                    </div>
                  </div>
                </div>
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
