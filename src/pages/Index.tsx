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
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeTab={tab} onTabChange={setTab} />
        <SidebarInset className="flex-1">
          <TopBar anomaly={data.anomaly} tabs={tabs} activeTab={tab} onTabChange={setTab} />

          <main className="mx-auto w-full max-w-[1600px] flex flex-col gap-4 p-4 md:p-5 lg:p-6">
            {tab === "overview" && (
              <div className="h-[calc(100vh-3.5rem-2.5rem)] overflow-hidden">
                <SystemOverview
                  onNavigate={setTab}
                  totalRegenerated={2_840_000 + ledgerHeight * 12}
                  efficiencyMultiplier={5.4}
                  ledgerHeight={ledgerHeight}
                />
              </div>
            )}

            {tab === "ingestion" && (
              <div className="grid grid-cols-12 gap-4 lg:h-[calc(100vh-9rem)] lg:grid-rows-[1fr_auto]">
                <div className="col-span-12 min-h-[300px] lg:col-span-8 lg:row-span-1 lg:min-h-0">
                  <RamanSpectrogram data={data.raman} />
                </div>
                <div className="col-span-12 flex flex-col gap-2 lg:col-span-4 lg:row-span-1 lg:min-h-0">
                  <p className="text-sm font-light leading-snug text-muted-foreground">
                    Continuous physical telemetry via LPWAN/5G mesh sensor network for system stability monitoring.
                  </p>
                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3">
                    <KPICard label="Pressure" unit="bar" data={data.pressure} icon={Gauge} target="Target: 8–12 bar" targetValue={10} />
                    <KPICard label="Flow rate" unit="m³/h" data={data.flow} icon={Droplets} target="Target: 1.0–2.5 m³/h" targetValue={1.75} />
                    <KPICard label="Conductivity" unit="μS/cm" data={data.conductivity} icon={Zap} decimals={0} target="Target: < 50 µS/cm" targetValue={50} />
                  </div>
                </div>
                <div className="col-span-12 lg:row-start-2">
                  <SensorStrip />
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

            <footer className="mt-4 border-t border-border/40 pt-4 text-center font-mono text-[10px] text-muted-foreground">
              NAIADE · Decentralized Water Filtration · Graphene Oxide × Edge-AI
            </footer>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
