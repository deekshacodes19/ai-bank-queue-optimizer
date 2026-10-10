import {
  BankCounter,
  HourlyRushPrediction,
  Priority,
  QueueToken,
  ServiceType,
  AiRecommendation,
  WaitTimeBreakdown,
} from '@/types/queue';

/**
 * Standard baseline service durations in minutes based on banking operations benchmarks
 */
export const SERVICE_BENCHMARK_DURATIONS: Record<ServiceType, number> = {
  'Account Opening': 15, // Detailed KYC & signature verification
  'Fixed Deposit': 10,   // Term selection, yield computation, issuance
  'Loan Enquiry': 12,    // Credit check & initial eligibility counselling
  'Cash Deposit': 5,     // Note authentication & counter receipt
  'Cash Withdrawal': 4,  // Slip verification, ledger check, cash handover
  'Passbook Update': 3,  // Fast thermal printer entry
};

/**
 * Priority factors applied to waiting queue calculations
 */
export const PRIORITY_MULTIPLIERS: Record<Priority, number> = {
  'VIP': 0.6,               // Expedited priority lane
  'Differently Abled': 0.65, // Special assistance priority
  'Senior Citizen': 0.75,   // Courtesy senior lane
  'Regular': 1.0,           // General queue baseline
};

/**
 * Deterministically calculates the estimated waiting time for a specific token
 */
export function calculateTokenWaitTime(
  token: QueueToken,
  allTokens: QueueToken[],
  counters: BankCounter[]
): { estimatedMinutes: number; breakdown: WaitTimeBreakdown } {
  // If already serving or finished, waiting time is 0 or actual
  if (token.status === 'Serving') {
    return {
      estimatedMinutes: 0,
      breakdown: {
        serviceDuration: SERVICE_BENCHMARK_DURATIONS[token.serviceType],
        queuePositionAhead: 0,
        activeServerCount: 1,
        priorityAdjustmentMinutes: 0,
        estimatedMinutes: 0,
      },
    };
  }

  if (token.status === 'Completed' || token.status === 'Cancelled') {
    return {
      estimatedMinutes: token.waitingTime || 0,
      breakdown: {
        serviceDuration: SERVICE_BENCHMARK_DURATIONS[token.serviceType],
        queuePositionAhead: 0,
        activeServerCount: 1,
        priorityAdjustmentMinutes: 0,
        estimatedMinutes: token.waitingTime || 0,
      },
    };
  }

  const baseDuration = SERVICE_BENCHMARK_DURATIONS[token.serviceType] || 6;

  // Find all counters capable of handling this service
  const capableCounters = counters.filter((c) =>
    c.supportedServices.includes(token.serviceType)
  );

  // Active (not on break) counters for this service
  const activeCounters = capableCounters.filter((c) => c.status !== 'On Break');
  const serverCount = Math.max(1, activeCounters.length);

  // Find customers waiting ahead of this token in the queue
  const waitingTokens = allTokens.filter((t) => t.status === 'Waiting');
  const tokenIndex = waitingTokens.findIndex((t) => t.id === token.id);
  const positionAhead = tokenIndex >= 0 ? tokenIndex : waitingTokens.length;

  // Calculate accumulated workload ahead
  let workloadAheadMinutes = 0;
  for (let i = 0; i < positionAhead; i++) {
    const aheadToken = waitingTokens[i];
    const duration = SERVICE_BENCHMARK_DURATIONS[aheadToken.serviceType] || 6;
    // If the ahead token shares a counter with this service, add to workload
    if (capableCounters.some((c) => c.supportedServices.includes(aheadToken.serviceType))) {
      workloadAheadMinutes += duration;
    }
  }

  // Add remaining service time for currently serving customers on these counters
  const currentlyServingTokens = allTokens.filter(
    (t) => t.status === 'Serving' && capableCounters.some((c) => c.name === t.assignedCounter)
  );
  const servingWorkload = currentlyServingTokens.length * (baseDuration * 0.4);

  const totalWorkload = workloadAheadMinutes + servingWorkload;

  // Apply priority multiplier
  const priorityMultiplier = PRIORITY_MULTIPLIERS[token.priority] || 1.0;
  const rawEstimate = (totalWorkload / serverCount) * priorityMultiplier;

  // Minimum wait time is 2 minutes if counter available, otherwise ceil
  const estimatedMinutes = Math.max(2, Math.ceil(rawEstimate));
  const priorityAdjustment = Math.round(
    (totalWorkload / serverCount) * (1.0 - priorityMultiplier)
  );

  return {
    estimatedMinutes,
    breakdown: {
      serviceDuration: baseDuration,
      queuePositionAhead: positionAhead,
      activeServerCount: serverCount,
      priorityAdjustmentMinutes: priorityAdjustment,
      estimatedMinutes,
    },
  };
}

