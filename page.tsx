'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import KpiCards from '@/components/KpiCards';
import LiveQueueTable from '@/components/LiveQueueTable';
import CounterStatusGrid from '@/components/CounterStatusGrid';
import AiRushPredictionCard from '@/components/AiRushPredictionCard';
import QuickActionsCard from '@/components/QuickActionsCard';
import AiInsightsCard from '@/components/AiInsightsCard';
import GenerateTokenModal from '@/components/GenerateTokenModal';
import TokenSlipModal from '@/components/TokenSlipModal';
import ToastNotifications from '@/components/ToastNotifications';
import QueueManagementView from '@/components/views/QueueManagementView';
import CounterAllocationView from '@/components/views/CounterAllocationView';
import AiPredictionsView from '@/components/views/AiPredictionsView';
import ReportsView from '@/components/views/ReportsView';
import SettingsView from '@/components/views/SettingsView';
import { useQueue } from '@/context/QueueContext';

export default function Home() {
  const { activeTab } = useQueue();

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 antialiased font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* Row 1: KPI Cards */}
              <KpiCards />

              {/* Row 2: Two Column Main Layout matching Dashboard Reference Image */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (Approx 66% width): Live Queue + Counter Status */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Live Queue Table */}
                  <LiveQueueTable />

                  {/* Counter Status Grid */}
                  <CounterStatusGrid />
                </div>

                {/* Right Column (Approx 33% width): AI Rush Prediction + Quick Actions + AI Insights */}
                <div className="lg:col-span-4 space-y-6">
                  {/* AI Rush Prediction Card */}
                  <AiRushPredictionCard />

                  {/* Quick Actions Card */}
                  <QuickActionsCard />

                  {/* AI Insights Card */}
                  <AiInsightsCard />
                </div>
              </div>
            </>
          )}

          {activeTab === 'queue' && <QueueManagementView />}
          {activeTab === 'counters' && <CounterAllocationView />}
          {activeTab === 'predictions' && <AiPredictionsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <GenerateTokenModal />
      <TokenSlipModal />
      <ToastNotifications />
    </div>
  );
}
