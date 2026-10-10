'use client';

import React from 'react';
import {
  Brain,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Monitor,
  Activity,
} from 'lucide-react';
import AiRushPredictionCard from '../AiRushPredictionCard';
import { useQueue } from '@/context/QueueContext';
import { SERVICE_BENCHMARK_DURATIONS } from '@/utils/aiPrediction';

export default function AiPredictionsView() {
  const { hourlyPredictions, aiRecommendations, applyAiRecommendation, kpis, tokens } = useQueue();

  const waitingCount = tokens.filter((t) => t.status === 'Waiting').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Phase 2: AI Waiting-Time & Rush Prediction Engine
            </span>
            <span className="text-xs text-slate-300">• M/M/c Queuing & Poisson Model</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            AI Waiting-Time & Traffic Forecasting
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Mathematical waiting-time projections accounting for queue positions, service benchmark durations, active teller capacity, priority weights, and hourly arrival rushes.
          </p>
        </div>

        {/* Current Flow Badge */}
        <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl border border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#38bdf8] animate-pulse" />
            <div className="text-left text-xs">
              <span className="text-slate-300 block text-[10px] uppercase font-bold">Avg Wait Time</span>
              <span className="font-bold text-lg text-white">~{kpis.avgWaitingTime} min</span>
            </div>
          </div>
          <div className="border-l border-white/20 pl-3 text-left text-xs">
            <span className="text-slate-300 block text-[10px] uppercase font-bold">Waiting in Line</span>
            <span className="font-bold text-lg text-amber-300">{waitingCount}</span>
          </div>
        </div>
      </div>

      {/* Grid: Rush Prediction Chart + Congestion Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recharts Rush Forecast (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AiRushPredictionCard />

          {/* Hourly Traffic Density Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-800">Hourly Traffic Density Matrix</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Working Day: 9 AM - 5 PM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 px-3">Hour Slot</th>
                    <th className="py-2 px-3">Forecast Volume</th>
                    <th className="py-2 px-3">Traffic Level</th>
                    <th className="py-2 px-3">Congestion Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hourlyPredictions.map((hp) => (
                    <tr key={hp.hour} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {hp.hour} <span className="text-[10px] font-normal text-slate-400">({hp.timeLabel})</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {hp.predicted} customers/hr
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            hp.trafficLevel === 'Peak'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : hp.trafficLevel === 'Busy'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {hp.trafficLevel}
                          {hp.isPeak && ' ★'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                hp.congestionIndex > 70
                                  ? 'bg-rose-500'
                                  : hp.congestionIndex > 45
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${hp.congestionIndex}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {hp.congestionIndex}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Benchmark Durations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Recommendations with Explanations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Brain className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-800">AI Recommendations & Reasoning</h4>
            </div>

            <div className="space-y-3.5">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {rec.severity === 'high' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : rec.severity === 'medium' ? (
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{rec.title}</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5">{rec.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Why Generated Reasoning Box */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-[11px] space-y-1">
                    <p className="text-slate-700">
                      <strong className="text-slate-900 font-semibold">Reason:</strong> {rec.reason}
                    </p>
                    <p className="text-blue-700 font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
                      <span>Impact: {rec.projectedImpact}</span>
                    </p>
                  </div>

                  {rec.actionLabel && (
                    <button
                      onClick={() => applyAiRecommendation(rec.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>{rec.actionLabel}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark Durations Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-800">
                Service Benchmark Durations ($\mu$)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Standard processing durations used by the deterministic waiting-time prediction engine:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(SERVICE_BENCHMARK_DURATIONS).map(([service, duration]) => (
                <div
                  key={service}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-700 truncate pr-1">{service}</span>
                  <span className="font-bold text-blue-600 shrink-0">{duration} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
