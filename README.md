# 💧 Naiade Control Center: Industrial Digital Twin & Edge-AI Water Treatment System

[![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Framework](https://img.shields.io/badge/Framework-React%2018%20%7C%20Vite-61DAFB?logo=react)](#)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20%7C%20shadcn--ui-38B2AC?logo=tailwind-css)](#)
[![AI & MLOps](https://img.shields.io/badge/Edge--AI-Local%20CNN%20%7C%20Federated%20Learning-blue)](#)
[![Audit](https://img.shields.io/badge/Compliance-Blockchain--Backed%20Audit%20Trail-orange)](#)

> Decentralized industrial water treatment supervision. Real-time molecular Raman telemetry, interactive SVG P&ID digital twins, local edge inference, and federated predictive maintenance.

---

## 📌 Executive Summary

Traditional water treatment infrastructure relies on centralized, delayed laboratory sampling that fails to prevent membrane fouling or trace chemical contamination in real time.

Naiade is an enterprise-grade industrial digital twin and supervision cockpit for decentralized water treatment plants (DWP - Decentralized Water Protocol).

The platform integrates 50ms Raman molecular spectroscopy, interactive P&ID blueprints, local Edge-AI autonomous response (<10ms CNN classification), and Federated MLOps for Graphene-Oxide membrane optimization.

---

## 🏛️ Digital Twin Topology

```
                         NAIADE CONTROL CENTER
                                   │
              Industrial Water Filtration Facilities (Skids)
                                   │
                                   ▼
       ┌───────────────────────────────────────────────────────┐
       │               REAL-TIME INGESTION LAYER               │
       │       50ms Raman Spectroscopy, Pressure, Flow Rate    │
       └───────────────────────────┬───────────────────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
       ┌───────────────────────────┐ ┌───────────────────────────┐
       │    LOCAL EDGE-AI ENGINE   │ │    FEDERATED MLOps HUB    │
       │  Sub-10ms CNN Anomaly Det │ │ Decentralized Weights Agg │
       │  Auto CIP / Backwash Trig │ │ LSTM Remaining Useful Life│
       └─────────────┬─────────────┘ └─────────────┬─────────────┘
                     │                             │
                     └─────────────┬───────────────┘
                                   │
                                   ▼
       ┌───────────────────────────────────────────────────────┐
       │             SUPERVISION & COMPLIANCE UI               │
       │    Interactive SVG P&ID Map, Cryptographic Audit Trail│
       └───────────────────────────────────────────────────────┘
```

The system provides complete multi-tenancy, enabling operators to switch between facility topologies (Linear, U-Loop, Skid) with dynamic baseline telemetry.

---

## ⚙️ Core Architectural Modules

### Verified Frontend Components
- **System Overview ([`src/components/naiade/SystemOverview.tsx`](src/components/naiade/SystemOverview.tsx)):** Process flow schematic supervising greywater input to Ultra-Pure Water (UPW) output with energy recovery metrics.
- **Interactive P&ID Map ([`src/components/naiade/PlantMap.tsx`](src/components/naiade/PlantMap.tsx)):** Blueprint-style SVG topology with live sensor pins, pan-zoom controls, and equipment telemetry sidebars.
- **Molecular Telemetry ([`src/components/naiade/RamanSpectrogram.tsx`](src/components/naiade/RamanSpectrogram.tsx)):** Real-time molecular certification via 50ms refresh Raman spectroscopy detecting chemical peaks.
- **Edge-AI Anomaly Engine ([`src/components/naiade/AnomalyPanel.tsx`](src/components/naiade/AnomalyPanel.tsx)):** Autonomous local CNN inference executing clean-in-place (CIP) and backwash remediations before manual alarms trigger.
- **Federated MLOps ([`src/components/naiade/FederatedLearning.tsx`](src/components/naiade/FederatedLearning.tsx)):** Decentralized model gradient aggregation preserving raw data privacy across the fleet.
- **Predictive Maintenance ([`src/components/naiade/PredictiveMaintenance.tsx`](src/components/naiade/PredictiveMaintenance.tsx)):** LSTM networks forecasting the Remaining Useful Life (RUL) of Graphene-Oxide membranes.
- **Cryptographic Audit Log ([`src/components/naiade/BlockchainLog.tsx`](src/components/naiade/BlockchainLog.tsx)):** Tamper-proof, SHA-256 hashed audit trail certifying water quality and model update provenance.

---

## 🛠️ Production Quickstart

### 1. Installation & Environment Setup
Clone the repository and install dependencies using npm:
```powershell
# Install node packages
npm install
```

### 2. Development & Production Build
Launch the high-speed Vite development server or compile the production bundle:
```powershell
# Start local development server with hot-reload
npm run dev

# Run TypeScript typecheck and production build
npm run build

# Preview production build locally
npm run preview
```

---

**Author:** Francesco Colombini  
[GitHub Profile](https://github.com/FRA-0023) · [LinkedIn](https://www.linkedin.com/in/francescocolombini/)