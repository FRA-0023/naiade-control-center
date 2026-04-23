import { useState } from "react";
import { Activity, Cloud, Cpu, Droplets, Gauge, Zap } from "lucide-react";
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
import { useMockData } from "@/hooks/useMockData";

export type TabId = "ingestion" | "edge" | "mlops";

const tabs: { id: TabId; label: string; sub: string; icon: typeof Activity }[] = [
  { id: "ingestion", label: "Live Ingestion", sub: "Sensors & Spectrogram", icon: Activity },
  { id: "edge", label: "Edge-AI Diagnostics", sub: "Anomaly · CNN Maintenance", icon: Cpu },
  { id: "mlops", label: "Global MLOps", sub: "Federated · Blockchain", icon: Cloud },
];

const Index = () => {
  const data = useMockData();
  const [tab, setTab] = useState<TabId>("ingestion");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeTab={tab} onTabChange={setTab} />
        <SidebarInset className="flex-1">
          <TopBar anomaly={data.anomaly} tabs={tabs} activeTab={tab} onTabChange={setTab} />

          <main className="mx-auto w-full max-w-[1600px] flex flex-col gap-6 p-4 md:p-6 lg:p-8">
            {tab === "ingestion" && (
              <div className="grid grid-cols-12 gap-4 md:gap-5">
                <div className="col-span-12 lg:col-span-8">
                  <RamanSpectrogram data={data.raman} />
                </div>
                <div className="col-span-12 grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-4 lg:grid-cols-1 lg:gap-5">
                  <KPICard label="Pressure" unit="bar" data={data.pressure} icon={Gauge} />
                  <KPICard label="Flow rate" unit="m³/h" data={data.flow} icon={Droplets} />
                  <KPICard label="Conductivity" unit="μS/cm" data={data.conductivity} icon={Zap} decimals={0} />
                </div>
                <div className="col-span-12">
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
