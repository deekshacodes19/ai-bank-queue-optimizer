'use client';

import React from 'react';
import {
  Monitor,
  Coffee,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function CounterAllocationView() {
  const {
    counters,
    tokens,
    callNextWaiting,
    completeService,
    toggleCounterStatus,
  } = useQueue();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Counter Allocation Desk
            </span>
            <span className="text-xs text-slate-300">• 5 Windows Configured</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Counter Dispatch & Operator Workspace
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Assign bank tellers, manage break shifts, and trigger 1-click customer calls directly to available service windows.
          </p>
        </div>
      </div>

      {/* Counters Detailed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {counters.map((counter) => {
          // Waiting customers specifically waiting for this counter's service
          const waitingForThis = tokens.filter(
            (t) =>
              t.status === 'Waiting' &&
              (counter.supportedServices.includes(t.serviceType) ||
                t.assignedCounter === counter.name)
          );

          const servingToken = tokens.find((t) => t.id === counter.currentServingTokenId);

          return (
            <div
              key={counter.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-800">{counter.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {counter.specialization}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      counter.status === 'In Service'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : counter.status === 'Available'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        counter.status === 'In Service'
                          ? 'bg-emerald-500'
                          : counter.status === 'Available'
                          ? 'bg-blue-500'
                          : 'bg-amber-400'
                      }`}
                    ></span>
                    {counter.status}
                  </span>
                </div>

                {/* Currently Serving Section */}
                <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Customer at Counter
                  </span>
                  {servingToken ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          Token {servingToken.tokenNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {servingToken.priority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {servingToken.customerName}
                      </p>
                      <p className="text-[11px] text-slate-500">{servingToken.serviceType}</p>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-slate-400 text-xs font-medium">
                      Window is currently idle. No active customer.
                    </div>
                  )}
                </div>

                {/* Services Handled Badges */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Supported Services
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {counter.supportedServices.map((srv) => (
                      <span
                        key={srv}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-blue-50/70 text-blue-700 border border-blue-100"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customers Waiting:</span>
                    <span className="font-bold text-amber-600">{waitingForThis.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Completed Today:</span>
                    <span className="font-bold text-slate-800">{counter.totalServed}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {counter.status === 'On Break' ? (
                  <button
                    onClick={() => toggleCounterStatus(counter.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>End Break & Resume</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => callNextWaiting(counter.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Call Next Waiting</span>
                    </button>
                    {counter.currentServingTokenId && (
                      <button
                        onClick={() => completeService(counter.currentServingTokenId!)}
                        className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all flex items-center gap-1"
                        title="Complete current token"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleCounterStatus(counter.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-all"
                      title="Toggle counter break"
                    >
                      <Coffee className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
