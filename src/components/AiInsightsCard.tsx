'use client';

import React, { useState } from 'react';
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingDown,
  Monitor,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function AiInsightsCard() {
  const { aiRecommendations, applyAiRecommendation, setActiveTab } = useQueue();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight">
              AI Insights & Congestion Control
            </h3>
            <p className="text-[10px] text-slate-400">
              Proactive queue alerts & transparent reasoning
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('predictions')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View All
        </button>
      </div>

      {/* Dynamic Recommendation Cards */}
      <div className="space-y-3">
        {aiRecommendations.slice(0, 3).map((rec) => {
          const isExpanded = expandedId === rec.id;

          const getBadge = () => {
            if (rec.severity === 'high') {
              return {
                bg: 'bg-rose-50 border-rose-200 text-rose-800',
                icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
              };
            }
            if (rec.severity === 'medium') {
              return {
                bg: 'bg-amber-50/70 border-amber-200 text-amber-800',
                icon: <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />,
              };
            }
            return {
              bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-800',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
            };
          };

          const badge = getBadge();

          return (
            <div
              key={rec.id}
              className={`p-3 rounded-xl border transition-all ${badge.bg}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {badge.icon}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(rec.id)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                  title="Toggle AI explanation"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Action Button if Counter Opening is Recommended */}
              {rec.actionLabel && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-slate-500">
                    Recommended immediate action:
                  </span>
                  <button
                    onClick={() => applyAiRecommendation(rec.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Monitor className="w-3 h-3" />
                    <span>{rec.actionLabel}</span>
                  </button>
                </div>
              )}

              {/* Transparent Reasoning (Why this recommendation was generated) */}
              {isExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 text-[11px] space-y-1.5 animate-in fade-in-50">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                    <p className="text-slate-700">
                      <strong className="text-slate-900 font-semibold">Why generated:</strong>{' '}
                      {rec.reason}
                    </p>
                    <p className="text-blue-700 font-medium flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-blue-600" />
                      <span>{rec.projectedImpact}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
