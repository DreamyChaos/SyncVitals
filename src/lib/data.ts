export interface Priority {
  id: string;
  title: string;
  category: "sleep" | "stress" | "hydration" | "medication" | "energy" | "mood";
  progress: number;
  icon: string;
  recommendation: string;
}

export interface Insight {
  id: string;
  text: string;
  category: "Sleep" | "Stress" | "Mood" | "Hydration" | "Energy";
  confidence: number;
}

export interface RiskDetection {
  id: string;
  title: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  frequency: "daily" | "twice_daily" | "weekly" | "as_needed";
  status: "active" | "paused" | "stopped";
  compliance: number;
  nextDose: string;
  nextDoseTime: string;
  missedThisWeek: number;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface TodaySnapshot {
  sleepHours: number;
  sleepQuality: number;
  waterIntake: number;
  mood: string;
  moodScore: number;
  stressLevel: number;
  energyLevel: number;
  exerciseMinutes: number;
}

export interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  type: "improvement" | "concern" | "risk" | "info";
  description: string;
  source?: "auto" | "checkin" | "medication" | "hydration";
  metadata?: Record<string, any>;
}

export interface WeeklyDataPoint {
  day: string;
  sleep: number;
  mood: number;
  stress: number;
  energy: number;
}

export interface HealthData {
  healthScore: number;
  healthScoreTrend: number;
  healthAge: number;
  chronologicalAge: number;
  priorities: Priority[];
  aiInsight: Insight;
  riskDetections: RiskDetection[];
  medications: Medication[];
  todaySnapshot: TodaySnapshot;
  timeline: TimelineEvent[];
  weeklyTrends: WeeklyDataPoint[];
}

export const mockHealthData: HealthData = {
  healthScore: 87,
  healthScoreTrend: 3.2,
  healthAge: 31,
  chronologicalAge: 34,
  priorities: [
    {
      id: "1",
      title: "Improve Sleep Consistency",
      category: "sleep",
      progress: 65,
      icon: "Moon",
      recommendation: "Your sleep varies by 2.5 hours daily. Try maintaining a consistent bedtime.",
    },
    {
      id: "2",
      title: "Reduce Stress Levels",
      category: "stress",
      progress: 72,
      icon: "Brain",
      recommendation: "Work-related stress peaks between 2-4 PM. Consider a 5-minute breathing exercise.",
    },
    {
      id: "3",
      title: "Increase Daily Hydration",
      category: "hydration",
      progress: 48,
      icon: "Droplets",
      recommendation: "You've consumed only 1.2L today. Target is 2.5L for optimal cognitive function.",
    },
    {
      id: "4",
      title: "Improve Medication Adherence",
      category: "medication",
      progress: 91,
      icon: "Pill",
      recommendation: "Excellent progress! You've taken all morning medications on schedule.",
    },
  ],
  aiInsight: {
    id: "insight-1",
    text: "Your sleep decreased by 18% this week while stress increased by 14%. This pattern typically correlates with lower energy levels and reduced focus. Consider prioritizing earlier bedtimes and the breathing exercises you skipped yesterday.",
    category: "Sleep",
    confidence: 92,
  },
  riskDetections: [
    {
      id: "risk-1",
      title: "Burnout Risk",
      reason: "Sleep has declined for 8 consecutive days while stress markers have increased by 23%.",
      severity: "high",
      timestamp: "2 hours ago",
    },
    {
      id: "risk-2",
      title: "Poor Sleep Pattern",
      reason: "Irregular bedtime detected. Variance exceeds 90 minutes on 5 of the last 7 days.",
      severity: "medium",
      timestamp: "1 day ago",
    },
    {
      id: "risk-3",
      title: "Dehydration Risk",
      reason: "Average daily water intake is 58% below recommended levels for your body weight.",
      severity: "low",
      timestamp: "3 days ago",
    },
    {
      id: "risk-4",
      title: "Medication Non-Compliance",
      reason: "Vitamin D supplement missed 3 times this week. Consistency is key for effectiveness.",
      severity: "medium",
      timestamp: "1 day ago",
    },
  ],
  medications: [
    {
      id: "med-1",
      name: "Omega-3 Complex",
      dosage: "1000mg",
      schedule: "Once daily with breakfast",
      frequency: "daily",
      status: "active",
      compliance: 94,
      nextDose: "Tomorrow",
      nextDoseTime: "8:00 AM",
      missedThisWeek: 0,
      instructions: "Take with food for better absorption",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    },
    {
      id: "med-2",
      name: "Vitamin D3",
      dosage: "5000 IU",
      schedule: "Once daily",
      frequency: "daily",
      status: "active",
      compliance: 71,
      nextDose: "Tomorrow",
      nextDoseTime: "9:00 AM",
      missedThisWeek: 2,
      instructions: "Take in the morning with a fatty meal",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    },
    {
      id: "med-3",
      name: "Magnesium Glycinate",
      dosage: "400mg",
      schedule: "Before bed",
      frequency: "daily",
      status: "active",
      compliance: 91,
      nextDose: "Tonight",
      nextDoseTime: "10:00 PM",
      missedThisWeek: 1,
      instructions: "Take 30 minutes before sleep",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    },
  ],
  todaySnapshot: {
    sleepHours: 6.5,
    sleepQuality: 72,
    waterIntake: 1.2,
    mood: "Neutral",
    moodScore: 58,
    stressLevel: 45,
    energyLevel: 62,
    exerciseMinutes: 23,
  },
  timeline: [
    {
      id: "tl-1",
      date: "Today",
      title: "Energy levels declining",
      type: "concern",
      description: "Afternoon energy dip more pronounced than usual.",
    },
    {
      id: "tl-2",
      date: "Yesterday",
      title: "Hydration below target",
      type: "concern",
      description: "Only 1.2L consumed vs 2.5L recommended.",
    },
    {
      id: "tl-3",
      date: "Jun 11",
      title: "Sleep quality improved",
      type: "improvement",
      description: "Bedtime consistency increased by 40 minutes.",
    },
    {
      id: "tl-4",
      date: "Jun 9",
      title: "Burnout Risk detected",
      type: "risk",
      description: "Pattern of declining sleep with rising stress identified.",
    },
    {
      id: "tl-5",
      date: "Jun 6",
      title: "Stress levels elevated",
      type: "concern",
      description: "Work-related stress markers above baseline.",
    },
  ],
  weeklyTrends: [
    { day: "Mon", sleep: 72, mood: 68, stress: 45, energy: 75 },
    { day: "Tue", sleep: 68, mood: 65, stress: 52, energy: 70 },
    { day: "Wed", sleep: 65, mood: 58, stress: 58, energy: 62 },
    { day: "Thu", sleep: 62, mood: 55, stress: 62, energy: 58 },
    { day: "Fri", sleep: 64, mood: 60, stress: 55, energy: 65 },
    { day: "Sat", sleep: 78, mood: 72, stress: 40, energy: 78 },
    { day: "Sun", sleep: 72, mood: 70, stress: 42, energy: 74 },
  ],
};