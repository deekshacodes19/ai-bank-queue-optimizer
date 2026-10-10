'use client';

import React from 'react';
import { RefreshCw, Landmark, Database } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function SettingsView() {
  const { resetDemoData, tokens, counters } = useQueue();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Configuration
            </span>
            <span className="text-xs text-slate-300">• Branch System Settings</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            System & Queue Configuration
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Manage local storage persistence, test parameters, and reset initial reference data for demo purposes.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-blue-600" />
            <span>Branch Details</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Branch identification shown on customer tokens & receipts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Branch Name</label>
              <input
                type="text"
                readOnly
                value="Main Branch"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Operating Hours</label>
              <input
                type="text"
                readOnly
                value="9:30 AM - 4:30 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Demo Data & Storage</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Currently storing {tokens.length} tokens and {counters.length} counters in browser localStorage.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-amber-900">Reset Demo State to Reference Image</h4>
              <p className="text-[11px] text-amber-700/80 mt-0.5">
                Restores the initial tokens (A023-A030) and counter states matching the dashboard reference design.
              </p>
            </div>
            <button
              onClick={resetDemoData}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
