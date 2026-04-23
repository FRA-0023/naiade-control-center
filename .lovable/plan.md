
# Naiade — Data Science & MLOps Control Center

A premium, dark-themed real-time dashboard for monitoring Naiade's decentralized water filtration system: sensor ingestion, Edge-AI inference, and cloud MLOps.

## Visual Direction
- **Theme**: Dark mode default, deep slate/navy base (`bg-slate-950`) evoking deep water + tech
- **Accents**: Cyan / aqua / electric blue for live data, lines, and active states; amber for warnings, red for anomalies, emerald for "safe"
- **Typography**: Inter for UI, JetBrains Mono for logs, hashes, and raw metrics
- **Feel**: Enterprise-grade — subtle glows on active elements, thin borders, generous spacing, animated tick indicators

## Layout
- **Left sidebar** (collapsible): Naiade logo, node identifier ("Node #451"), navigation between the 3 macro-sections, system health footer
- **Top bar**: Section title, live clock, global status pill, connection indicator
- **Main area**: Switches between the three modules below

## Module 1 — Data Ingestion (Real-Time Sensors)
- **Raman Spectrogram Stream**: Wide area/line chart updating every 50 ms, simulating wavelength intensity sweep across ~200 points; subtle "scanning" overlay
- **3 KPI cards** (1 s tick) with sparkline + delta:
  - Pressure (bar)
  - Flow rate (m³/h)
  - Electrical Conductivity (μS/cm)
- **Sensor health strip**: small badges for each sensor showing OK / drift / offline

## Module 2 — Edge-AI Operations (Local Inference)
- **Anomaly Detection card**:
  - Large status badge: SAFE (emerald) / ANOMALY DETECTED (red, pulsing)
  - Sub-line: "Scanning against 1.2M chemical signatures"
  - Inference latency mini-chart (target <10 ms)
  - Event log (monospace) with timestamps; scripted demo event: anomaly detected → bypass valve auto-closed
- **CNN Predictive Maintenance (MobileNetV3)**:
  - Line chart: historical ΔP across the membrane, with a highlighted drift band (0.3–0.5 bar)
  - Prominent alert tile with countdown: "Biofouling predicted in 48–72 h — preventative wash scheduled"

## Module 3 — MLOps, Cloud & Blockchain
- **Federated Learning Sync**: Node #451 ↔ Global Cloud diagram; progress bar + log lines: "Local model trained → pushing weights → raw data kept local"
- **LightGBM/XGBoost Wash Optimization**: Radial gauge for "Optimized Wash Frequency" + feature importance list (Input quality, Temperature, Past washes, Pressure)
- **LSTM Remaining Useful Life**: Degradation curve + RUL % progress bar; supply-chain alert: "RUL at 15% — spare parts dispatch triggered"
- **Blockchain Audit Log**: Terminal-style scrolling window with hashed entries (block #, timestamp, prediction hash, signature) — "Sanitary Authority Compliance Log"

## Real-Time Data Engine
- Custom `useMockData` hook centralizing all `setInterval` tickers:
  - 50 ms → Raman spectrogram frames
  - 1 s → KPI metrics + inference latency
  - 5 s → ΔP history point + new blockchain block
  - Scripted timeline → anomaly event, federated sync, RUL alert
- Data buffers capped to keep charts smooth and memory bounded

## Tech
- React + Tailwind + shadcn/ui (Card, Badge, Progress, Tabs, ScrollArea, Sidebar)
- `recharts` for all charts (Line, Area, Radial)
- `lucide-react` icons: Activity, ShieldAlert, Cpu, Database, Link, Waves, GitBranch, Gauge, Zap
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Single-page dashboard at `/` with the 3 sections stacked (sidebar nav also scroll-anchors to each)