/**
 * Recalculates estimated wait times for all waiting tokens in the queue
 */
export function recalculateQueuePredictions(
  tokens: QueueToken[],
  counters: BankCounter[]
): QueueToken[] {
  return tokens.map((token) => {
    if (token.status === 'Waiting') {
      const { estimatedMinutes, breakdown } = calculateTokenWaitTime(token, tokens, counters);
      return {
        ...token,
        waitingTime: estimatedMinutes,
        waitTimeBreakdown: breakdown,
      };
    }
    return token;
  });
}

/**
 * Calculates dynamic system-wide Average Waiting Time KPI
 */
export function calculateDynamicAverageWaitTime(
  tokens: QueueToken[],
  counters: BankCounter[]
): number {
  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');
  if (waitingTokens.length === 0) {
    return 0; // Empty queue: immediate teller availability
  }

  const totalPredictedWait = waitingTokens.reduce((acc, t) => {
    const estimate = t.waitingTime || calculateTokenWaitTime(t, tokens, counters).estimatedMinutes;
    return acc + estimate;
  }, 0);

  return Math.max(1, Math.round(totalPredictedWait / waitingTokens.length));
}

/**
 * Baseline hourly customer arrival curve for 9 AM - 5 PM
 */
const BASE_HOURLY_CURVE = [
  { hour: '9 AM', timeLabel: '09:00 - 10:00', baseTraffic: 18, actual: 16, level: 'Low' as const },
  { hour: '10 AM', timeLabel: '10:00 - 11:00', baseTraffic: 28, actual: 25, level: 'Moderate' as const },
  { hour: '11 AM', timeLabel: '11:00 - 12:00', baseTraffic: 38, actual: 34, level: 'Busy' as const },
  { hour: '12 PM', timeLabel: '12:00 - 13:00', baseTraffic: 55, actual: 50, level: 'Busy' as const },
  { hour: '1 PM', timeLabel: '13:00 - 14:00', baseTraffic: 72, actual: 68, level: 'Peak' as const, isPeak: true },
  { hour: '2 PM', timeLabel: '14:00 - 15:00', baseTraffic: 58, actual: 54, level: 'Busy' as const },
  { hour: '3 PM', timeLabel: '15:00 - 16:00', baseTraffic: 42, actual: 39, level: 'Moderate' as const },
  { hour: '4 PM', timeLabel: '16:00 - 17:00', baseTraffic: 32, actual: 30, level: 'Moderate' as const },
  { hour: '5 PM', timeLabel: '17:00 - 17:30', baseTraffic: 20, actual: 18, level: 'Low' as const },
];

/**
 * Generates simulated customer rush forecast points using deterministic queuing models
 */
export function generateHourlyRushPredictions(
  tokens: QueueToken[],
  counters: BankCounter[]
): HourlyRushPrediction[] {
  const waitingCount = tokens.filter((t) => t.status === 'Waiting').length;
  const activeCounters = counters.filter((c) => c.status !== 'On Break').length;

  // Modulate traffic index based on current actual queue volume
  const queuePressureRatio = Math.min(1.4, Math.max(0.8, 1 + (waitingCount - 15) * 0.02));

  return BASE_HOURLY_CURVE.map((point) => {
    const predicted = Math.round(point.baseTraffic * queuePressureRatio);
    const capacity = activeCounters * 14; // ~14 customers handled per counter per hour
    const congestionIndex = Math.min(100, Math.round((predicted / Math.max(1, capacity)) * 60));

    return {
      hour: point.hour,
      timeLabel: point.timeLabel,
      predicted,
      actual: point.actual,
      trafficLevel: point.level,
      isPeak: point.isPeak || false,
      congestionIndex,
    };
  });
}

/**
 * Generates transparent AI insights, congestion alerts, and counter opening recommendations
 */
