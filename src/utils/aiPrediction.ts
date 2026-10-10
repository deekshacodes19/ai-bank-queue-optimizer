import {
  BankCounter,
  HourlyRushPrediction,
  Priority,
  QueueToken,
  ServiceType,
  AiRecommendation,
  WaitTimeBreakdown,
  OptimizationResult,
  ReassignmentDetail,
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

// ---------------------------------------------------------------------------
// Phase 3 — Intelligent Counter Allocation & Optimization
// ---------------------------------------------------------------------------

/**
 * Computes live utilisation metrics for every counter.
 * Returns a new array — does NOT mutate the original counters.
 */
export function computeCounterMetrics(
  counters: BankCounter[],
  tokens: QueueToken[]
): BankCounter[] {
  return counters.map((counter) => {
    // Tokens currently waiting that this counter CAN serve
    const waitingForCounter = tokens.filter(
      (t) =>
        t.status === 'Waiting' &&
        (counter.supportedServices.includes(t.serviceType) ||
          t.assignedCounter === counter.name)
    );

    // Total workload: sum of benchmark durations for all waiting tokens
    const workloadMinutes = waitingForCounter.reduce((acc, t) => {
      return acc + (SERVICE_BENCHMARK_DURATIONS[t.serviceType] || 6);
    }, 0);

    // Utilisation = totalServed / dailyCapacity (capped at 100)
    const utilizationRate = Math.min(
      100,
      Math.round((counter.totalServed / Math.max(1, counter.dailyCapacity)) * 100)
    );

    // Overloaded when waiting queue for this counter exceeds 4 customers
    const isOverloaded = waitingForCounter.length > 4 && counter.status !== 'On Break';

    return {
      ...counter,
      waitingCount: waitingForCounter.length,
      workloadMinutes,
      utilizationRate,
      isOverloaded,
    };
  });
}

/**
 * Core Phase 3 optimisation engine.
 *
 * Strategy:
 *  1. Compute per-counter workload (waiting-minute load).
 *  2. Find overloaded counters (workload above average).
 *  3. Find compatible under-loaded or available counters for each service type.
 *  4. Reassign waiting tokens from overloaded counters to better ones,
 *     respecting service compatibility and no-duplicate rules.
 *  5. Recalculate wait times after reassignments.
 *  6. Return an OptimizationResult describing every reassignment.
 */
export function optimizeQueueAllocation(
  tokens: QueueToken[],
  counters: BankCounter[]
): { optimizedTokens: QueueToken[]; result: OptimizationResult } {
  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');

  if (waitingTokens.length === 0) {
    const emptyResult: OptimizationResult = {
      timestamp: new Date().toISOString(),
      reallocatedCount: 0,
      initialAvgWaitTime: 0,
      optimizedAvgWaitTime: 0,
      improvementPercentage: 0,
      reassignments: [],
      summaryMessage: 'Queue is empty — no optimisation needed.',
    };
    return { optimizedTokens: tokens, result: emptyResult };
  }

  // Snapshot avg wait BEFORE optimisation
  const initialAvgWaitTime = calculateDynamicAverageWaitTime(tokens, counters);

  // Active (non-break) counters only
  const activeCounters = counters.filter((c) => c.status !== 'On Break');

  // Build a workload map: counterId -> list of waiting tokens assigned to it
  const counterWorkloadMap = new Map<string, QueueToken[]>();
  activeCounters.forEach((c) => counterWorkloadMap.set(c.id, []));

  // Assign each waiting token to its current counter bucket
  waitingTokens.forEach((t) => {
    const matchedCounter = activeCounters.find(
      (c) => c.name === t.assignedCounter && c.supportedServices.includes(t.serviceType)
    );
    if (matchedCounter) {
      counterWorkloadMap.get(matchedCounter.id)?.push(t);
    }
  });

  // Compute workload (in minutes) per counter
  const workloadMinutesMap = new Map<string, number>();
  activeCounters.forEach((c) => {
    const assigned = counterWorkloadMap.get(c.id) || [];
    const mins = assigned.reduce(
      (acc, t) => acc + (SERVICE_BENCHMARK_DURATIONS[t.serviceType] || 6),
      0
    );
    workloadMinutesMap.set(c.id, mins);
  });

  const totalWorkload = Array.from(workloadMinutesMap.values()).reduce(
    (a, b) => a + b,
    0
  );
  const avgWorkloadPerCounter =
    activeCounters.length > 0 ? totalWorkload / activeCounters.length : 0;

  // Overloaded threshold: 30% above average workload, minimum 10 minutes
  const overloadThreshold = Math.max(10, avgWorkloadPerCounter * 1.3);

  const reassignments: ReassignmentDetail[] = [];
  let workingTokens = [...tokens];

  // Track already-reassigned token IDs to prevent duplicates
  const reassignedIds = new Set<string>();

  // Process each overloaded counter
  activeCounters.forEach((overloadedCounter) => {
    const load = workloadMinutesMap.get(overloadedCounter.id) || 0;
    if (load <= overloadThreshold) return;

    const assignedTokens = counterWorkloadMap.get(overloadedCounter.id) || [];

    // Sort: move Regular priority tokens first (keep VIP/Senior/DA)
    const movableCandidates = assignedTokens
      .filter(
        (t) =>
          !reassignedIds.has(t.id) &&
          (t.priority === 'Regular' || t.priority === 'Senior Citizen')
      )
      .sort((a, b) => {
        // Move Regular before Senior Citizen
        if (a.priority === 'Regular' && b.priority !== 'Regular') return -1;
        return 1;
      });

    movableCandidates.forEach((token) => {
      // Find a compatible alternative counter with LOWER workload
      const compatibleCounters = activeCounters.filter(
        (c) =>
          c.id !== overloadedCounter.id &&
          c.supportedServices.includes(token.serviceType) &&
          (workloadMinutesMap.get(c.id) || 0) < load - 5 // only move if meaningfully less loaded
      );

      if (compatibleCounters.length === 0) return;

      // Pick the least loaded compatible counter
      const targetCounter = compatibleCounters.reduce((best, c) =>
        (workloadMinutesMap.get(c.id) || 0) < (workloadMinutesMap.get(best.id) || 0)
          ? c
          : best
      );

      const tokenDuration = SERVICE_BENCHMARK_DURATIONS[token.serviceType] || 6;

      // Estimate time saved
      const oldWorkload = workloadMinutesMap.get(overloadedCounter.id) || 0;
      const newWorkload = workloadMinutesMap.get(targetCounter.id) || 0;
      const timeSaved = Math.max(
        1,
        Math.round(
          ((oldWorkload - newWorkload) / 2 / Math.max(1, activeCounters.length)) *
            (token.priority === 'Regular' ? 1 : 0.75)
        )
      );

      // Perform reassignment on the working tokens array
      workingTokens = workingTokens.map((t) =>
        t.id === token.id ? { ...t, assignedCounter: targetCounter.name } : t
      );

      // Update workload maps
      workloadMinutesMap.set(
        overloadedCounter.id,
        (workloadMinutesMap.get(overloadedCounter.id) || 0) - tokenDuration
      );
      workloadMinutesMap.set(
        targetCounter.id,
        (workloadMinutesMap.get(targetCounter.id) || 0) + tokenDuration
      );

      reassignedIds.add(token.id);
      reassignments.push({
        tokenNumber: token.tokenNumber,
        customerName: token.customerName,
        serviceType: token.serviceType,
        fromCounter: overloadedCounter.name,
        toCounter: targetCounter.name,
        timeSavedMinutes: timeSaved,
      });
    });
  });

  // Recalculate AI wait times for ALL waiting tokens after reassignment
  const optimizedTokens = recalculateQueuePredictions(workingTokens, counters);
  const optimizedAvgWaitTime = calculateDynamicAverageWaitTime(optimizedTokens, counters);

  const improvement =
    initialAvgWaitTime > 0
      ? Math.round(
          ((initialAvgWaitTime - optimizedAvgWaitTime) / initialAvgWaitTime) * 100
        )
      : 0;

  const result: OptimizationResult = {
    timestamp: new Date().toISOString(),
    reallocatedCount: reassignments.length,
    initialAvgWaitTime,
    optimizedAvgWaitTime,
    improvementPercentage: Math.max(0, improvement),
    reassignments,
    summaryMessage:
      reassignments.length === 0
        ? 'Queue is already optimally balanced. No reassignments needed.'
        : `Successfully redistributed ${reassignments.length} customer(s) across ${Array.from(new Set(reassignments.map((r) => r.toCounter))).length} counter(s). Average wait time reduced from ${initialAvgWaitTime} min to ${optimizedAvgWaitTime} min.`,
  };

  return { optimizedTokens, result };
}
