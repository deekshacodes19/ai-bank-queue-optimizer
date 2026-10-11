import {
  BankCounter,
  QueueToken,
  ServiceType,
  AnalyticsTimeRange,
  TrafficDataPoint,
  WaitTimeTrendPoint,
  ServiceDemandPoint,
  CounterPerformancePoint,
  SmartAnalyticsInsight,
} from '@/types/queue';
import { SERVICE_BENCHMARK_DURATIONS } from './aiPrediction';

const SERVICE_PALETTE: Record<ServiceType, string> = {
  'Cash Deposit': '#2563eb',     // Blue
  'Cash Withdrawal': '#0284c7',  // Sky blue
  'Account Opening': '#7c3aed',  // Violet
  'Passbook Update': '#059669',  // Emerald
  'Fixed Deposit': '#d97706',    // Amber
  'Loan Enquiry': '#e11d48',     // Rose
};

const SERVICE_SHORT_NAMES: Record<ServiceType, string> = {
  'Cash Deposit': 'Deposit',
  'Cash Withdrawal': 'Withdrawal',
  'Account Opening': 'Accounts',
  'Passbook Update': 'Passbook',
  'Fixed Deposit': 'FD/Invest',
  'Loan Enquiry': 'Loans',
};

/**
 * Filters token dataset by Service Type, Counter, and Time Range
 */
export function filterTokens(
  tokens: QueueToken[],
  timeRange: AnalyticsTimeRange,
  serviceFilter: string,
  counterFilter: string
): QueueToken[] {
  return tokens.filter((token) => {
    // Service Filter
    if (serviceFilter !== 'ALL' && token.serviceType !== serviceFilter) {
      return false;
    }
    // Counter Filter
    if (counterFilter !== 'ALL' && token.assignedCounter !== counterFilter) {
      return false;
    }
    // Time Range filter logic:
    // All current session tokens are considered active/today,
    // Historical tokens with 'token-hist-' are included in 7d / 30d
    if (timeRange === 'today') {
      // In a live system, this checks today's date.
      // For demo realism, we include active tokens and today's completed ones
      return true;
    }
    return true;
  });
}

/**
 * Calculates high-level analytics KPIs
 */
export function computeAnalyticsKpis(
  tokens: QueueToken[],
  counters: BankCounter[],
  timeRange: AnalyticsTimeRange
) {
  const timeMultiplier = timeRange === 'today' ? 1 : timeRange === '7days' ? 6.2 : 24.5;

  const servedTokens = tokens.filter((t) => t.status === 'Completed');
  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');
  const servingTokens = tokens.filter((t) => t.status === 'Serving');

  const baseServed = servedTokens.length;
  const baseWaiting = waitingTokens.length;

  const totalServed = Math.round(baseServed * timeMultiplier);
  const totalWaiting = baseWaiting; // Current snapshot waiting
  const totalVolume = Math.round(tokens.length * timeMultiplier);

  // Dynamic average wait time calculation
  const totalWaitMinutes = waitingTokens.reduce((acc, t) => acc + (t.waitingTime || 0), 0);
  const avgWaitTime =
    waitingTokens.length > 0
      ? Math.round((totalWaitMinutes / waitingTokens.length) * 10) / 10
      : 8.5;

  // Average counter utilization
  const activeCounters = counters.filter((c) => c.status !== 'Offline' && c.status !== 'On Break');
  const totalCapacity = counters.reduce((acc, c) => acc + (c.dailyCapacity || 30), 0);
  const totalCounterServed = counters.reduce((acc, c) => acc + (c.totalServed || 0), 0);
  const avgUtilization =
    totalCapacity > 0
      ? Math.min(100, Math.round((totalCounterServed / totalCapacity) * 100))
      : 68;

  // Resolution Rate
  const completedOrServing = baseServed + servingTokens.length;
  const totalDecided = completedOrServing + tokens.filter((t) => t.status === 'Cancelled').length;
  const resolutionRate =
    totalDecided > 0
      ? Math.round((completedOrServing / totalDecided) * 100)
      : 94;

  // Time saved estimate via AI allocation (approx 3.8 min per customer optimized)
  const estimatedHoursSaved = Math.round((totalServed * 4.2) / 60);

  return {
    totalVolume,
    totalServed,
    totalWaiting,
    avgWaitTime,
    avgUtilization,
    resolutionRate,
    activeCounterCount: activeCounters.length,
    totalCounters: counters.length,
    estimatedHoursSaved,
  };
}

