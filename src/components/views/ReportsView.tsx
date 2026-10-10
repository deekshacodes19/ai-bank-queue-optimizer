'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { useQueue } from '@/context/QueueContext';
import {
  AnalyticsTimeRange,
  ServiceType,
} from '@/types/queue';
import {
  filterTokens,
  computeAnalyticsKpis,
  generateTrafficTrends,
  generateWaitTimeTrends,
  generateServiceDemand,
  generateCounterPerformance,
  generateSmartAnalyticsInsights,
  exportTokensToCSV,
  exportSummaryToCSV,
} from '@/utils/analytics';

const SERVICE_OPTIONS: Array<'ALL' | ServiceType> = [
  'ALL',
  'Cash Deposit',
  'Cash Withdrawal',
  'Account Opening',
  'Passbook Update',
  'Fixed Deposit',
  'Loan Enquiry',
];

export default function ReportsView() {
  const { tokens, counters, addToast } = useQueue();
  const [isMounted, setIsMounted] = useState(false);

  // Filters State
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('today');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedCounter, setSelectedCounter] = useState<string>('ALL');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered dataset
  const filteredTokens = useMemo(() => {
    return filterTokens(tokens, timeRange, selectedService, selectedCounter);
  }, [tokens, timeRange, selectedService, selectedCounter]);

  // Dynamically computed metrics & chart datasets
  const kpis = useMemo(() => {
    return computeAnalyticsKpis(filteredTokens, counters, timeRange);
  }, [filteredTokens, counters, timeRange]);

  const trafficData = useMemo(() => {
    return generateTrafficTrends(filteredTokens, timeRange);
  }, [filteredTokens, timeRange]);

  const waitTimeData = useMemo(() => {
    return generateWaitTimeTrends(filteredTokens, timeRange);
  }, [filteredTokens, timeRange]);

  const serviceDemandData = useMemo(() => {
    return generateServiceDemand(filteredTokens);
  }, [filteredTokens]);

  const counterPerfData = useMemo(() => {
    return generateCounterPerformance(counters, filteredTokens);
  }, [counters, filteredTokens]);

  const smartInsights = useMemo(() => {
    return generateSmartAnalyticsInsights(filteredTokens, counters, timeRange);
  }, [filteredTokens, counters, timeRange]);

  const hasActiveFilters = selectedService !== 'ALL' || selectedCounter !== 'ALL';

  const resetFilters = () => {
    setSelectedService('ALL');
    setSelectedCounter('ALL');
    addToast('info', 'Filters Cleared', 'Reset all operational filters to default.');
  };

  // CSV Export Handlers
  const handleExportDetailedCSV = () => {
    exportTokensToCSV(filteredTokens, timeRange);
    setIsExportMenuOpen(false);
    addToast(
      'success',
      'Detailed CSV Exported',
      `Exported ${filteredTokens.length} token record(s) for ${timeRange.toUpperCase()}.`
    );
  };

  const handleExportSummaryCSV = () => {
    exportSummaryToCSV(kpis, counters, serviceDemandData, timeRange);
    setIsExportMenuOpen(false);
    addToast(
      'success',
      'Summary Report Exported',
      `Executive operational audit report exported as CSV.`
    );
  };

  interface TooltipEntry {
    color?: string;
    name?: string;
    value?: string | number;
    unit?: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
  }

  // Chart Tooltips with Navy Banking theme
  const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a1838] text-white p-3 rounded-xl shadow-xl border border-blue-500/30 text-xs min-w-[170px]">
          <p className="font-bold text-slate-200 mb-1.5 pb-1 border-b border-blue-900/50">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: TooltipEntry, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value}
                  {entry.unit ? ` ${entry.unit}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Control Deck */}
      <div className="bg-gradient-to-r from-[#0a1838] via-[#102350] to-[#1a3880] rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-[#38bdf8] border border-blue-400/30">
              Phase 4: Analytics & Reports
            </span>
            <span className="text-xs text-slate-300">• Multi-Metric Telemetry Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Queue Intelligence & Analytics Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor real-time customer traffic, teller workload utilization, queue wait times, and
            service demand distributions with instant CSV audit exports.
          </p>
        </div>

        {/* Action Controls: Time Range + CSV Export */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Timeframe Switcher */}
          <div className="bg-white/10 p-1 rounded-2xl flex items-center border border-white/15 backdrop-blur-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === 'today'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '7days'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '30days'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* CSV Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Export Reports</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-40 text-slate-800 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Export Formats (CSV)
                    </span>
                  </div>

                  <button
                    onClick={handleExportDetailedCSV}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Detailed Queue Tokens</div>
                      <div className="text-[10px] text-slate-500">
                        All customer tokens, timestamps, and service logs
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportSummaryCSV}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Executive Summary Audit</div>
                      <div className="text-[10px] text-slate-500">
                        KPI metrics, counter utilization, and service split
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-1">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Data:</span>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Services</option>
              {SERVICE_OPTIONS.filter((s) => s !== 'ALL').map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Counter Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Counter:</span>
            <select
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Counters</option>
              {counters.map((cnt) => (
                <option key={cnt.id} value={cnt.name}>
                  {cnt.name} ({cnt.specialization.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filtered Count Indicator */}
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Analyzing{' '}
            <strong className="text-slate-800 font-bold">{filteredTokens.length}</strong> of{' '}
            <strong className="text-slate-800 font-bold">{tokens.length}</strong> total active
            records
          </span>
        </div>
      </div>

      {/* Operational KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers Served */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Served
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
              {kpis.totalServed}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {kpis.resolutionRate}% Resolved
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Volume in period:</span>
            <strong className="text-slate-700">{kpis.totalVolume} customers</strong>
          </p>
        </div>

        {/* Card 2: Waiting Customers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Waiting in Line
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
              {kpis.totalWaiting}
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Active Queue
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Currently Serving:</span>
            <strong className="text-slate-700">
              {filteredTokens.filter((t) => t.status === 'Serving').length} tickets
            </strong>
          </p>
        </div>

        {/* Card 3: Average Waiting Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Waiting Time
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
              {kpis.avgWaitTime}
              <span className="text-base font-semibold text-slate-500 ml-1">min</span>
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Target &lt; 12m
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Estimated Saved Time:</span>
            <strong className="text-emerald-600 font-bold">+{kpis.estimatedHoursSaved} hrs</strong>
          </p>
        </div>

        {/* Card 4: Counter Utilization */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Counter Utilization
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0a1838]">
              {kpis.avgUtilization}%
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                kpis.avgUtilization > 80
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {kpis.avgUtilization > 80 ? 'Heavy Load' : 'Healthy Load'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Active Tellers:</span>
            <strong className="text-slate-700">
              {kpis.activeCounterCount} of {kpis.totalCounters} windows
            </strong>
          </p>
        </div>
      </div>

      {/* Row 1 Charts: Customer Traffic & Waiting Time Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Customer Traffic Volume & Throughput */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Customer Traffic & Served Volume
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of overall customer influx versus successfully processed tickets
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
              {timeRange.toUpperCase()} View
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trafficData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorServed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalTraffic"
                    name="Total Traffic"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTraffic)"
                  />
                  <Area
                    type="monotone"
                    dataKey="servedCount"
                    name="Completed"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorServed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading Traffic Chart...
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Waiting-Time Trajectory */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Waiting-Time Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Average vs. Peak queue wait durations in minutes
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={waitTimeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}m`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgWaitTime"
                    name="Avg Wait Time"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ fill: '#4f46e5', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peakWaitTime"
                    name="Peak Spike"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ fill: '#f59e0b', r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading Wait Time Chart...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Service Demand & Counter Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Service Demand Distribution */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Service Demand Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ticket volume across banking service categories
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceDemandData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="count" name="Customers" radius={[6, 6, 0, 0]}>
                    {serviceDemandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading Service Demand...
              </div>
            )}
          </div>

          {/* Service Legend Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
            {serviceDemandData.map((srv) => (
              <div key={srv.service} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: srv.color }}
                  />
                  {srv.shortName}
                </span>
                <span className="font-bold text-slate-800 shrink-0 ml-1">
                  {srv.count} ({srv.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Counter Performance & Workload */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Teller Window Performance & Capacity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Served customer volume relative to rated daily capacity
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={counterPerfData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="counterName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                  />
                  <Bar
                    dataKey="totalServed"
                    name="Customers Served"
                    fill="#1d4ed8"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="dailyCapacity"
                    name="Daily Capacity"
                    fill="#cbd5e1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading Counter Chart...
              </div>
            )}
          </div>

          {/* Utilization meters */}
          <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
            {counterPerfData.map((counter) => (
              <div key={counter.counterName} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 w-24 truncate">
                  {counter.counterName}
                </span>
                <div className="flex-1 mx-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      counter.utilizationRate >= 80
                        ? 'bg-rose-500'
                        : counter.utilizationRate >= 60
                        ? 'bg-blue-600'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, counter.utilizationRate)}%` }}
                  />
                </div>
                <span className="font-bold text-slate-700 w-12 text-right">
                  {counter.utilizationRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Operational Insights (AI Rule-Based) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Smart Operations & Bottleneck Intelligence
            </h3>
            <p className="text-xs text-slate-400">
              Automated analytical findings derived from current queue arrival distribution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {smartInsights.map((insight) => {
            const badgeStyles =
              insight.severity === 'alert'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : insight.severity === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : insight.severity === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200';

            return (
              <div
                key={insight.id}
                className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyles}`}
                    >
                      {insight.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{insight.metric}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mb-1 leading-snug">
                    {insight.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log Preview & Export CTA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Queue Token Audit Preview ({filteredTokens.length} records)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live snapshot of customer token sessions matching active filters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDetailedCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Token</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Service</th>
                <th className="py-2.5 px-4">Counter</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Wait Time</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTokens.slice(0, 15).map((token) => (
                <tr key={token.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#0a1838]">
                    {token.tokenNumber}
                  </td>
                  <td className="py-2.5 px-4 font-medium">{token.customerName}</td>
                  <td className="py-2.5 px-4 text-slate-600">{token.serviceType}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-700">
                    {token.assignedCounter}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        token.priority === 'VIP'
                          ? 'bg-amber-100 text-amber-800'
                          : token.priority === 'Senior Citizen'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {token.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {token.waitingTime}m
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        token.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : token.status === 'Serving'
                          ? 'bg-blue-100 text-blue-800'
                          : token.status === 'Waiting'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {token.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTokens.length > 15 && (
          <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center text-xs text-slate-500">
            Showing first 15 of {filteredTokens.length} tokens. Click &quot;Download CSV&quot; for complete audit dataset.
          </div>
        )}
      </div>
    </div>
  );
}
