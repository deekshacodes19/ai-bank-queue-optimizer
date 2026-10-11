export type ServiceType =
  | 'Account Opening'
  | 'Cash Deposit'
  | 'Cash Withdrawal'
  | 'Passbook Update'
  | 'Fixed Deposit'
  | 'Loan Enquiry';

export type QueueStatus = 'Waiting' | 'Serving' | 'Completed' | 'Cancelled';

export type Priority = 'Regular' | 'VIP' | 'Senior Citizen' | 'Differently Abled';

export interface WaitTimeBreakdown {
  serviceDuration: number;
  queuePositionAhead: number;
  activeServerCount: number;
  priorityAdjustmentMinutes: number;
  estimatedMinutes: number;
}

export interface QueueToken {
  id: string;
  tokenNumber: string;
  customerName: string;
  customerPhone?: string;
  serviceType: ServiceType;
  priority: Priority;
  assignedCounter: string;
  status: QueueStatus;
  waitingTime: number; // in minutes (AI calculated)
  waitTimeBreakdown?: WaitTimeBreakdown;
  createdAt: string;
  servedAt?: string;
  completedAt?: string;
  notes?: string;
}

export type CounterStatus =
  | 'Available'
  | 'Serving'
  | 'Busy'
  | 'Offline'
  | 'In Service'
  | 'On Break';

export interface BankCounter {
  id: string;
  name: string; // e.g. "Counter 1"
  specialization: string; // e.g. "Cash Deposit & Withdrawal"
  supportedServices: ServiceType[];
  status: CounterStatus;
  currentServingTokenId?: string;
  currentServingTokenNumber?: string;
  totalServed: number;
  dailyCapacity: number;
  utilizationRate?: number; // 0 to 100%
  isOverloaded?: boolean;
  waitingCount?: number;
  workloadMinutes?: number;
}

export interface DashboardKPIs {
  totalCustomers: number;
  waitingCustomers: number;
  avgWaitingTime: number; // in minutes
  activeCounters: string; // e.g. "4 / 5"
  countersOnBreak: number;
  branchName: string;
  workingHours: string;
  isOpen: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export type NavTab =
  | 'dashboard'
  | 'queue'
  | 'counters'
  | 'predictions'
  | 'reports'
  | 'settings';

export type TrafficLevel = 'Low' | 'Moderate' | 'Busy' | 'Peak';

export interface HourlyRushPrediction {
  hour: string;
  timeLabel: string;
  predicted: number;
  actual: number;
  trafficLevel: TrafficLevel;
  isPeak?: boolean;
  congestionIndex: number;
}

export interface AiRecommendation {
  id: string;
  type: 'counter_open' | 'congestion_alert' | 'service_routing' | 'efficiency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reason: string;
  projectedImpact: string;
  actionLabel?: string;
  actionCounterId?: string;
}

export interface ReassignmentDetail {
  tokenNumber: string;
  customerName: string;
  serviceType: ServiceType;
  fromCounter: string;
  toCounter: string;
  timeSavedMinutes: number;
}

export interface OptimizationResult {
  timestamp: string;
  reallocatedCount: number;
  initialAvgWaitTime: number;
  optimizedAvgWaitTime: number;
  improvementPercentage: number;
  reassignments: ReassignmentDetail[];
  summaryMessage: string;
}

// Phase 4: Analytics & Reports Types
export type AnalyticsTimeRange = 'today' | '7days' | '30days';

export interface TrafficDataPoint {
  label: string;
  totalTraffic: number;
  servedCount: number;
  waitingCount: number;
}

export interface WaitTimeTrendPoint {
  label: string;
  avgWaitTime: number;
  peakWaitTime: number;
}

export interface ServiceDemandPoint {
  service: ServiceType;
  shortName: string;
  count: number;
  percentage: number;
  avgWait: number;
  color: string;
}

export interface CounterPerformancePoint {
  counterName: string;
  specialization: string;
  totalServed: number;
  dailyCapacity: number;
  utilizationRate: number;
  status: CounterStatus;
  avgHandlingMinutes: number;
}

export interface SmartAnalyticsInsight {
  id: string;
  type: 'peak_traffic' | 'busy_counter' | 'long_wait' | 'optimization_impact';
  title: string;
  description: string;
  metric: string;
  badge: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
}

