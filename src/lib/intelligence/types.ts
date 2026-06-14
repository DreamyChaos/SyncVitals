// Health Intelligence Types and Constants

export type SleepQuality = "poor" | "fair" | "good" | "excellent";
export type EnergyLevel = "low" | "medium" | "high";
export type Mood = "poor" | "okay" | "good" | "great";
export type StressLevel = "relaxed" | "normal" | "busy" | "very_stressful";

export interface CheckInData {
  date: Date;
  sleepHours: number;
  sleepQuality: SleepQuality;
  energyLevel: EnergyLevel;
  mood: Mood;
  symptoms: string[];
  stressLevel: StressLevel;
  exerciseCompleted: boolean;
  notes?: string;
}

export interface HydrationLog {
  date: Date;
  amount: number;
  goal: number;
}

export interface MedicationLog {
  medicationId: string;
  date: Date;
  status: "taken" | "skipped" | "missed";
  takenAt?: Date;
}

export interface HealthMetrics {
  sleepHours: number;
  sleepQuality: SleepQuality;
  energyLevel: EnergyLevel;
  mood: Mood;
  stressLevel: StressLevel;
  exerciseCompleted: boolean;
  hydrationProgress: number; // 0-100
  medicationAdherence: number; // 0-100
  symptoms: string[];
  symptomsCount: number;
  symptomsSeverity: number; // 0-10
}

export interface ScoreContribution {
  category: string;
  label: string;
  value: number;
  maxValue: number;
  impact: "positive" | "negative" | "neutral";
  reason: string;
}

export interface HealthScoreResult {
  score: number;
  previousScore: number;
  change: number;
  contributions: ScoreContribution[];
  factors: {
    sleep: number;
    energy: number;
    mood: number;
    stress: number;
    exercise: number;
    hydration: number;
    medication: number;
    symptoms: number;
  };
  generatedAt: Date;
}

export interface HealthAgeResult {
  healthAge: number;
  chronologicalAge: number;
  difference: number;
  factors: {
    sleepTrend: number;
    exerciseTrend: number;
    stressTrend: number;
    hydrationAdherence: number;
    medicationAdherence: number;
    energyTrend: number;
  };
  explanations: string[];
  generatedAt: Date;
}

export type RiskType =
  | "burnout"
  | "fatigue"
  | "dehydration"
  | "medication_non_compliance"
  | "poor_sleep_pattern"
  | "declining_health";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface DetectedRisk {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  confidence: number; // 0-100
  title: string;
  description: string;
  contributingFactors: ContributingFactor[];
  detectedAt: Date;
  trend: "increasing" | "stable" | "decreasing";
}

export interface ContributingFactor {
  name: string;
  value: number;
  impact: number; // -100 to 100
  description: string;
}

export interface AIPriority {
  id: string;
  title: string;
  category: "sleep" | "hydration" | "stress" | "exercise" | "mood" | "medication" | "nutrition";
  description: string;
  icon: string;
  currentScore: number;
  targetScore: number;
  potentialGain: number;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  timeToImprove: string;
  actionSteps: string[];
  healthImpact: "high" | "medium" | "low";
  trend: "improving" | "stable" | "declining";
}

export interface AIInsight {
  id: string;
  category: string;
  text: string;
  confidence: number;
  supportingData: string[];
  generatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  description: string;
  type: "improvement" | "concern" | "risk" | "info";
  source?: "auto" | "checkin" | "medication" | "hydration";
  metadata?: Record<string, any>;
}

export interface WeeklyReport {
  startDate: Date;
  endDate: Date;
  averageScore: number;
  previousAverageScore: number;
  scoreChange: number;
  bestImprovement: {
    metric: string;
    change: number;
    description: string;
  };
  biggestConcern: {
    metric: string;
    change: number;
    description: string;
  };
  risks: DetectedRisk[];
  insights: AIInsight[];
  recommendations: string[];
  generatedAt: Date;
}

export interface MonthlyReport {
  month: Date;
  averageScore: number;
  scoreTrend: number[];
  healthAgeChange: number;
  risksSummary: RiskType[];
  improvementsSummary: string[];
  aiSummary: string;
  generatedAt: Date;
}

// Scoring Weights
export const SCORE_WEIGHTS = {
  sleep: 0.20, // 20%
  energy: 0.12, // 12%
  mood: 0.12, // 12%
  stress: 0.15, // 15%
  exercise: 0.10, // 10%
  hydration: 0.13, // 13%
  medication: 0.10, // 10%
  symptoms: 0.08, // 8%
} as const;

// Quality to numeric mapping
export const SLEEP_QUALITY_MAP: Record<SleepQuality, number> = {
  poor: 0.4,
  fair: 0.65,
  good: 0.85,
  excellent: 1.0,
};

export const ENERGY_MAP: Record<EnergyLevel, number> = {
  low: 0.35,
  medium: 0.65,
  high: 1.0,
};

export const MOOD_MAP: Record<Mood, number> = {
  poor: 0.3,
  okay: 0.55,
  good: 0.8,
  great: 1.0,
};

export const STRESS_MAP: Record<StressLevel, number> = {
  very_stressful: 0.2,
  busy: 0.5,
  normal: 0.75,
  relaxed: 1.0,
};

// Symptom severity weights
export const SYMPTOM_SEVERITY_WEIGHTS: Record<string, number> = {
  headache: 2,
  fever: 5,
  fatigue: 3,
  cough: 2,
  body_pain: 3,
  dizziness: 3,
  nausea: 3,
  sore_throat: 2,
  stomach_pain: 3,
  shortness_breath: 4,
};