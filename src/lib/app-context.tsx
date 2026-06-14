"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import type { TimelineEvent } from "@/lib/data";
import type { CheckInData } from "@/lib/intelligence/types";
import {
  HealthScoreService,
  HealthAgeService,
  RiskDetectionService,
  InsightGenerationService,
  AIPrioritiesService,
  TimelineGenerationService,
  WeeklyReportService,
  MonthlyReportService,
  MockDataGenerator,
  HealthScoreResult,
  HealthAgeResult,
  DetectedRisk,
  AIPriority,
  AIInsight,
  WeeklyReport,
  MonthlyReport,
} from "@/lib/intelligence";

interface HydrationState {
  current: number;
  goal: number;
  logs: { amount: number; time: Date }[];
  progress: number;
}

interface MedicationState {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  frequency: "daily" | "twice_daily" | "weekly" | "as_needed";
  status: "active" | "paused" | "stopped";
  currentStatus: "pending" | "taken" | "missed" | "skipped";
  takenAt?: Date;
  takenHistory: Array<{ date: Date; status: "pending" | "taken" | "skipped" | "missed" }>;
  missedThisWeek: number;
  compliance: number;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

interface Notification {
  id: string;
  type: "hydration" | "medication" | "checkin" | "healthscore" | "insight";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  conditions: string[];
  customConditions: Array<{
    id: string;
    name: string;
    severity?: "mild" | "moderate" | "severe";
    notes?: string;
    diagnosedDate?: Date;
  }>;
}

interface AppState {
  profile: UserProfile;
  hydration: HydrationState;
  medications: MedicationState[];
  notifications: Notification[];
  timeline: TimelineEvent[];
  chronologicalAge: number;
  checkInHistory: CheckInData[];
  isDemoMode: boolean;
  isInitialized: boolean;
}

interface ComputedIntelligence {
  healthScore: HealthScoreResult;
  healthAge: HealthAgeResult;
  risks: DetectedRisk[];
  priorities: AIPriority[];
  insights: AIInsight[];
  weeklyReport: WeeklyReport | null;
  monthlyReport: MonthlyReport | null;
  syncVitalsSummary: {
    productName: string;
    tagline: string;
  };
}

interface AppContextType extends AppState, ComputedIntelligence {
  addHydration: (amount: number) => void;
  updateMedicationStatus: (id: string, status: MedicationState["currentStatus"]) => void;
  addMedication: (medication: Omit<MedicationState, "id" | "takenHistory" | "missedThisWeek" | "compliance" | "currentStatus">) => string;
  updateMedication: (id: string, updates: Partial<MedicationState>) => void;
  deleteMedication: (id: string) => void;
  pauseMedication: (id: string) => void;
  resumeMedication: (id: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  addCheckIn: (data: Omit<CheckInData, "date">) => void;
  getHydrationTrend: () => number;
  getMedicationAdherence: () => number;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const STORAGE_KEY = "syncvitals-health-data";

const AppContext = createContext<AppContextType | undefined>(undefined);

function getDefaultMedications(): MedicationState[] {
  return [
    { id: "med-1", name: "Vitamin D3", dosage: "5000 IU", schedule: "8:00 AM", frequency: "daily", status: "active", currentStatus: "pending", takenHistory: [], missedThisWeek: 0, compliance: 90, startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    { id: "med-2", name: "Omega-3", dosage: "1000mg", schedule: "9:00 AM", frequency: "daily", status: "active", currentStatus: "pending", takenHistory: [], missedThisWeek: 1, compliance: 85, startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
    { id: "med-3", name: "Magnesium Glycinate", dosage: "400mg", schedule: "10:00 PM", frequency: "daily", status: "active", currentStatus: "pending", takenHistory: [], missedThisWeek: 0, compliance: 92, startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45) },
  ];
}

function getDefaultNotifications(): Notification[] {
  return [
    {
      id: "notif-1",
      type: "hydration",
      title: "Hydration Insight",
      message: "Your hydration consistency has improved by 15% compared to last week.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: "notif-2",
      type: "checkin",
      title: "Daily Check-In available",
      message: "Your morning health check-in is ready. Takes just 25 seconds!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: "notif-3",
      type: "medication",
      title: "Medication reminder",
      message: "Vitamin D3 is due at 8:00 PM",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
    },
    {
      id: "notif-4",
      type: "insight",
      title: "Sleep Pattern Detected",
      message: "Your sleep quality declined over the last three days while stress levels increased.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
  ];
}

function generateInitialState(): AppState {
  const medications = getDefaultMedications();
  const defaultProfile = {
    name: "Alex",
    age: 28,
    gender: "Prefer not to say",
    height: 175,
    weight: 70,
    conditions: [] as string[],
    customConditions: [] as Array<{
      id: string;
      name: string;
      severity?: "mild" | "moderate" | "severe";
      notes?: string;
      diagnosedDate?: Date;
    }>,
  };

  // Generate realistic demo data
  const mockData = MockDataGenerator.generateAll(14);

  // Convert hydration logs to state format
  const hydrationLogs = mockData.hydrationLogs.map(l => ({
    amount: l.amount,
    time: l.date,
  }));

  const latestHydration = hydrationLogs.length > 0
    ? hydrationLogs[hydrationLogs.length - 1].amount
    : 1750;

  return {
    profile: { ...defaultProfile, ...mockData.profile },
    hydration: {
      current: latestHydration,
      goal: 2500,
      logs: hydrationLogs,
      progress: Math.round((latestHydration / 2500) * 100),
    },
    medications,
    notifications: getDefaultNotifications(),
    timeline: [
      { id: "tl-1", date: new Date(), title: "Health Score Updated", type: "info", description: "Score recalculated based on recent check-ins." },
      { id: "tl-2", date: new Date(Date.now() - 86400000), title: "Hydration Goal Achieved", type: "improvement", description: "Reached your daily hydration target." },
      { id: "tl-3", date: new Date(Date.now() - 86400000 * 2), title: "Exercise Completed", type: "info", description: "Physical activity logged for today." },
      { id: "tl-4", date: new Date(Date.now() - 86400000 * 3), title: "Stress Pattern Detected", type: "concern", description: "Stress levels elevated over the past few days." },
      { id: "tl-5", date: new Date(Date.now() - 86400000 * 5), title: "Sleep Quality Improved", type: "improvement", description: "Average sleep duration increased by 30 minutes." },
    ],
    chronologicalAge: mockData.profile.age || 28,
    checkInHistory: mockData.checkInHistory,
    isDemoMode: true,
    isInitialized: false,
  };
}

function loadStateFromStorage(): AppState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Convert date strings back to Date objects
      if (parsed.checkInHistory) {
        parsed.checkInHistory = parsed.checkInHistory.map((c: any) => ({
          ...c,
          date: new Date(c.date),
        }));
      }
      if (parsed.hydration?.logs) {
        parsed.hydration.logs = parsed.hydration.logs.map((l: any) => ({
          ...l,
          time: new Date(l.time),
        }));
      }
      if (parsed.notifications) {
        parsed.notifications = parsed.notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
      if (parsed.timeline) {
        parsed.timeline = parsed.timeline.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
      }
      if (parsed.medications) {
        parsed.medications = parsed.medications.map((m: any) => ({
          ...m,
          takenAt: m.takenAt ? new Date(m.takenAt) : undefined,
        }));
      }

      parsed.isInitialized = true;
      parsed.isDemoMode = false;
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load state from storage:", e);
  }
  return null;
}

function saveStateToStorage(state: AppState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to storage:", e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const storedState = loadStateFromStorage();
    if (storedState) {
      setState(storedState);
    } else {
      setState(generateInitialState());
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state && isHydrated) {
      saveStateToStorage(state);
    }
  }, [state, isHydrated]);

  // Compute health intelligence whenever relevant state changes
  const computedIntelligence = useMemo((): ComputedIntelligence | null => {
    if (!state || !isHydrated) return null;

    const latestCheckIn = state.checkInHistory[0] || {
      date: new Date(),
      sleepHours: 7,
      sleepQuality: "good" as const,
      energyLevel: "medium" as const,
      mood: "okay" as const,
      symptoms: [],
      stressLevel: "normal" as const,
      exerciseCompleted: false,
    };

    const medicationAdherence = state.medications.length > 0
      ? Math.round(state.medications.reduce((sum, m) => sum + m.compliance, 0) / state.medications.length)
      : 85;

    // Calculate health score
    const healthScore = HealthScoreService.calculateHealthScore({
      sleepHours: latestCheckIn.sleepHours,
      sleepQuality: latestCheckIn.sleepQuality,
      energyLevel: latestCheckIn.energyLevel,
      mood: latestCheckIn.mood,
      stressLevel: latestCheckIn.stressLevel,
      exerciseCompleted: latestCheckIn.exerciseCompleted,
      hydrationProgress: state.hydration.progress,
      medicationAdherence,
      symptoms: latestCheckIn.symptoms,
      symptomsCount: latestCheckIn.symptoms.filter(s => s !== "none").length,
      symptomsSeverity: latestCheckIn.symptoms.length * 2,
    });

    // Calculate health age
    const trends = HealthAgeService.analyzeTrends(state.checkInHistory);
    const healthAge = HealthAgeService.calculateHealthAge(
      state.chronologicalAge,
      trends,
      state.hydration.progress,
      medicationAdherence
    );

    // Detect risks
    const risks = RiskDetectionService.detectAllRisks({
      checkInHistory: state.checkInHistory,
      hydrationProgress: state.hydration.progress,
      medicationAdherence,
      missedMedicationCount: state.medications.reduce((sum, m) => sum + m.missedThisWeek, 0),
      totalMedicationCount: state.medications.length * 7,
    });

    // Generate priorities
    const priorities = AIPrioritiesService.generatePriorities({
      checkInHistory: state.checkInHistory,
      hydrationProgress: state.hydration.progress,
      medicationAdherence,
    });

    // Generate insights
    const insights = InsightGenerationService.generateInsights({
      checkInHistory: state.checkInHistory,
      currentHydration: state.hydration.progress,
      previousHydration: Math.max(0, state.hydration.progress - 15),
      currentMedicationAdherence: medicationAdherence,
      previousMedicationAdherence: Math.max(0, medicationAdherence - 5),
      activeRisks: risks,
    });

    // Generate weekly report
    const weekData = state.checkInHistory.slice(0, 7);
    const previousWeekData = state.checkInHistory.slice(7, 14);
    const weeklyReport = WeeklyReportService.generateReport({
      weekData,
      previousWeekData,
      healthScores: weekData.map(() => healthScore.score),
      previousHealthScores: previousWeekData.map(() => healthScore.previousScore || 75),
      activeRisks: risks,
      insights,
    });

    // Generate monthly report
    const monthData = state.checkInHistory.slice(0, 30);
    const healthAgeChange = healthAge.difference;
    const monthlyReport = MonthlyReportService.generateReport({
      monthData,
      healthScores: monthData.map((_, i) => {
        const baseScore = 70 + (i % 15);
        return baseScore + (healthScore.score - 75);
      }),
      healthAgeChange,
      risksSummary: risks.map(r => r.type),
      improvementsSummary: priorities.map(p => p.title),
    });

    return {
      healthScore,
      healthAge,
      risks,
      priorities,
      insights,
      weeklyReport,
      monthlyReport,
      syncVitalsSummary: {
        productName: "SyncVitals",
        tagline: "Your body shouldn't be a mystery.",
      },
    };
  }, [state, isHydrated]);

  const addHydration = useCallback((amount: number) => {
    setState((prev) => {
      if (!prev) return prev;

      const newCurrent = Math.min(prev.hydration.current + amount, prev.hydration.goal + 500);
      const newProgress = Math.round((newCurrent / prev.hydration.goal) * 100);

      const events: TimelineEvent[] = [];
      if (newProgress >= 100 && prev.hydration.progress < 100) {
        events.push({
          id: `tl-hydration-${Date.now()}`,
          date: new Date(),
          title: "Hydration Goal Achieved",
          description: `Reached ${newProgress}% of daily hydration target. Great job staying hydrated!`,
          type: "improvement",
          source: "hydration",
        });
      }

      return {
        ...prev,
        hydration: {
          ...prev.hydration,
          current: newCurrent,
          progress: newProgress,
          logs: [...prev.hydration.logs, { amount, time: new Date() }],
        },
        timeline: events.length > 0 ? [...events, ...prev.timeline] : prev.timeline,
      };
    });
  }, []);

  const updateMedicationStatus = useCallback((id: string, status: MedicationState["currentStatus"]) => {
    setState((prev) => {
      if (!prev) return prev;

      const updatedMedications = prev.medications.map((med) => {
        if (med.id !== id) return med;

        const wasMissed = med.currentStatus === "pending" && status === "missed";
        const newMissedThisWeek = wasMissed ? med.missedThisWeek + 1 : med.missedThisWeek;
        const newTakenHistory = [...med.takenHistory, { date: new Date(), status }];

        return {
          ...med,
          currentStatus: status,
          takenAt: status === "taken" ? new Date() : undefined,
          missedThisWeek: newMissedThisWeek,
          compliance: Math.round(((7 - newMissedThisWeek) / 7) * 100),
          takenHistory: newTakenHistory.slice(-30),
        };
      });

      const events: TimelineEvent[] = [];
      const medication = updatedMedications.find(m => m.id === id);
      if (medication && status === "taken") {
        events.push({
          id: `tl-med-${id}-${Date.now()}`,
          date: new Date(),
          title: "Medication Taken",
          description: `${medication.name} (${medication.dosage}) taken as scheduled.`,
          type: "info",
          source: "medication",
        });
      }

      return {
        ...prev,
        medications: updatedMedications,
        timeline: events.length > 0 ? [...events, ...prev.timeline] : prev.timeline,
      };
    });
  }, []);

  const addMedication = useCallback((medication: Omit<MedicationState, "id" | "takenHistory" | "missedThisWeek" | "compliance" | "currentStatus">): string => {
    const id = `med-${Date.now()}`;
    const newMedication: MedicationState = {
      ...medication,
      id,
      takenHistory: [],
      missedThisWeek: 0,
      compliance: 100,
      currentStatus: "pending",
    };

    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: [...prev.medications, newMedication],
      };
    });