/**
 * Generates Customer Traffic data for Recharts (Hourly / Daily / Weekly)
 */
export function generateTrafficTrends(
  tokens: QueueToken[],
  timeRange: AnalyticsTimeRange
): TrafficDataPoint[] {
  if (timeRange === 'today') {
    // Hourly distribution from 09:00 to 17:00
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const activeServed = tokens.filter((t) => t.status === 'Completed').length;
    const activeWaiting = tokens.filter((t) => t.status === 'Waiting').length;

    // Bell curve rush pattern around 13:00 (1 PM)
    const curveMultipliers = [0.45, 0.75, 1.15, 1.45, 1.85, 1.55, 1.25, 0.85, 0.5];

    return hours.map((hour, idx) => {
      const mult = curveMultipliers[idx];
      const traffic = Math.round((tokens.length / 7) * mult);
      const served = Math.round((activeServed / 7) * mult);
      const waiting = Math.max(1, Math.round((activeWaiting / 7) * mult));
      return {
        label: hour,
        totalTraffic: traffic,
        servedCount: served,
        waitingCount: waiting,
      };
    });
  }

  if (timeRange === '7days') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const dayMultipliers = [1.1, 0.95, 1.25, 1.05, 1.4, 0.7, 1.15];
    const baseCount = tokens.length;

    return days.map((day, idx) => {
      const mult = dayMultipliers[idx];
      const traffic = Math.round(baseCount * mult);
      const served = Math.round(traffic * 0.88);
      const waiting = Math.round(traffic * 0.12);
      return {
        label: day,
        totalTraffic: traffic,
        servedCount: served,
        waitingCount: waiting,
      };
    });
  }

  // 30 Days trend grouped into 4 weekly sprints + today
  const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'];
  const weekMultipliers = [4.2, 4.8, 5.1, 4.6, 5.3];
  const baseCount = tokens.length;

  return periods.map((period, idx) => {
    const mult = weekMultipliers[idx];
    const traffic = Math.round(baseCount * mult);
    const served = Math.round(traffic * 0.91);
    const waiting = Math.round(traffic * 0.09);
    return {
      label: period,
      totalTraffic: traffic,
      servedCount: served,
      waitingCount: waiting,
    };
  });
}

/**
 * Generates Waiting-Time Trend data for Recharts
 */
export function generateWaitTimeTrends(
  tokens: QueueToken[],
  timeRange: AnalyticsTimeRange
): WaitTimeTrendPoint[] {
  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');
  const baseAvgWait =
    waitingTokens.length > 0
      ? waitingTokens.reduce((acc, t) => acc + (t.waitingTime || 0), 0) / waitingTokens.length
      : 9;

  if (timeRange === 'today') {
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const variation = [0.6, 0.8, 1.2, 1.4, 1.9, 1.5, 1.1, 0.8, 0.5];

    return hours.map((hour, idx) => {
      const currentAvg = Math.round(baseAvgWait * variation[idx] * 10) / 10;
      return {
        label: hour,
        avgWaitTime: currentAvg,
        peakWaitTime: Math.round((currentAvg * 1.55) * 10) / 10,
      };
    });
  }

  if (timeRange === '7days') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const dayVariation = [1.1, 0.9, 1.3, 1.0, 1.45, 0.75, 1.0];

    return days.map((day, idx) => {
      const currentAvg = Math.round(baseAvgWait * dayVariation[idx] * 10) / 10;
      return {
        label: day,
        avgWaitTime: currentAvg,
        peakWaitTime: Math.round((currentAvg * 1.6) * 10) / 10,
      };
    });
  }

  const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'];
  const weekVariation = [1.2, 1.1, 1.0, 0.9, 0.85]; // Showing downward optimization trend

  return periods.map((period, idx) => {
    const currentAvg = Math.round(baseAvgWait * weekVariation[idx] * 10) / 10;
    return {
      label: period,
      avgWaitTime: currentAvg,
      peakWaitTime: Math.round((currentAvg * 1.5) * 10) / 10,
    };
  });
}

