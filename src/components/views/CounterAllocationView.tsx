'use client';

import React, { useState } from 'react';
import {
  Coffee,
  Play,
  CheckCircle2,
  Zap,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  Users,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Info,
  Clock,
  Shield,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { BankCounter } from '@/types/queue';

/* ─── Tiny helpers ─────────────────────────────────────────────── */

function getStatusStyle(status: BankCounter['status']) {
  switch (status) {
    case 'In Service':
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        ring: 'stroke-emerald-500',
      };
    case 'Available':
      return {
        dot: 'bg-blue-500',
        text: 'text-blue-700',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        ring: 'stroke-blue-500',
      };
    case 'On Break':
      return {
        dot: 'bg-amber-400',
        text: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        ring: 'stroke-amber-400',
      };
    default:
      return {
        dot: 'bg-slate-400',
        text: 'text-slate-600',
        badge: 'bg-slate-50 text-slate-600 border-slate-200',
        ring: 'stroke-slate-400',
      };
  }
}

/** SVG donut ring showing utilization % */
function UtilizationRing({
  pct,
  status,
}: {
  pct: number;
  status: BankCounter['status'];
}) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const style = getStatusStyle(status);
  const color =
    pct >= 85
      ? 'stroke-rose-500'
      : pct >= 65
      ? 'stroke-amber-500'
      : style.ring;

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        strokeWidth="5"
        className="stroke-slate-100"
      />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={`${color} transition-all duration-700`}
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="30"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        className="fill-slate-700"
      >
        {pct}%
      </text>
    </svg>
  );
}

