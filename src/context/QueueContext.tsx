'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BankCounter,
  DashboardKPIs,
  NavTab,
  Priority,
  QueueStatus,
  QueueToken,
  ServiceType,
  ToastNotification,
  HourlyRushPrediction,
  AiRecommendation,
  OptimizationResult,
} from '@/types/queue';
import { INITIAL_COUNTERS, INITIAL_TOKENS } from '@/data/mockData';
import {
  calculateTokenWaitTime,
  calculateDynamicAverageWaitTime,
  generateHourlyRushPredictions,
  generateAiInsights,
  recalculateQueuePredictions,
  computeCounterMetrics,
  optimizeQueueAllocation,
} from '@/utils/aiPrediction';

const TOKENS_STORAGE_KEY = 'bankqueue_tokens_v2';
const COUNTERS_STORAGE_KEY = 'bankqueue_counters_v2';

interface QueueContextType {
  tokens: QueueToken[];
  counters: BankCounter[];
  enrichedCounters: BankCounter[]; // Phase 3: counters with utilization/overload metrics
  kpis: DashboardKPIs;
  notifications: ToastNotification[];
  hourlyPredictions: HourlyRushPrediction[];
  aiRecommendations: AiRecommendation[];
  lastOptimizationResult: OptimizationResult | null; // Phase 3
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'ALL' | QueueStatus;
  setStatusFilter: (filter: 'ALL' | QueueStatus) => void;
  serviceFilter: string;
  setServiceFilter: (filter: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
  isTokenModalOpen: boolean;
  setIsTokenModalOpen: (open: boolean) => void;
  isTokenSlipModalOpen: boolean;
  setIsTokenSlipModalOpen: (open: boolean) => void;
  lastGeneratedToken: QueueToken | null;
  selectedToken: QueueToken | null;
  setSelectedToken: (token: QueueToken | null) => void;
  // Queue actions
  generateToken: (data: {
    customerName: string;
    serviceType: ServiceType;
    priority: Priority;
    customerPhone?: string;
    notes?: string;
  }) => { success: boolean; token?: QueueToken; error?: string };
  startService: (tokenId: string, counterId?: string) => { success: boolean; message: string };
  completeService: (tokenId: string) => { success: boolean; message: string };
  cancelToken: (tokenId: string, reason?: string) => { success: boolean; message: string };
  callNextWaiting: (counterId: string) => { success: boolean; message: string };
  toggleCounterStatus: (counterId: string) => void;
  applyAiRecommendation: (recId: string) => void;
  optimizeQueue: () => void; // Phase 3
  resetDemoData: () => void;
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<QueueToken[]>(() =>
    recalculateQueuePredictions(INITIAL_TOKENS, INITIAL_COUNTERS)
  );
  const [counters, setCounters] = useState<BankCounter[]>(INITIAL_COUNTERS);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QueueStatus>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isTokenSlipModalOpen, setIsTokenSlipModalOpen] = useState(false);
  const [lastGeneratedToken, setLastGeneratedToken] = useState<QueueToken | null>(null);
  const [selectedToken, setSelectedToken] = useState<QueueToken | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastOptimizationResult, setLastOptimizationResult] = useState<OptimizationResult | null>(null);

  // Load persisted demo data on client mount
  useEffect(() => {
    try {
      const storedTokens = localStorage.getItem(TOKENS_STORAGE_KEY);
      const storedCounters = localStorage.getItem(COUNTERS_STORAGE_KEY);
      const activeCounters = storedCounters ? JSON.parse(storedCounters) : INITIAL_COUNTERS;
      if (storedCounters) {
        setCounters(activeCounters);
      }
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens);
        setTokens(recalculateQueuePredictions(parsed, activeCounters));
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever tokens change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } catch (e) {
      console.warn('Failed to save tokens to localStorage:', e);
    }
  }, [tokens, isInitialized]);

  // Save to localStorage whenever counters change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(COUNTERS_STORAGE_KEY, JSON.stringify(counters));
    } catch (e) {
      console.warn('Failed to save counters to localStorage:', e);
    }
  }, [counters, isInitialized]);

  // Add toast notification
  const addToast = useCallback(
    (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: ToastNotification = {
        id,
        type,
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 5));

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Calculate dynamic KPIs from current queue state and AI engine
  const kpis: DashboardKPIs = useMemo(() => {
    const totalCustomers = tokens.length;
    const waitingList = tokens.filter((t) => t.status === 'Waiting');
    const waitingCustomers = waitingList.length;

    // AI-based dynamic average wait time calculation
    const avgWaitingTime = calculateDynamicAverageWaitTime(tokens, counters);

    const activeCount = counters.filter((c) => c.status !== 'On Break').length;
    const onBreakCount = counters.filter((c) => c.status === 'On Break').length;

    return {
      totalCustomers,
      waitingCustomers,
      avgWaitingTime,
      activeCounters: `${activeCount} / ${counters.length}`,
      countersOnBreak: onBreakCount,
      branchName: 'Branch - Main Branch',
      workingHours: '9:30 AM - 4:30 PM',
      isOpen: true,
    };
  }, [tokens, counters]);

  // AI Rush Predictions & AI Insights computed dynamically
  const hourlyPredictions = useMemo(() => {
    return generateHourlyRushPredictions(tokens, counters);
  }, [tokens, counters]);

  const aiRecommendations = useMemo(() => {
    return generateAiInsights(tokens, counters);
  }, [tokens, counters]);

  // Phase 3: Enriched counters with live utilization & overload metrics
  const enrichedCounters = useMemo(() => {
    return computeCounterMetrics(counters, tokens);
  }, [counters, tokens]);

  // Determine optimal assigned counter for a service
  const findBestCounter = useCallback(
    (serviceType: ServiceType): BankCounter => {
      const matchingCounters = counters.filter((c) =>
        c.supportedServices.includes(serviceType)
      );

      if (matchingCounters.length === 0) {
        return counters[0];
      }

      // First check if any supported counter is currently Available
      const available = matchingCounters.find((c) => c.status === 'Available');
      if (available) return available;

      // Next check active counters (not on break)
      const active = matchingCounters.find((c) => c.status !== 'On Break');
      if (active) return active;

      return matchingCounters[0];
    },
    [counters]
  );

  // Generate unique token number
  const getNextTokenNumber = useCallback((): string => {
    const numbers = tokens
      .map((t) => {
        const match = t.tokenNumber.match(/A(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const highest = numbers.length > 0 ? Math.max(...numbers) : 41;
    const next = highest + 1;
    return `A${String(next).padStart(3, '0')}`;
  }, [tokens]);

  // Action: Generate Token
  const generateToken = useCallback(
    (data: {
      customerName: string;
      serviceType: ServiceType;
      priority: Priority;
      customerPhone?: string;
      notes?: string;
    }) => {
      const trimmedName = data.customerName.trim();
      if (!trimmedName || trimmedName.length < 2) {
        addToast('error', 'Validation Error', 'Please enter a valid customer name (at least 2 characters).');
        return { success: false, error: 'Customer name is required' };
      }

      const assignedCounter = findBestCounter(data.serviceType);
      const tokenNumber = getNextTokenNumber();

      const tempToken: QueueToken = {
        id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        tokenNumber,
        customerName: trimmedName,
        customerPhone: data.customerPhone?.trim(),
        serviceType: data.serviceType,
        priority: data.priority,
        assignedCounter: assignedCounter.name,
        status: 'Waiting',
        waitingTime: 0,
        createdAt: new Date().toISOString(),
        notes: data.notes?.trim(),
      };

      // Calculate AI wait time for this new token
      const { estimatedMinutes, breakdown } = calculateTokenWaitTime(tempToken, tokens, counters);
      const newToken: QueueToken = {
        ...tempToken,
        waitingTime: estimatedMinutes,
        waitTimeBreakdown: breakdown,
      };

      // Priority ordering: VIP and Senior Citizen inserted ahead of regular waiting
      setTokens((prev) => {
        const waitingTokens = prev.filter((t) => t.status === 'Waiting');
        const otherTokens = prev.filter((t) => t.status !== 'Waiting');

        if (newToken.priority === 'VIP' || newToken.priority === 'Differently Abled') {
          const firstRegularIndex = waitingTokens.findIndex((t) => t.priority === 'Regular');
          if (firstRegularIndex !== -1) {
            waitingTokens.splice(firstRegularIndex, 0, newToken);
          } else {
            waitingTokens.push(newToken);
          }
        } else if (newToken.priority === 'Senior Citizen') {
          const lastVipIndex = waitingTokens.reduce(
            (max, t, i) => (t.priority === 'VIP' ? i : max),
            -1
          );
          if (lastVipIndex !== -1 && lastVipIndex + 1 < waitingTokens.length) {
            waitingTokens.splice(lastVipIndex + 1, 0, newToken);
          } else {
            waitingTokens.push(newToken);
          }
        } else {
          waitingTokens.push(newToken);
        }

        const combined = [...otherTokens, ...waitingTokens];
        // Recalculate dynamic predictions for entire queue
        return recalculateQueuePredictions(combined, counters);
      });

      setLastGeneratedToken(newToken);
      setIsTokenSlipModalOpen(true);
      addToast(
        'success',
        'Token Generated',
        `Token ${tokenNumber} issued. AI estimated wait: ~${newToken.waitingTime} min at ${assignedCounter.name}.`
      );

      return { success: true, token: newToken };
    },
    [tokens, counters, findBestCounter, getNextTokenNumber, addToast]
  );

  // Action: Start Service
  const startService = useCallback(
    (tokenId: string, counterId?: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) {
        addToast('error', 'Error', 'Token not found.');
        return { success: false, message: 'Token not found' };
      }

      if (token.status !== 'Waiting') {
        addToast(
          'warning',
          'Invalid Action',
          `Cannot start service for Token ${token.tokenNumber} because it is currently "${token.status}".`
        );
        return { success: false, message: `Token is already ${token.status}` };
      }

      let targetCounter: BankCounter | undefined;
      if (counterId) {
        targetCounter = counters.find((c) => c.id === counterId);
      } else {
        targetCounter = counters.find((c) => c.name === token.assignedCounter);
        if (!targetCounter || targetCounter.status === 'On Break') {
          targetCounter = counters.find(
            (c) => c.supportedServices.includes(token.serviceType) && c.status !== 'On Break'
          );
        }
      }

      if (!targetCounter) {
        addToast('error', 'No Counter Available', 'No active counter found for this service type.');
        return { success: false, message: 'No counter available' };
      }

      const counterName = targetCounter.name;
      const targetCounterInternalId = targetCounter.id;

      // Update counters
      const updatedCounters = counters.map((c) =>
        c.id === targetCounterInternalId
          ? {
              ...c,
              status: 'In Service' as const,
              currentServingTokenId: tokenId,
              currentServingTokenNumber: token.tokenNumber,
            }
          : c
      );
      setCounters(updatedCounters);

      // Update token status & recalculate queue
      setTokens((prev) => {
        const updated = prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                status: 'Serving' as const,
                assignedCounter: counterName,
                servedAt: new Date().toISOString(),
                waitingTime: 0,
              }
            : t
        );
        return recalculateQueuePredictions(updated, updatedCounters);
      });

      addToast(
        'success',
        'Service Started',
        `${counterName} is now serving ${token.tokenNumber} (${token.customerName}).`
      );

      return { success: true, message: `Started serving ${token.tokenNumber}` };
    },
    [tokens, counters, addToast]
  );

  // Action: Complete Service
  const completeService = useCallback(
    (tokenId: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) {
        addToast('error', 'Error', 'Token not found.');
        return { success: false, message: 'Token not found' };
      }

      if (token.status !== 'Serving') {
        addToast(
          'warning',
          'Invalid Action',
          `Cannot complete Token ${token.tokenNumber} because it is currently "${token.status}". Only serving tokens can be completed.`
        );
        return { success: false, message: `Token is ${token.status}` };
      }

      const updatedCounters = counters.map((c) => {
        if (c.currentServingTokenId === tokenId || c.name === token.assignedCounter) {
          return {
            ...c,
            status: 'Available' as const,
            currentServingTokenId: undefined,
            currentServingTokenNumber: undefined,
            totalServed: c.totalServed + 1,
          };
        }
        return c;
      });
      setCounters(updatedCounters);

      setTokens((prev) => {
        const updated = prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                status: 'Completed' as const,
                completedAt: new Date().toISOString(),
              }
            : t
        );
        return recalculateQueuePredictions(updated, updatedCounters);
      });

      addToast(
        'success',
        'Service Completed',
        `Token ${token.tokenNumber} (${token.customerName}) completed. ${token.assignedCounter} is now available.`
      );

      return { success: true, message: `Completed ${token.tokenNumber}` };
    },
    [tokens, counters, addToast]
  );

  // Action: Cancel Token
  const cancelToken = useCallback(
    (tokenId: string, reason?: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) {
        addToast('error', 'Error', 'Token not found.');
        return { success: false, message: 'Token not found' };
      }

      if (token.status === 'Completed' || token.status === 'Cancelled') {
        addToast(
          'warning',
          'Invalid Action',
          `Token ${token.tokenNumber} is already "${token.status}" and cannot be cancelled.`
        );
        return { success: false, message: `Token is already ${token.status}` };
      }

      const wasServing = token.status === 'Serving';

      const updatedCounters = wasServing
        ? counters.map((c) => {
            if (c.currentServingTokenId === tokenId || c.name === token.assignedCounter) {
              return {
                ...c,
                status: 'Available' as const,
                currentServingTokenId: undefined,
                currentServingTokenNumber: undefined,
              };
            }
            return c;
          })
        : counters;

      if (wasServing) {
        setCounters(updatedCounters);
      }

      setTokens((prev) => {
        const updated = prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                status: 'Cancelled' as const,
                notes: reason ? `${t.notes ? t.notes + ' | ' : ''}Cancelled: ${reason}` : t.notes,
              }
            : t
        );
        return recalculateQueuePredictions(updated, updatedCounters);
      });

      addToast('info', 'Token Cancelled', `Token ${token.tokenNumber} has been cancelled. Predictions updated.`);

      return { success: true, message: `Cancelled ${token.tokenNumber}` };
    },
    [tokens, counters, addToast]
  );

  // Action: Call Next Waiting Customer at Counter
  const callNextWaiting = useCallback(
    (counterId: string) => {
      const counter = counters.find((c) => c.id === counterId);
      if (!counter) return { success: false, message: 'Counter not found' };

      if (counter.status === 'On Break') {
        addToast('warning', 'Counter on Break', `${counter.name} is currently on break. Resume counter to call customers.`);
        return { success: false, message: 'Counter on break' };
      }

      if (counter.currentServingTokenId) {
        completeService(counter.currentServingTokenId);
      }

      const nextWaiting = tokens.find(
        (t) =>
          t.status === 'Waiting' &&
          (counter.supportedServices.includes(t.serviceType) || t.assignedCounter === counter.name)
      );

      if (!nextWaiting) {
        addToast('info', 'Queue Empty', `No waiting customers in queue for ${counter.name}'s services.`);
        return { success: false, message: 'No waiting customer' };
      }

      return startService(nextWaiting.id, counter.id);
    },
    [counters, tokens, completeService, startService, addToast]
  );

  // Action: Toggle Counter Status
  const toggleCounterStatus = useCallback(
    (counterId: string) => {
      const nextCounters = counters.map((c) => {
        if (c.id === counterId) {
          const nextStatus = c.status === 'On Break' ? ('Available' as const) : ('On Break' as const);
          addToast(
            'info',
            'Counter Updated',
            `${c.name} is now ${nextStatus === 'On Break' ? 'On Break' : 'Active and Available'}. AI wait times recalculated.`
          );
          return {
            ...c,
            status: nextStatus,
            currentServingTokenId: nextStatus === 'On Break' ? undefined : c.currentServingTokenId,
            currentServingTokenNumber: nextStatus === 'On Break' ? undefined : c.currentServingTokenNumber,
          };
        }
        return c;
      });

      setCounters(nextCounters);
      setTokens((prev) => recalculateQueuePredictions(prev, nextCounters));
    },
    [counters, addToast]
  );

  // Action: Apply AI Recommendation (e.g. Open break counter)
  const applyAiRecommendation = useCallback(
    (recId: string) => {
      const recommendation = aiRecommendations.find((r) => r.id === recId);
      if (!recommendation) return;

      if (recommendation.actionCounterId) {
        const counterId = recommendation.actionCounterId;
        const targetCounter = counters.find((c) => c.id === counterId);
        if (targetCounter && targetCounter.status === 'On Break') {
          toggleCounterStatus(counterId);
          addToast(
            'success',
            'AI Action Applied',
            `${targetCounter.name} is now open! Re-balancing queue wait times.`
          );
        }
      } else {
        addToast('info', 'AI Recommendation Noted', recommendation.title);
      }
    },
    [aiRecommendations, counters, toggleCounterStatus, addToast]
  );

  // Phase 3: Optimize Queue Allocation
  const optimizeQueue = useCallback(() => {
    const waitingCount = tokens.filter((t) => t.status === 'Waiting').length;

    if (waitingCount === 0) {
      addToast('info', 'Queue Empty', 'No waiting customers to optimise.');
      return;
    }

    const { optimizedTokens, result } = optimizeQueueAllocation(tokens, counters);

    setTokens(optimizedTokens);
    setLastOptimizationResult(result);

    if (result.reallocatedCount === 0) {
      addToast(
        'info',
        'Already Optimal',
        'Queue load is already balanced across all active counters.'
      );
    } else {
      addToast(
        'success',
        `Queue Optimised — ${result.reallocatedCount} Reassignment${result.reallocatedCount > 1 ? 's' : ''}`,
        `Avg wait time: ${result.initialAvgWaitTime} min → ${result.optimizedAvgWaitTime} min. ${result.improvementPercentage}% improvement.`
      );
    }
  }, [tokens, counters, addToast]);

  // Action: Reset Demo Data
  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(TOKENS_STORAGE_KEY);
      localStorage.removeItem(COUNTERS_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed clearing localStorage:', e);
    }
    const resetTokens = recalculateQueuePredictions(INITIAL_TOKENS, INITIAL_COUNTERS);
    setTokens(resetTokens);
    setCounters(INITIAL_COUNTERS);
    setSearchQuery('');
    setStatusFilter('ALL');
    setServiceFilter('ALL');
    setPriorityFilter('ALL');
    addToast('success', 'Reset Complete', 'Demo queue and AI predictions restored to baseline state.');
  }, [addToast]);

  return (
    <QueueContext.Provider
      value={{
        tokens,
        counters,
        enrichedCounters,
        kpis,
        notifications,
        hourlyPredictions,
        aiRecommendations,
        lastOptimizationResult,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        serviceFilter,
        setServiceFilter,
        priorityFilter,
        setPriorityFilter,
        isTokenModalOpen,
        setIsTokenModalOpen,
        isTokenSlipModalOpen,
        setIsTokenSlipModalOpen,
        lastGeneratedToken,
        selectedToken,
        setSelectedToken,
        generateToken,
        startService,
        completeService,
        cancelToken,
        callNextWaiting,
        toggleCounterStatus,
        applyAiRecommendation,
        optimizeQueue,
        resetDemoData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
