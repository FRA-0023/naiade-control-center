import { Activity, Cloud, Cpu, Droplets, Gauge, Zap } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/naiade/AppSidebar";
import { TopBar } from "@/components/naiade/TopBar";
import { SectionHeader } from "@/components/naiade/SectionHeader";
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

const Index = () => {
  const data = useMockData();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <TopBar anomaly={data.anomaly} />

          <main className="flex flex-col gap-10 p-4 md:p-6 lg:p-8">
            {/* Section 1 — Data Ingestion */}
            <section className="flex flex-col gap-4">
              <SectionHeader
                id="ingestion"
                index="01 / Realtime"
                title="Data Ingestion"
                subtitle="50ms sensor stream from the membrane"
                icon={Activity}
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <RamanSpectrogram data={data.raman} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <KPICard label="Pressure" unit="bar" data={data.pressure} icon={Gauge} accent="primary" />
                  <KPICard label="Flow rate" unit="m³/h" data={data.flow} icon={Droplets} accent="accent" />
                  <KPICard
                    label="Conductivity"
                    unit="μS/cm"
                    data={data.conductivity}
                    icon={Zap}
                    decimals={0}
                    accent="warning"
                  />
                </div>
              </div>

              <SensorStrip />
            </section>

            {/* Section 2 — Edge-AI */}
            <section className="flex flex-col gap-4">
              <SectionHeader
                id="edge"
                index="02 / Edge"
                title="Edge-AI Operations"
                subtitle="Local inference · sub-10ms decisions"
                icon={Cpu}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <AnomalyPanel anomaly={data.anomaly} latency={data.latency} logs={data.logs} />
                <PredictiveMaintenance dp={data.dp} />
              </div>
            </section>

            {/* Section 3 — MLOps & Cloud */}
            <section className="flex flex-col gap-4">
              <SectionHeader
                id="mlops"
                index="03 / Cloud"
                title="MLOps, Cloud & Blockchain"
                subtitle="Federated training · global optimization"
                icon={Cloud}
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <FederatedLearning progress={data.federatedProgress} />
                <WashOptimization value={data.washFreq} />
                <RULPanel rul={data.rul} />
              </div>

              <BlockchainLog blocks={data.blocks} />
            </section>

            <footer className="border-t border-border/60 pt-4 text-center font-mono text-[10px] text-muted-foreground">
              NAIADE · Decentralized Water Filtration · Graphene Oxide × Edge-AI · © 2025
            </footer>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
