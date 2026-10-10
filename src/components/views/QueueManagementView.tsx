'use client';

import React from 'react';
import {
  Plus,
  Search,
  CheckCircle,
  Play,
  Ban,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { ServiceType } from '@/types/queue';

export default function QueueManagementView() {
  const {
    tokens,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    priorityFilter,
    setPriorityFilter,
    setIsTokenModalOpen,
    setSelectedToken,
    setIsTokenSlipModalOpen,
    startService,
    completeService,
    cancelToken,
    resetDemoData,
  } = useQueue();

  const servicesList: ServiceType[] = [
    'Account Opening',
    'Cash Deposit',
    'Cash Withdrawal',
    'Passbook Update',
    'Fixed Deposit',
    'Loan Enquiry',
  ];

  const filteredTokens = tokens.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedCounter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesService = serviceFilter === 'ALL' || t.serviceType === serviceFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesService && matchesPriority;
  });

  const waitingCount = tokens.filter((t) => t.status === 'Waiting').length;
  const servingCount = tokens.filter((t) => t.status === 'Serving').length;
  const completedCount = tokens.filter((t) => t.status === 'Completed').length;
  const cancelledCount = tokens.filter((t) => t.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Phase 1 Live Module
            </span>
            <span className="text-xs text-slate-300 font-medium">• Smart Queue Control</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Queue Management Console
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Real-time customer token dispatching, priority queues, automated service transitions, and branch counter coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Token</span>
          </button>
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all"
            title="Reset to default reference queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Status Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Waiting in Line
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{waitingCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Currently Serving
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{servingCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Served Today
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{completedCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Cancelled
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{cancelledCount}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filters and Controls */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['ALL', 'Waiting', 'Serving', 'Completed', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search, Service, and Priority filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Service filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Services</option>
              {servicesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Priorities</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Senior Citizen">Senior Citizen</option>
              <option value="Differently Abled">Special Assistance</option>
            </select>

            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search token, name, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Tokens Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-white">
                <th className="py-3 px-5">Token No.</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Assigned Counter</th>
                <th className="py-3 px-4">Waiting Time</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700 text-sm mb-1">No tokens match criteria</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                filteredTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            token.status === 'Serving'
                              ? 'bg-emerald-500'
                              : token.status === 'Waiting'
                              ? 'bg-amber-400'
                              : token.status === 'Completed'
                              ? 'bg-blue-500'
                              : 'bg-rose-500'
                          }`}
                        ></span>
                        <span>{token.tokenNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{token.customerName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{token.serviceType}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{token.assignedCounter}</td>
                    <td className="py-3.5 px-4 font-medium">
                      {token.status === 'Waiting' ? (
                        <div
                          className="flex items-center gap-1.5"
                          title={
                            token.waitTimeBreakdown
                              ? `AI Calculation:\n• Base Service: ${token.waitTimeBreakdown.serviceDuration}m\n• Ahead in line: ${token.waitTimeBreakdown.queuePositionAhead}\n• Active Counters: ${token.waitTimeBreakdown.activeServerCount}\n• Priority Bonus: -${token.waitTimeBreakdown.priorityAdjustmentMinutes}m`
                              : `Estimated wait: ${token.waitingTime}m`
                          }
                        >
                          <span className="font-bold text-slate-800">~{token.waitingTime} min</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                            AI
                          </span>
                        </div>
                      ) : token.status === 'Serving' ? (
                        <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          At Window
                        </span>
                      ) : token.status === 'Completed' ? (
                        <span className="text-slate-500 font-medium text-[11px]">
                          {token.waitingTime} min total
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {token.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          token.status === 'Serving'
                            ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200'
                            : token.status === 'Waiting'
                            ? 'bg-amber-100/80 text-amber-800 border-amber-200'
                            : token.status === 'Completed'
                            ? 'bg-blue-100/80 text-blue-800 border-blue-200'
                            : 'bg-rose-100/80 text-rose-800 border-rose-200'
                        }`}
                      >
                        {token.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {token.status === 'Waiting' && (
                          <>
                            <button
                              onClick={() => startService(token.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                              <span>Start</span>
                            </button>
                            <button
                              onClick={() => cancelToken(token.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {token.status === 'Serving' && (
                          <>
                            <button
                              onClick={() => completeService(token.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => cancelToken(token.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedToken(token);
                            setIsTokenSlipModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium border border-slate-200 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Slip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
