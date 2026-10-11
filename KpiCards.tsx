'use client';

import React from 'react';
import { Users, Hourglass, Clock, Monitor, Landmark, ArrowUp, ArrowDown } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function KpiCards() {
  const { kpis } = useQueue();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Customers */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide block">
              Total Customers
            </span>
            <div className="text-2xl font-bold text-slate-800 leading-tight">
              {kpis.totalCustomers}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-2 pt-2 border-t border-slate-100">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>12%</span>
          <span className="text-slate-400 font-normal">vs. last hour</span>
        </div>
      </div>

      {/* 2. Waiting Customers */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide block">
              Waiting Customers
            </span>
            <div className="text-2xl font-bold text-slate-800 leading-tight">
              {kpis.waitingCustomers}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-2 pt-2 border-t border-slate-100">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>35%</span>
          <span className="text-slate-400 font-normal">vs. last hour</span>
        </div>
      </div>

      {/* 3. Avg. Waiting Time */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide block">
              Avg. Waiting Time
            </span>
            <div className="text-2xl font-bold text-slate-800 leading-tight">
              {kpis.avgWaitingTime} min
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-2 pt-2 border-t border-slate-100">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>48%</span>
          <span className="text-slate-400 font-normal">vs. last hour</span>
        </div>
      </div>

      {/* 4. Active Counters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide block">
              Active Counters
            </span>
            <div className="text-2xl font-bold text-slate-800 leading-tight">
              {kpis.activeCounters}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-normal mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{kpis.countersOnBreak} counter on break</span>
        </div>
      </div>

      {/* 5. Branch Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 tracking-tight block">
              {kpis.branchName}
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Working Hours: {kpis.workingHours}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mt-2 pt-2 border-t border-slate-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Open</span>
        </div>
      </div>
    </div>
  );
}