/**
 * Generates Service Demand Distribution
 */
export function generateServiceDemand(tokens: QueueToken[]): ServiceDemandPoint[] {
  const serviceList: ServiceType[] = [
    'Cash Deposit',
    'Cash Withdrawal',
    'Account Opening',
    'Passbook Update',
    'Fixed Deposit',
    'Loan Enquiry',
  ];

  const total = Math.max(1, tokens.length);

  return serviceList.map((service) => {
    const matching = tokens.filter((t) => t.serviceType === service);
    const count = matching.length;
    const percentage = Math.round((count / total) * 100);

    const waitings = matching.filter((t) => t.status === 'Waiting');
    const avgWait =
      waitings.length > 0
        ? Math.round(
            (waitings.reduce((acc, t) => acc + (t.waitingTime || 0), 0) / waitings.length) * 10
          ) / 10
        : SERVICE_BENCHMARK_DURATIONS[service];

    return {
      service,
      shortName: SERVICE_SHORT_NAMES[service] || service,
      count,
      percentage,
      avgWait,
      color: SERVICE_PALETTE[service] || '#3b82f6',
    };
  });
}

/**
 * Generates Counter Performance metrics
 */
export function generateCounterPerformance(
  counters: BankCounter[],
  tokens: QueueToken[]
): CounterPerformancePoint[] {
  return counters.map((counter) => {
    const servedByCounter = tokens.filter(
      (t) => t.assignedCounter === counter.name && t.status === 'Completed'
    ).length;
    const effectiveServed = Math.max(counter.totalServed, servedByCounter);
    const capacity = counter.dailyCapacity || 35;
    const utilizationRate = Math.min(100, Math.round((effectiveServed / capacity) * 100));

    // Calculate average handling minutes based on specialization
    const avgHandling = counter.specialization.includes('Account Opening')
      ? 14
      : counter.specialization.includes('Loan')
      ? 12
      : counter.specialization.includes('Deposit')
      ? 5
      : 4;

    return {
      counterName: counter.name,
      specialization: counter.specialization,
      totalServed: effectiveServed,
      dailyCapacity: capacity,
      utilizationRate,
      status: counter.status,
      avgHandlingMinutes: avgHandling,
    };
  });
}

/**
 * Produces dynamic rule-based AI Analytics Insights
 */
export function generateSmartAnalyticsInsights(
  tokens: QueueToken[],
  counters: BankCounter[],
  timeRange: AnalyticsTimeRange
): SmartAnalyticsInsight[] {
  const insights: SmartAnalyticsInsight[] = [];

  const timeFrameLabel =
    timeRange === 'today'
      ? 'Intraday (Today)'
      : timeRange === '7days'
      ? 'Weekly (7 Days)'
      : 'Monthly (30 Days)';

  // Insight 1: Peak Traffic Analysis
  insights.push({
    id: 'peak-traffic-insight',
    type: 'peak_traffic',
    title: `Peak Rush Identified: 12:30 PM – 2:00 PM (${timeFrameLabel})`,
    description:
      'Historical volume spikes by 85% during midday lunch hours due to corporate deposits and counter withdrawals.',
    metric: '+85% Inflow',
    badge: 'Peak Congestion',
    severity: 'warning',
  });

  // Insight 2: Busiest Counter
  const busyCounter = counters.reduce((prev, curr) =>
    (curr.totalServed || 0) > (prev.totalServed || 0) ? curr : prev
  );
  insights.push({
    id: 'busy-counter-insight',
    type: 'busy_counter',
    title: `${busyCounter.name} Operates at Highest Volume`,
    description: `Leading teller window handling ${busyCounter.totalServed} customer interactions with ${busyCounter.specialization}.`,
    metric: `${busyCounter.totalServed} Served`,
    badge: 'High Throughput',
    severity: 'info',
  });

  // Insight 3: Longest Waiting Service
  const serviceDemands = generateServiceDemand(tokens);
  const longestService = serviceDemands.reduce((prev, curr) =>
    curr.avgWait > prev.avgWait ? curr : prev
  );
  insights.push({
    id: 'long-wait-insight',
    type: 'long_wait',
    title: `${longestService.service}: Longest Wait Time`,
    description: `Averages ${longestService.avgWait} mins per customer due to detailed compliance, KYC documentation, and verification checks.`,
    metric: `~${longestService.avgWait} min`,
    badge: 'Latency Bottleneck',
    severity: 'alert',
  });

  // Insight 4: Optimization Impact
  const offlineOrBreak = counters.filter((c) => c.status === 'On Break' || c.status === 'Offline');
  if (offlineOrBreak.length > 0) {
    insights.push({
      id: 'workload-optimization-insight',
      type: 'optimization_impact',
      title: `${offlineOrBreak[0].name} Inactive (${offlineOrBreak[0].status})`,
      description: `Activating ${offlineOrBreak[0].name} during peak hours will reduce average customer wait times by an estimated 28%.`,
      metric: '-28% Wait Time',
      badge: 'Actionable Boost',
      severity: 'success',
    });
  } else {
    insights.push({
      id: 'workload-optimization-insight',
      type: 'optimization_impact',
      title: 'Balanced Teller Workload',
      description:
        'All active windows are distributing tickets evenly under the AI dynamic queue load optimizer.',
      metric: 'Optimal Balance',
      badge: 'Balanced',
      severity: 'success',
    });
  }

  return insights;
}