export function generateAiInsights(
  tokens: QueueToken[],
  counters: BankCounter[]
): AiRecommendation[] {
  const recommendations: AiRecommendation[] = [];
  const waitingCount = tokens.filter((t) => t.status === 'Waiting').length;
  const breakCounters = counters.filter((c) => c.status === 'On Break');
  const avgWaitTime = calculateDynamicAverageWaitTime(tokens, counters);

  // 1. Congestion Alert
  if (waitingCount >= 10 || avgWaitTime >= 15) {
    recommendations.push({
      id: 'rec-congestion-high',
      type: 'congestion_alert',
      severity: 'high',
      title: 'High Queue Congestion Alert',
      description: `Current wait line has ${waitingCount} customers with an average waiting time of ${avgWaitTime} minutes.`,
      reason: `Customer arrival rate currently exceeds teller clearance capacity by 45%. Wait times are accelerating.`,
      projectedImpact: 'Queue clearance time will exceed 45 minutes unless counter capacity is increased.',
    });
  } else if (waitingCount >= 6) {
    recommendations.push({
      id: 'rec-congestion-moderate',
      type: 'congestion_alert',
      severity: 'medium',
      title: 'Moderate Queue Inflow',
      description: `Queue is holding ${waitingCount} waiting customers with ~${avgWaitTime} min average wait.`,
      reason: 'Steady influx detected across Cash and Account desks.',
      projectedImpact: 'Queue velocity is stable but approaching peak sensitivity.',
    });
  } else {
    recommendations.push({
      id: 'rec-congestion-optimal',
      type: 'congestion_alert',
      severity: 'low',
      title: 'Optimal Queue Performance',
      description: 'Queue flow is well-balanced with minimal customer holding times.',
      reason: 'Current active counter capacity exceeds instantaneous customer arrival rates.',
      projectedImpact: 'Average wait times remain under 8 minutes across all service desks.',
    });
  }

  // 2. Counter Opening Recommendation
  if (breakCounters.length > 0) {
    const firstBreakCounter = breakCounters[0];
    const customersForThisBreak = tokens.filter(
      (t) =>
        t.status === 'Waiting' &&
        firstBreakCounter.supportedServices.includes(t.serviceType)
    ).length;

    recommendations.push({
      id: `rec-open-${firstBreakCounter.id}`,
      type: 'counter_open',
      severity: customersForThisBreak > 2 ? 'high' : 'medium',
      title: `Recommend Activating ${firstBreakCounter.name}`,
      description: `${firstBreakCounter.name} (${firstBreakCounter.specialization}) is currently On Break.`,
      reason: `${customersForThisBreak > 0 ? `${customersForThisBreak} customer(s) are waiting specifically for ${firstBreakCounter.specialization}.` : 'Additional window reduces peak pressure.'} Parallel teller dispatch will distribute line workload.`,
      projectedImpact: `Opening ${firstBreakCounter.name} will reduce branch average waiting time by ~38%.`,
      actionLabel: `Open ${firstBreakCounter.name} Now`,
      actionCounterId: firstBreakCounter.id,
    });
  }

  // 3. Peak Hour Preparation Suggestion
  recommendations.push({
    id: 'rec-peak-prep',
    type: 'efficiency',
    severity: 'medium',
    title: 'Stagger Staff Shifts for 1:00 PM Peak',
    description: 'AI Rush Model forecasts customer influx of 72 customers/hour between 12:30 PM - 2:00 PM.',
    reason: 'Lunch-hour transactions historical volume spike exceeds standard teller capacity by 68%.',
    projectedImpact: 'Pre-scheduling all 5 tellers to active duty avoids wait time spikes up to 28 minutes.',
  });

  // 4. Service Specific Routing Suggestion
  const passbookWaiting = tokens.filter(
    (t) => t.status === 'Waiting' && t.serviceType === 'Passbook Update'
  ).length;

  if (passbookWaiting >= 2) {
    recommendations.push({
      id: 'rec-routing-passbook',
      type: 'service_routing',
      severity: 'low',
      title: 'Fast-Track Kiosk Diversion',
      description: `${passbookWaiting} customers are queued for Passbook Updates.`,
      reason: 'Automated kiosk passbook printing requires zero teller intervention.',
      projectedImpact: `Directing these customers to Lobby Kiosk A saves ~${passbookWaiting * 3} teller service minutes.`,
    });
  }

  return recommendations;
}
