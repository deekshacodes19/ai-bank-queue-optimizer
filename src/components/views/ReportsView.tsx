'use client';

import React from 'react';
import { Download, Users, Clock, CheckCircle } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function ReportsView() {
  const { tokens, counters, addToast } = useQueue();

  const handleExport = () => {
    // Generate CSV export of current queue
    const headers = ['Token Number', 'Customer Name', 'Service Type', 'Assigned Counter', 'Priority', 'Status', 'Wait Time (min)'];
    const rows = tokens.map((t) => [
      t.tokenNumber,
      `"${t.customerName}"`,
      `"${t.serviceType}"`,
      t.assignedCounter,
      t.priority,
      t.status,
      t.waitingTime,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bank_queue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Report Exported', 'Queue records downloaded as CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Operations Audit
            </span>
            <span className="text-xs text-slate-300">• Daily Performance Logs</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Queue Analytics & Operational Reports
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Analyze counter efficiency, customer wait time distributions, and service turnaround times.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Export Queue CSV</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Total Processed</span>
              <span className="text-xl font-bold text-slate-800">{tokens.length} Customers</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Active session records stored in local demo database.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Resolution Rate</span>
              <span className="text-xl font-bold text-slate-800">
                {Math.round(
                  (tokens.filter((t) => t.status === 'Completed').length /
                    Math.max(1, tokens.length)) *
                    100
                )}
                %
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Completed service tickets without customer cancellation.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Teller Window Load</span>
              <span className="text-xl font-bold text-slate-800">
                {counters.reduce((acc, c) => acc + c.totalServed, 0)} Total Calls
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Across 5 configured bank teller stations.
          </p>
        </div>
      </div>
    </div>
  );
}
