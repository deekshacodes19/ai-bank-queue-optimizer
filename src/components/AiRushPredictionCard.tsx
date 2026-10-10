'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { Brain, Lightbulb, Sparkles } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { HourlyRushPrediction } from '@/types/queue';

export default function AiRushPredictionCard() {
  const { hourlyPredictions } = useQueue();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>('1 PM');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const peakPoint = hourlyPredictions.find((p) => p.isPeak) || hourlyPredictions[4];

  // Custom tooltips matching dark navy banking theme
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: HourlyRushPrediction }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0a1838] text-white p-3.5 rounded-2xl shadow-xl border border-blue-500/30 text-xs min-w-[200px] animate-in fade-in-50">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-blue-900/50">
            <span className="font-bold text-sm text-white">{data.hour}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                data.trafficLevel === 'Peak'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : data.trafficLevel === 'Busy'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {data.trafficLevel} Flow
            </span>
          </div>

          <div className="text-[11px] text-slate-300 mb-2">{data.timeLabel}</div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Predicted Rush:</span>
              <span className="font-bold text-[#38bdf8]">{data.predicted} customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Actual Handled:</span>
              <span className="font-semibold text-slate-200">{data.actual} customers</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-blue-900/40 text-[10px]">
              <span className="text-slate-400">Congestion Index:</span>
              <span className="font-bold text-amber-400">{data.congestionIndex}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between">
      <div>
        {/* Header bar */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 tracking-tight flex items-center gap-1.5">
                AI Rush Prediction
                <span className="text-[10px] font-normal text-slate-400">(Recharts)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Forecasted customer traffic density for today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live AI</span>
          </div>
        </div>

        {/* Legend & Simulation Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 my-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Simulated Poisson Forecast Model v2.4</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
              <span className="text-slate-700 font-medium">Predicted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span>Actual</span>
            </div>
          </div>
        </div>

        {/* Traffic Level Pill Badges */}
        <div className="flex items-center justify-between gap-1.5 py-2 overflow-x-auto">
          {hourlyPredictions.map((hp) => {
            const isSelected = selectedHour === hp.hour;
            return (
              <button
                key={hp.hour}
                onClick={() => setSelectedHour(hp.hour)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : hp.isPeak
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : hp.trafficLevel === 'Busy'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                }`}
                title={`${hp.hour}: ${hp.predicted} cust/hr (${hp.trafficLevel})`}
              >
                <span>{hp.hour}</span>
                {hp.isPeak && <span className="ml-1 text-[8px]">★ Peak</span>}
              </button>
            );
          })}
        </div>

        {/* Recharts Interactive Area Chart */}
        <div className="h-44 w-full my-2">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyPredictions}
                margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  domain={[0, 80]}
                  ticks={[0, 20, 40, 60, 80]}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Reference peak marker */}
                {peakPoint && (
                  <>
                    <ReferenceLine
                      x={peakPoint.hour}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{
                        value: 'Peak (72/hr)',
                        position: 'top',
                        fill: '#ef4444',
                        fontSize: 9,
                        fontWeight: 'bold',
                      }}
                    />
                    <ReferenceDot
                      x={peakPoint.hour}
                      y={peakPoint.predicted}
                      r={5}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </>
                )}
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  dot={{ r: 2.5, fill: '#2563eb', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 5, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading AI Rush Model...
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendation Alert */}
      <div className="mt-2 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-3 h-3" />
        </div>
        <p className="text-[11px] text-blue-900 leading-snug">
          <strong className="font-semibold">AI Prediction:</strong> Peak rush forecasted at{' '}
          <span className="font-bold text-blue-700">1:00 PM (~72 customers)</span>. High congestion window: 12:30 PM – 2:00 PM.
        </p>
      </div>
    </div>
  );
}