    return id;
  }, []);

  const updateMedication = useCallback((id: string, updates: Partial<MedicationState>) => {
    setState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        medications: prev.medications.map((med) =>
          med.id === id ? { ...med, ...updates } : med
        ),
      };
    });
  }, []);

  const deleteMedication = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: prev.medications.filter((med) => med.id !== id),
      };
    });
  }, []);

  const pauseMedication = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: prev.medications.map((med) =>
          med.id === id ? { ...med, status: "paused" as const } : med
        ),
      };
    });
  }, []);

  const resumeMedication = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: prev.medications.map((med) =>
          med.id === id ? { ...med, status: "active" as const } : med
        ),
      };
    });
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: [newNotification, ...prev.notifications],
        };
      });
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      };
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      };
    });
  }, []);

  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, "id">) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`,
    };
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timeline: [newEvent, ...prev.timeline.filter((t) => t.id !== newEvent.id)],
      };
    });
  }, []);

  const addCheckIn = useCallback((data: Omit<CheckInData, "date">) => {
    const newCheckIn: CheckInData = {
      ...data,
      date: new Date(),
    };

    setState((prev) => {
      if (!prev) return prev;

      const newHistory = [newCheckIn, ...prev.checkInHistory].slice(0, 30);

      const previousCheckIn = prev.checkInHistory[0];
      const events = TimelineGenerationService.generateFromCheckIn(newCheckIn, previousCheckIn);

      const medicationAdherence = prev.medications.length > 0
        ? Math.round(prev.medications.reduce((sum, m) => sum + m.compliance, 0) / prev.medications.length)
        : 85;

      const healthScore = HealthScoreService.calculateHealthScore({
        sleepHours: newCheckIn.sleepHours,
        sleepQuality: newCheckIn.sleepQuality,
        energyLevel: newCheckIn.energyLevel,
        mood: newCheckIn.mood,
        stressLevel: newCheckIn.stressLevel,
        exerciseCompleted: newCheckIn.exerciseCompleted,
        hydrationProgress: prev.hydration.progress,
        medicationAdherence,
        symptoms: newCheckIn.symptoms,
        symptomsCount: newCheckIn.symptoms.filter(s => s !== "none").length,
        symptomsSeverity: newCheckIn.symptoms.length * 2,
      });

      if (previousCheckIn) {
        const scoreEvents = TimelineGenerationService.generateFromScoreChange(
          healthScore,
          healthScore.previousScore || 75
        );
        events.push(...scoreEvents);
      }

      return {
        ...prev,
        checkInHistory: newHistory,
        timeline: TimelineGenerationService.mergeEvents([...events, ...prev.timeline]),
      };
    });
  }, []);

  const updateProfile = useCallback((profileUpdate: Partial<UserProfile>) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, ...profileUpdate },
        chronologicalAge: profileUpdate.age ?? prev.chronologicalAge,
      };
    });
  }, []);

  const getHydrationTrend = useCallback((): number => {
    if (!state) return 0;
    const logs = state.hydration.logs;
    if (logs.length < 2) return 0;

    const recent = logs.slice(-7);
    const previous = logs.slice(-14, -7);

    if (previous.length === 0) return 0;

    const recentAvg = recent.reduce((sum, l) => sum + l.amount, 0) / recent.length;
    const previousAvg = previous.reduce((sum, l) => sum + l.amount, 0) / previous.length;

    return Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  }, [state]);

  const getMedicationAdherence = useCallback((): number => {
    if (!state || state.medications.length === 0) return 85;
    return Math.round(state.medications.reduce((sum, m) => sum + m.compliance, 0) / state.medications.length);
  }, [state]);

  if (!state || !isHydrated || !computedIntelligence) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Loading SyncVitals...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...computedIntelligence,
        addHydration,
        updateMedicationStatus,
        addMedication,
        updateMedication,
        deleteMedication,
        pauseMedication,
        resumeMedication,
        addNotification,
        markNotificationRead,
        clearNotifications,
        addTimelineEvent,
        addCheckIn,
        updateProfile,
        getHydrationTrend,
        getMedicationAdherence,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}