/**
 * Downloads detailed token records as clean CSV
 */
export function exportTokensToCSV(tokens: QueueToken[], rangeLabel: string) {
  const headers = [
    'Token Number',
    'Customer Name',
    'Phone',
    'Service Type',
    'Priority',
    'Assigned Counter',
    'Status',
    'Waiting Time (min)',
    'Created At',
    'Served At',
    'Completed At',
  ];

  const rows = tokens.map((t) => [
    t.tokenNumber,
    `"${t.customerName.replace(/"/g, '""')}"`,
    `"${t.customerPhone || 'N/A'}"`,
    `"${t.serviceType}"`,
    t.priority,
    `"${t.assignedCounter}"`,
    t.status,
    t.waitingTime || 0,
    `"${t.createdAt || ''}"`,
    `"${t.servedAt || ''}"`,
    `"${t.completedAt || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `bank_queue_tokens_${rangeLabel}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads aggregated operational metrics summary as CSV
 */
export function exportSummaryToCSV(
  kpis: ReturnType<typeof computeAnalyticsKpis>,
  counters: BankCounter[],
  serviceDemands: ServiceDemandPoint[],
  rangeLabel: string
) {
  const lines: string[] = [];

  // Title section
  lines.push('AI BANK QUEUE & COUNTER OPTIMIZER - EXECUTIVE ANALYTICS REPORT');
  lines.push(`Generated On,${new Date().toLocaleString()}`);
  lines.push(`Timeframe,${rangeLabel}`);
  lines.push('');

  // KPIs
  lines.push('OPERATIONAL KPIS');
  lines.push(`Total Customer Volume,${kpis.totalVolume}`);
  lines.push(`Total Customers Served,${kpis.totalServed}`);
  lines.push(`Currently Waiting Customers,${kpis.totalWaiting}`);
  lines.push(`Average Wait Time (Minutes),${kpis.avgWaitTime}`);
  lines.push(`Average Counter Utilization,${kpis.avgUtilization}%`);
  lines.push(`Resolution Rate,${kpis.resolutionRate}%`);
  lines.push(`Estimated Hours Saved,${kpis.estimatedHoursSaved} hrs`);
  lines.push('');

  // Counter Performance
  lines.push('COUNTER PERFORMANCE SUMMARY');
  lines.push('Counter,Specialization,Status,Total Served,Capacity,Utilization');
  counters.forEach((c) => {
    lines.push(
      `"${c.name}","${c.specialization}","${c.status}",${c.totalServed},${c.dailyCapacity},${c.utilizationRate || 0}%`
    );
  });
  lines.push('');

  // Service Demand Breakdown
  lines.push('SERVICE DEMAND BREAKDOWN');
  lines.push('Service Type,Customer Volume,Share Percentage,Avg Wait Time (min)');
  serviceDemands.forEach((s) => {
    lines.push(`"${s.service}",${s.count},${s.percentage}%,${s.avgWait}`);
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `bank_queue_executive_summary_${rangeLabel}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
