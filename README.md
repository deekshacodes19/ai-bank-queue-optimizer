# 🏦 BankQueue AI — AI Bank Queue & Counter Optimizer

> **Smarter Queues, Happier Customers.**  
> An intelligent banking operations dashboard engineered with Next.js 14, TypeScript, TailwindCSS, and Recharts. Designed to balance teller workloads, predict queue wait times using mathematical models, and optimize customer throughput across branch counters.

---

## ✨ Features Across All Phases

### 🎯 Phase 1: Smart Queue Management
- **Live Queue Table**: Real-time status filtering (`Waiting`, `Serving`, `Completed`, `Cancelled`), customer priority tagging, and teller assignments.
- **Generate Token Modal**: Instant digital token issuance with customer details, 6 banking service categories, and priority classes (*VIP, Senior Citizen, Differently Abled, Regular*).
- **Printable Token Slips**: Modal dialog with formatted slips and print actions.
- **Teller Service Controls**: Call next customer, start service, and complete service with state transitions.

### 🧠 Phase 2: AI-Based Waiting-Time & Rush Prediction
- **Dynamic Waiting-Time Engine**: M/M/c queuing formulation calculating per-token wait times based on benchmark service durations, queue position ahead, active counter throughput, and priority weights.
- **Rush-Hour Traffic Forecast**: Interactive Recharts density charts predicting hourly customer arrival curves and congestion risk levels.
- **Actionable AI Recommendations**: Proactive alerts advising counter activation or queue rerouting.

### ⚡ Phase 3: Intelligent Counter Allocation & Optimization
- **Real-Time Counter Allocation Grid**: Visual teller window cards with utilization percentage meters, status indicators (*Available, Serving, Busy, Offline, On Break*), and live waiting queues.
- **Queue Optimization Algorithm**: One-click **"Optimize Queue"** engine that redistributes waiting tickets from overloaded windows to underutilized compatible counters.
- **Optimization Audit Report**: Transparent audit summary displaying reassigned tokens and average wait-time reductions.

### 📊 Phase 4: Analytics & Operational Reports
- **Executive Operations KPIs**: Total Customers Served, Resolution Rate, Active Waiting Count, Average Wait Time, and Counter Utilization.
- **Interactive Recharts Visualizations**:
  - *Customer Traffic & Served Volume* (AreaChart with dual series)
  - *Waiting-Time Trajectory* (LineChart showing average vs peak wait spikes)
  - *Service Demand Distribution* (BarChart across all 6 service categories)
  - *Teller Performance & Capacity* (BarChart comparing volume to daily capacity)
- **Multi-Dimensional Filters**: Timeframe switcher (*Today, Last 7 Days, Last 30 Days*), Service Type filter, and Counter filter.
- **CSV Audit Exports**: One-click downloads for **Detailed Queue Tokens (CSV)** and **Executive Summary Audit (CSV)**.
- **Smart Bottleneck Intelligence**: Automatic alerts on peak hours, busy counters, and latency bottlenecks.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing, 0 errors)
- **Styling**: [TailwindCSS 3](https://tailwindcss.com/)
- **Charts & Telemetry**: [Recharts 3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Persistence**: React Context API + Browser `localStorage` (No backend database required, 100% client-side resilient)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.17+ or v20+)
- npm, yarn, or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your web browser.

---

## 🏗️ Project Architecture

```
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js 14 App Router layout & pages
│   │   ├── layout.tsx      # QueueProvider wrapping & root HTML
│   │   └── page.tsx        # Responsive dashboard view router
│   ├── components/         # Reusable UI & view components
│   │   ├── views/
│   │   │   ├── QueueManagementView.tsx   # Phase 1 View
│   │   │   ├── CounterAllocationView.tsx # Phase 3 View
│   │   │   ├── AiPredictionsView.tsx     # Phase 2 View
│   │   │   ├── ReportsView.tsx           # Phase 4 Analytics View
│   │   │   └── SettingsView.tsx          # System configurations
│   │   ├── CounterStatusGrid.tsx
│   │   ├── LiveQueueTable.tsx
│   │   ├── KpiCards.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopHeader.tsx
│   ├── context/
│   │   └── QueueContext.tsx # Centralized queue state & localStorage synchronization
│   ├── data/
│   │   └── mockData.ts      # Initial bank counters and sample tokens
│   ├── types/
│   │   └── queue.ts         # TypeScript data contracts & models
│   └── utils/
│       ├── aiPrediction.ts  # M/M/c wait-time prediction & optimization engine
│       └── analytics.ts     # Aggregation, CSV export, and time-series trends
├── .gitignore              # Excludes node_modules, .next, .env, and local artifacts
├── package.json
└── tsconfig.json
```

---

## ☁️ Deploying to Vercel

This project is completely optimized for **zero-configuration deployment on Vercel**:

1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** > **"Project"**.
4. Import your GitHub repository.
5. Leave the default settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
6. Click **Deploy**.

> 💡 **No environment variables or secrets needed!** The application runs entirely on client-side state and deterministic mathematical algorithms.

---

## 📄 License

MIT License. Built for bank operations intelligence and queue modernization.
