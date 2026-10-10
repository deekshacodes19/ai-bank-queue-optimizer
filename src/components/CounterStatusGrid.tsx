'use client';

import React from 'react';
import { Monitor, User, Coffee, Play, CheckCircle2 } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { CounterStatus } from '@/types/queue';

export default function CounterStatusGrid() {
  const {
    counters,
    callNextWaiting,
    completeService,
    toggleCounterStatus,
    setActiveTab,
  } = useQueue();

  const getStatusColor = (status: CounterStatus) => {
    switch (status) {
      case 'In Service':
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          badge: 'bg-emerald-50 border-emerald-200',
        };
      case 'Available':
        return {
          dot: 'bg-blue-500',
          text: 'text-blue-700',
          badge: 'bg-blue-50 border-blue-200',
        };
      case 'On Break':
        return {
          dot: 'bg-amber-400',
          text: 'text-amber-700',
          badge: 'bg-amber-50 border-amber-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">
              Counter Status
            </h3>
            <p className="text-xs text-slate-400">
              Live operator status & workload across all bank service windows
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('counters')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View All
        </button>
      </div>

      {/* Grid of 5 Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {counters.map((counter) => {
          const style = getStatusColor(counter.status);
          const progressPercent = Math.min(
            100,
            Math.round((counter.totalServed / counter.dailyCapacity) * 100)
          );

          return (
            <div
              key={counter.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Counter Name & Service */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 tracking-tight">
                      {counter.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]" title={counter.specialization}>
                      {counter.specialization}
                    </p>
                  </div>
                  {/* Status Indicator Dot */}
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                    <span className={`text-[10px] font-semibold ${style.text}`}>
                      {counter.status}
                    </span>
                  </div>
                </div>

                {/* Currently Serving Box */}
                <div className="my-3 p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Currently Serving
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {counter.currentServingTokenNumber
                        ? `Token ${counter.currentServingTokenNumber}`
                        : '-'}
                    </span>
                  </div>
                </div>

                {/* Total Served & Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Total Served:</span>
                    <span className="font-bold text-slate-700">{counter.totalServed}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Counter Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-1">
                {counter.status === 'On Break' ? (
                  <button
                    onClick={() => toggleCounterStatus(counter.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold transition-colors"
                  >
                    <Coffee className="w-3 h-3" />
                    <span>Resume Work</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => callNextWaiting(counter.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold border border-blue-200/70 transition-colors"
                      title="Call next waiting customer"
                    >
                      <Play className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                      <span>Call Next</span>
                    </button>
                    {counter.currentServingTokenId && (
                      <button
                        onClick={() => completeService(counter.currentServingTokenId!)}
                        className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        title="Complete active service"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleCounterStatus(counter.id)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Take a break"
                    >
                      <Coffee className="w-3.5 h-3.5" />
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