/** Thin horizontal workload bar */
function WorkloadBar({ pct, isOverloaded }: { pct: number; isOverloaded?: boolean }) {
  const barColor = isOverloaded
    ? 'bg-rose-500'
    : pct >= 65
    ? 'bg-amber-500'
    : 'bg-emerald-500';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export default function CounterAllocationView() {
  const {
    enrichedCounters,
    tokens,
    callNextWaiting,
    completeService,
    toggleCounterStatus,
    optimizeQueue,
    lastOptimizationResult,
  } = useQueue();

  const [showResultPanel, setShowResultPanel] = useState(false);

  // Show result panel automatically after optimisation
  const handleOptimize = () => {
    optimizeQueue();
    setShowResultPanel(true);
  };

  const waitingCount = tokens.filter((t) => t.status === 'Waiting').length;
  const overloadedCount = enrichedCounters.filter((c) => c.isOverloaded).length;
  const totalServedToday = enrichedCounters.reduce((a, c) => a + c.totalServed, 0);
  const avgUtilization =
    enrichedCounters.length > 0
      ? Math.round(
          enrichedCounters.reduce((a, c) => a + (c.utilizationRate ?? 0), 0) /
            enrichedCounters.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ── Header banner ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Phase 3: Intelligent Counter Allocation
              </span>
              <span className="text-xs text-slate-300">• Auto-Optimization Engine</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Counter Allocation &amp; Workload Optimizer
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Real-time counter utilization tracking, overload detection, and one-click AI-driven queue
              rebalancing. Waiting customers are auto-assigned to the most suitable available window.
            </p>
          </div>

          {/* Optimize Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="optimize-queue-btn"
              onClick={handleOptimize}
              disabled={waitingCount === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.97] ${
                waitingCount > 0
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-blue-700/40 hover:scale-[1.02]'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Optimize Queue</span>
            </button>
          </div>
        </div>

        {/* Summary ribbon */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Waiting Customers',
              value: waitingCount,
              color: waitingCount > 10 ? 'text-rose-300' : 'text-amber-300',
            },
            {
              label: 'Overloaded Counters',
              value: overloadedCount,
              color: overloadedCount > 0 ? 'text-rose-300' : 'text-emerald-300',
            },
            { label: 'Served Today', value: totalServedToday, color: 'text-sky-300' },
            { label: 'Avg Utilization', value: `${avgUtilization}%`, color: 'text-violet-300' },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                {m.label}
              </span>
              <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Optimization Result Panel ──────────────────────────────── */}
      {showResultPanel && lastOptimizationResult && (
        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            lastOptimizationResult.reallocatedCount > 0
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {lastOptimizationResult.reallocatedCount > 0 ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3
                  className={`font-bold text-sm ${
                    lastOptimizationResult.reallocatedCount > 0
                      ? 'text-emerald-900'
                      : 'text-blue-900'
                  }`}
                >
                  {lastOptimizationResult.reallocatedCount > 0
                    ? `✓ Queue Optimised — ${lastOptimizationResult.reallocatedCount} Reassignment${lastOptimizationResult.reallocatedCount > 1 ? 's' : ''}`
                    : 'Queue Already Balanced'}
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    lastOptimizationResult.reallocatedCount > 0
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                  }`}
                >
                  {lastOptimizationResult.summaryMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowResultPanel(false)}
              className="text-slate-400 hover:text-slate-600 text-sm leading-none mt-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* Before / After stats */}
          {lastOptimizationResult.reallocatedCount > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Avg Wait Before
                </span>
                <span className="text-xl font-bold text-rose-600">
                  {lastOptimizationResult.initialAvgWaitTime} min
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Avg Wait After
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  {lastOptimizationResult.optimizedAvgWaitTime} min
                </span>
              </div>
            </div>
          )}

          {/* Reassignment table */}
          {lastOptimizationResult.reassignments.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-emerald-200 text-slate-500 font-semibold">
                    <th className="py-2 px-3">Token</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3">From</th>
                    <th className="py-2 px-3"></th>
                    <th className="py-2 px-3">To</th>
                    <th className="py-2 px-3 text-right">Time Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {lastOptimizationResult.reassignments.map((r, i) => (
                    <tr key={i} className="hover:bg-emerald-50/50">
                      <td className="py-2 px-3 font-bold text-slate-800">{r.tokenNumber}</td>
                      <td className="py-2 px-3 text-slate-700">{r.customerName}</td>
                      <td className="py-2 px-3 text-slate-600">{r.serviceType}</td>
                      <td className="py-2 px-3 font-medium text-rose-700">{r.fromCounter}</td>
                      <td className="py-2 px-3 text-slate-400">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{r.toCounter}</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-600">
                        ~{r.timeSavedMinutes} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Counter Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrichedCounters.map((counter) => {
          const style = getStatusStyle(counter.status);
          const servingToken = tokens.find((t) => t.id === counter.currentServingTokenId);
          const waitingForThis = tokens.filter(
            (t) =>
              t.status === 'Waiting' &&
              (counter.supportedServices.includes(t.serviceType) ||
                t.assignedCounter === counter.name)
          );
          const utilPct = counter.utilizationRate ?? 0;
          const workloadPct = Math.min(
            100,
            Math.round(((counter.workloadMinutes ?? 0) / Math.max(1, counter.dailyCapacity)) * 100)
          );

          return (
            <div
              key={counter.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between ${
                counter.isOverloaded
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <UtilizationRing pct={utilPct} status={counter.status} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-slate-800">{counter.name}</h4>
                        {counter.isOverloaded && (
                          <span
                            title="Counter is overloaded"
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-700 uppercase"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Overloaded
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{counter.specialization}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${style.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {counter.status}
                  </span>
                </div>

                {/* Utilization & Workload bars */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <BarChart3 className="w-3 h-3" /> Daily Utilization
                    </span>
                    <span className="font-bold text-slate-700">{utilPct}%</span>
                  </div>
                  <WorkloadBar pct={utilPct} isOverloaded={counter.isOverloaded} />

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="w-3 h-3" /> Queue Workload
                    </span>
                    <span className="font-bold text-slate-700">
                      {counter.workloadMinutes ?? 0} min
                    </span>
                  </div>
                  <WorkloadBar pct={workloadPct} isOverloaded={counter.isOverloaded} />
                </div>

                {/* Currently Serving */}
                <div className="my-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
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
                      Window idle — no active customer.
                    </div>
                  )}
                </div>

                {/* Supported Services */}
                <div className="mb-3">
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

                {/* Waiting queue for this counter */}
                {waitingForThis.length > 0 && (
                  <div className="mb-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                        Waiting ({waitingForThis.length})
                      </span>
                      {counter.isOverloaded && (
                        <span className="ml-auto text-[9px] font-bold text-rose-600 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> High load
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {waitingForThis.slice(0, 4).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-[11px] py-0.5"
                        >
                          <span className="font-bold text-slate-800">{t.tokenNumber}</span>
                          <span className="text-slate-600 truncate max-w-[100px] mx-2">
                            {t.customerName}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {(t.priority === 'VIP' ||
                              t.priority === 'Senior Citizen' ||
                              t.priority === 'Differently Abled') && (
                              <span title={t.priority}>
                                <Shield className="w-3 h-3 text-indigo-500" />
                              </span>
                            )}
                            <span className="text-blue-600 font-semibold">~{t.waitingTime}m</span>
                          </div>
                        </div>
                      ))}
                      {waitingForThis.length > 4 && (
                        <p className="text-[10px] text-slate-400 font-medium text-center pt-0.5">
                          +{waitingForThis.length - 4} more in line
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Waiting:</span>
                    <span
                      className={`font-bold ${
                        (counter.waitingCount ?? 0) > 4 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {counter.waitingCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Completed Today:</span>
                    <span className="font-bold text-slate-800">{counter.totalServed}</span>
                  </div>
                </div>
              </div>

              {/* Counter Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-2">
                {counter.status === 'On Break' ? (
                  <button
                    onClick={() => toggleCounterStatus(counter.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>End Break &amp; Resume</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => callNextWaiting(counter.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Call Next</span>
                    </button>
                    {counter.currentServingTokenId && (
                      <button
                        onClick={() => completeService(counter.currentServingTokenId!)}
                        className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all flex items-center gap-1"
                        title="Complete current service"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleCounterStatus(counter.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-all"
                      title="Put counter on break"
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

      {/* ── AI Allocation Rules Panel ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              Intelligent Allocation Rules
            </h4>
            <p className="text-[11px] text-slate-400">
              Guard-rails applied during every auto-assignment and optimisation run
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: <Shield className="w-4 h-4 text-indigo-600" />,
              bg: 'bg-indigo-50',
              title: 'Service Compatibility',
              desc: 'Customers are only routed to counters that explicitly support their requested service type.',
            },
            {
              icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
              bg: 'bg-rose-50',
              title: 'No Offline/Break Assignment',
              desc: 'Tokens are never assigned to counters on break, offline, or out of service.',
            },
            {
              icon: <RefreshCw className="w-4 h-4 text-emerald-600" />,
              bg: 'bg-emerald-50',
              title: 'No Duplicate Assignment',
              desc: 'Each waiting token is reassigned at most once per optimisation cycle — no double moves.',
            },
            {
              icon: <TrendingDown className="w-4 h-4 text-amber-600" />,
              bg: 'bg-amber-50',
              title: 'Priority Protection',
              desc: 'VIP and Differently Abled tokens are never moved to a higher-load counter during rebalancing.',
            },
          ].map((rule) => (
            <div
              key={rule.title}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${rule.bg}`}>
                {rule.icon}
              </div>
              <h5 className="font-bold text-xs text-slate-800">{rule.title}</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
