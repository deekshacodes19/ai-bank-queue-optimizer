'use client';

import React from 'react';
import { Zap, Ticket, BarChart3, Sliders, Settings } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function QuickActionsCard() {
  const { setIsTokenModalOpen, setActiveTab, optimizeQueue } = useQueue();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 fill-blue-600" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 tracking-tight">
          Quick Actions
        </h3>
      </div>

      {/* 4 Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Generate Token */}
        <button
          onClick={() => setIsTokenModalOpen(true)}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
            <Ticket className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
            Generate Token
          </span>
        </button>

        {/* 2. View Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
            View Reports
          </span>
        </button>

        {/* 3. Manage Counters */}
        <button
          onClick={() => setActiveTab('counters')}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
            Manage Counters
          </span>
        </button>

        {/* 4. Optimize Queue */}
        <button
          id="quick-optimize-btn"
          onClick={optimizeQueue}
          className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-indigo-700 group-hover:text-indigo-800">
            Optimize Queue
          </span>
        </button>

        {/* 5. Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}
