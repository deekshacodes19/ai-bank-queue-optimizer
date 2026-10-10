'use client';

import React from 'react';
import {
  Ticket,
  Search,
  X,
  Play,
  CheckCircle,
  Ban,
  AlertCircle,
  Plus,
  Eye,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { Priority, QueueStatus } from '@/types/queue';

export default function LiveQueueTable() {
  const {
    tokens,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    setIsTokenModalOpen,
    setSelectedToken,
    setIsTokenSlipModalOpen,
    startService,
    completeService,
    cancelToken,
    setActiveTab,
  } = useQueue();

  // Filter tokens based on search, status, and priority
  const filteredTokens = tokens.filter((t) => {
    // Search query filter
    const matchesSearch =
      searchQuery === '' ||
      t.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedCounter.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    // Priority filter
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate status counts for filter badges
  const statusCounts = {
    ALL: tokens.length,
    Waiting: tokens.filter((t) => t.status === 'Waiting').length,
    Serving: tokens.filter((t) => t.status === 'Serving').length,
    Completed: tokens.filter((t) => t.status === 'Completed').length,
    Cancelled: tokens.filter((t) => t.status === 'Cancelled').length,
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'Serving':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            Serving
          </span>
        );
      case 'Waiting':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
            Waiting
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/80 text-blue-800 border border-blue-200">
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100/80 text-rose-800 border border-rose-200">
            Cancelled
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'VIP':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            VIP
          </span>
        );
      case 'Senior Citizen':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
            Senior
          </span>
        );
      case 'Differently Abled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Special
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200">
            Regular
          </span>
        );
    }
  };

  const getStatusDotColor = (status: QueueStatus) => {
    switch (status) {
      case 'Serving':
        return 'bg-emerald-500';
      case 'Waiting':
        return 'bg-amber-400';
      case 'Completed':
        return 'bg-blue-500';
      case 'Cancelled':
        return 'bg-rose-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">
              Live Queue - Token Status
            </h3>
            <p className="text-xs text-slate-400">
              Real-time customer queue tracking & counter assignment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Token</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
          >
            View All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'Waiting', 'Serving', 'Completed', 'Cancelled'] as const).map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {statusCounts[st]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Priority Controls */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Priorities</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Senior Citizen">Senior Citizen</option>
            <option value="Differently Abled">Special</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-white">
              <th className="py-3 px-5">Token No.</th>
              <th className="py-3 px-4">Service Type</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Counter</th>
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
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">
                      No Tokens Found
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                        ? 'No queue entries matched your search or filters.'
                        : 'There are currently no tokens in the bank queue.'}
                    </p>
                    {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('ALL');
                          setPriorityFilter('ALL');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTokenModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        Generate First Token
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTokens.map((token) => (
                <tr
                  key={token.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Token Number */}
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusDotColor(token.status)}`}
                      ></span>
                      <span>{token.tokenNumber}</span>
                    </div>
                  </td>

                  {/* Service Type */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {token.serviceType}
                  </td>

                  {/* Customer Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {token.customerName}
                  </td>

                  {/* Assigned Counter */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {token.assignedCounter}
                  </td>

                  {/* Waiting Time (AI Predicted) */}
                  <td className="py-3.5 px-4 font-medium">
                    {token.status === 'Waiting' ? (
                      <div
                        className="flex items-center gap-1.5"
                        title={
                          token.waitTimeBreakdown
                            ? `AI Calculation:\n• Base Service Duration: ${token.waitTimeBreakdown.serviceDuration}m\n• Customers Ahead: ${token.waitTimeBreakdown.queuePositionAhead}\n• Active Service Counters: ${token.waitTimeBreakdown.activeServerCount}\n• Priority Bonus: -${token.waitTimeBreakdown.priorityAdjustmentMinutes}m`
                            : `Estimated wait: ${token.waitingTime} minutes`
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

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    {getPriorityBadge(token.priority)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(token.status)}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {token.status === 'Waiting' && (
                        <>
                          <button
                            onClick={() => startService(token.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-colors"
                            title="Start serving customer at assigned counter"
                          >
                            <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            <span>Start</span>
                          </button>
                          <button
                            onClick={() => cancelToken(token.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Cancel token"
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
                            title="Complete service"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => cancelToken(token.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Cancel token"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {(token.status === 'Completed' || token.status === 'Cancelled') && (
                        <button
                          onClick={() => {
                            setSelectedToken(token);
                            setIsTokenSlipModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium border border-slate-200 transition-colors"
                          title="View token slip"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Slip</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
