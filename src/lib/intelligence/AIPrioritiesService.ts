// AI Health Priorities Service - Dynamic Priority Generation
// Replaces static recommendations with AI-generated priorities based on real health data

import { HealthScoreResult, AIPriority } from "./types";

export type { AIPriority };

export interface PrioritiesAnalysis {
  priorities: AIPriority[];
  overallHealthInsight: string;
  topRecommendation: string;
  timestamp: Date;
}

export class AIPrioritiesService {
  // Legacy interface for backward compatibility
  static generatePriorities(params: {
    checkInHistory: Array<{
      date: Date;
      sleepHours: number;
      sleepQuality: string;
      mood: string;
      stressLevel: string;
      energyLevel: string;
      exerciseCompleted: boolean;
      symptoms: string[];
    }>;
    hydrationProgress: number;
    medicationAdherence: number;
  }): AIPriority[] {
    const mockHealthScore: HealthScoreResult = {
      score: 75,
      previousScore: 73,
      change: 2,
      contributions: [],
      factors: {
        sleep: 75,
        energy: 75,
        mood: 75,
        stress: 75,
        exercise: 75,
        hydration: params.hydrationProgress,
        medication: params.medicationAdherence,
        symptoms: 80,
      },
      generatedAt: new Date(),
    };

    const analysis = AIPrioritiesService.analyzeAndGeneratePriorities({
      healthScore: mockHealthScore,
      checkInHistory: params.checkInHistory,
      hydrationProgress: params.hydrationProgress,
      medicationAdherence: params.medicationAdherence,
      risks: [],
    });

    return analysis.priorities;
  }

  static analyzeAndGeneratePriorities(params: {
    healthScore: HealthScoreResult;
    checkInHistory: Array<{
      date: Date;
      sleepHours: number;
      sleepQuality: string;
      mood: string;
      stressLevel: string;
      energyLevel: string;
      exerciseCompleted: boolean;
      symptoms: string[];
    }>;
    hydrationProgress: number;
    medicationAdherence: number;
    risks: Array<{ title: string; severity: string; confidence: number }>;
  }): PrioritiesAnalysis {
    const { healthScore, checkInHistory, hydrationProgress, medicationAdherence, risks } = params;

    const priorities: AIPriority[] = [];

    // Analyze sleep
    const sleepAnalysis = this.analyzeSleep(checkInHistory, healthScore);
    if (sleepAnalysis.shouldInclude && sleepAnalysis.priority) {
      priorities.push(sleepAnalysis.priority);
    }

    // Analyze hydration
    const hydrationAnalysis = this.analyzeHydration(hydrationProgress, checkInHistory);
    if (hydrationAnalysis.shouldInclude && hydrationAnalysis.priority) {
      priorities.push(hydrationAnalysis.priority);
    }

    // Analyze stress
    const stressAnalysis = this.analyzeStress(checkInHistory, healthScore);
    if (stressAnalysis.shouldInclude && stressAnalysis.priority) {
      priorities.push(stressAnalysis.priority);
    }

    // Analyze exercise
    const exerciseAnalysis = this.analyzeExercise(checkInHistory, healthScore);
    if (exerciseAnalysis.shouldInclude && exerciseAnalysis.priority) {
      priorities.push(exerciseAnalysis.priority);
    }

    // Analyze mood
    const moodAnalysis = this.analyzeMood(checkInHistory, healthScore);
    if (moodAnalysis.shouldInclude && moodAnalysis.priority) {
      priorities.push(moodAnalysis.priority);
    }

    // Analyze medication
    const medicationAnalysis = this.analyzeMedication(medicationAdherence, checkInHistory);
    if (medicationAnalysis.shouldInclude && medicationAnalysis.priority) {
      priorities.push(medicationAnalysis.priority);
    }

    // Sort by potential gain (highest first)
    priorities.sort((a, b) => b.potentialGain - a.potentialGain);

    // Take top 4
    const topPriorities = priorities.slice(0, 4);

    const overallInsight = this.generateOverallInsight(topPriorities, healthScore);
    const topRecommendation = topPriorities[0]
      ? `Focus on ${topPriorities[0].title.toLowerCase()} first - could improve your score by ${topPriorities[0].potentialGain} points`
      : "Your health metrics are balanced. Maintain your current habits.";

    return {
      priorities: topPriorities,
      overallHealthInsight: overallInsight,
      topRecommendation,
      timestamp: new Date(),
    };
  }

  private static analyzeSleep(
    checkInHistory: Array<{ date: Date; sleepHours: number; sleepQuality: string }>,
    healthScore: HealthScoreResult
  ): { shouldInclude: boolean; priority: AIPriority | null } {
    const recentCheckIns = checkInHistory.slice(0, 7);
    if (recentCheckIns.length === 0) {
      return { shouldInclude: false, priority: null };
    }

    const avgSleepHours = recentCheckIns.reduce((sum, c) => sum + c.sleepHours, 0) / recentCheckIns.length;
    const sleepScore = healthScore.factors.sleep;

    // Calculate trend
    const firstHalf = recentCheckIns.slice(0, Math.floor(recentCheckIns.length / 2));
    const secondHalf = recentCheckIns.slice(Math.floor(recentCheckIns.length / 2));
    const firstAvg = firstHalf.reduce((sum, c) => sum + c.sleepHours, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, c) => sum + c.sleepHours, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg + 0.3 ? "improving" : secondAvg < firstAvg - 0.3 ? "declining" : "stable";

    const sleepQualityMap: Record<string, number> = { poor: 0.4, fair: 0.65, good: 0.85, excellent: 1.0 };
    const avgQuality = recentCheckIns.reduce((sum, c) => sum + (sleepQualityMap[c.sleepQuality] || 0.7), 0) / recentCheckIns.length;

    const shouldInclude = sleepScore < 75 || avgSleepHours < 7 || avgQuality < 0.7;
    if (!shouldInclude) {
      return { shouldInclude: false, priority: null };
    }

    const deficit = 100 - sleepScore;
    const potentialGain = Math.round(deficit * 0.25);
    const confidence = Math.min(95, Math.max(60, 100 - deficit / 2));
    const severity = sleepScore < 50 ? "critical" : sleepScore < 65 ? "high" : sleepScore < 75 ? "medium" : "low";

    return {
      shouldInclude: true,
      priority: {
        id: "priority-sleep",
        title: "Sleep Quality",
        category: "sleep",
        description: avgSleepHours < 7
          ? `Getting ${avgSleepHours.toFixed(1)}h of sleep instead of recommended 7-9h is affecting your recovery and cognitive performance.`
          : `Sleep quality score of ${sleepScore} indicates room for improvement in sleep hygiene and consistency.`,
        currentScore: sleepScore,
        targetScore: Math.min(100, sleepScore + potentialGain),
        potentialGain,
        confidence,
        severity,
        timeToImprove: "5-7 days with consistent sleep schedule",
        actionSteps: [
          "Maintain consistent bedtime (within 30 minutes)",
          "Aim for 7-9 hours of sleep",
          "Avoid screens 1 hour before bed",
          "Keep bedroom cool and dark",
        ],
        healthImpact: potentialGain > 10 ? "high" : potentialGain > 5 ? "medium" : "low",
        icon: "Moon",
        trend,
      },
    };
  }

  private static analyzeHydration(
    hydrationProgress: number,
    checkInHistory: Array<{ date: Date; stressLevel: string }>
  ): { shouldInclude: boolean; priority: AIPriority } {
    const shouldInclude = hydrationProgress < 85;
    const deficit = 100 - hydrationProgress;
    const potentialGain = Math.round(deficit * 0.15);
    const confidence = Math.min(92, 50 + hydrationProgress / 2);
    const severity = hydrationProgress < 40 ? "critical" : hydrationProgress < 60 ? "high" : hydrationProgress < 75 ? "medium" : "low";

    return {
      shouldInclude,
      priority: {
        id: "priority-hydration",
        title: "Hydration",
        category: "hydration",
        description: `Current hydration at ${hydrationProgress}% of daily goal. Adequate water intake supports energy, cognition, and physical performance.`,
        currentScore: hydrationProgress,
        targetScore: 100,
        potentialGain,
        confidence,
        severity,
        timeToImprove: "2-3 days with consistent hydration habits",
        actionSteps: [
          "Drink 250ml water first thing in the morning",
          "Set hourly hydration reminders",
          "Track water intake with each meal",
        ],
        healthImpact: potentialGain > 8 ? "high" : "medium",
        icon: "Droplets",
        trend: "declining",
      },
    };
  }

  private static analyzeStress(
    checkInHistory: Array<{ date: Date; stressLevel: string }>,
    healthScore: HealthScoreResult
  ): { shouldInclude: boolean; priority: AIPriority } {
    const recentCheckIns = checkInHistory.slice(0, 7);
    if (recentCheckIns.length === 0) {
      return { shouldInclude: false, priority: null as any };
    }

    const stressScore = healthScore.factors.stress;
    const stressMap: Record<string, number> = { very_stressful: 20, busy: 50, normal: 75, relaxed: 100 };
    const avgStress = recentCheckIns.reduce((sum, c) => sum + (stressMap[c.stressLevel] || 75), 0) / recentCheckIns.length;

    const shouldInclude = avgStress < 70 || stressScore < 70;
    const deficit = 100 - stressScore;
    const potentialGain = Math.round(deficit * 0.18);
    const confidence = Math.min(90, 55 + avgStress / 2);
    const severity = stressScore < 40 ? "critical" : stressScore < 55 ? "high" : stressScore < 70 ? "medium" : "low";

    return {
      shouldInclude,
      priority: {
        id: "priority-stress",
        title: "Stress Management",
        category: "stress",
        description: `Stress levels elevated at ${Math.round(avgStress)}%. Chronic stress impacts sleep, immunity, and cardiovascular health.`,
        currentScore: stressScore,
        targetScore: Math.min(100, stressScore + potentialGain),
        potentialGain,
        confidence,
        severity,
        timeToImprove: "1-2 weeks with consistent stress management",
        actionSteps: [
          "Practice 10 minutes of deep breathing daily",
          "Schedule regular breaks during work",
          "Engage in physical activity to reduce cortisol",
        ],
        healthImpact: potentialGain > 12 ? "high" : "medium",
        icon: "Brain",
        trend: avgStress < 60 ? "declining" : "stable",
      },
    };
  }

  private static analyzeExercise(
    checkInHistory: Array<{ date: Date; exerciseCompleted: boolean }>,
    healthScore: HealthScoreResult
  ): { shouldInclude: boolean; priority: AIPriority } {
    const recentCheckIns = checkInHistory.slice(0, 7);
    if (recentCheckIns.length === 0) {
      return { shouldInclude: false, priority: null as any };
    }

    const exerciseDays = recentCheckIns.filter((c) => c.exerciseCompleted).length;
    const exerciseScore = healthScore.factors.exercise;
    const shouldInclude = exerciseDays < 4 || exerciseScore < 70;

    const deficit = 100 - exerciseScore;
    const potentialGain = Math.round(deficit * 0.12);
    const confidence = Math.min(88, 60 + exerciseDays * 5);
    const severity = exerciseDays < 2 ? "critical" : exerciseDays < 3 ? "high" : exerciseDays < 4 ? "medium" : "low";

    return {
      shouldInclude,
      priority: {
        id: "priority-exercise",
        title: "Physical Activity",
        category: "exercise",
        description: `Only ${exerciseDays} days of exercise in the past week. Regular physical activity improves mood, energy, and long-term health outcomes.`,
        currentScore: exerciseScore,
        targetScore: Math.min(100, exerciseScore + potentialGain),
        potentialGain,
        confidence,
        severity,
        timeToImprove: "2-3 weeks to establish consistent routine",
        actionSteps: [
          "Schedule workouts like important meetings",
          "Start with 20-minute sessions",
          "Mix cardio and strength training",
        ],
        healthImpact: potentialGain > 6 ? "high" : "medium",
        icon: "Zap",
        trend: exerciseDays < 3 ? "declining" : "stable",
      },
    };
  }

  private static analyzeMood(
    checkInHistory: Array<{ date: Date; mood: string }>,
    healthScore: HealthScoreResult
  ): { shouldInclude: boolean; priority: AIPriority } {
    const recentCheckIns = checkInHistory.slice(0, 7);
    if (recentCheckIns.length === 0) {
      return { shouldInclude: false, priority: null as any };
    }

    const moodScore = healthScore.factors.mood;
    const moodMap: Record<string, number> = { poor: 30, okay: 55, good: 80, great: 100 };
    const avgMood = recentCheckIns.reduce((sum, c) => sum + (moodMap[c.mood] || 55), 0) / recentCheckIns.length;

    const shouldInclude = avgMood < 65 || moodScore < 70;
    const deficit = 100 - moodScore;
    const potentialGain = Math.round(deficit * 0.14);
    const confidence = Math.min(85, 50 + avgMood / 2);
    const severity = moodScore < 45 ? "critical" : moodScore < 60 ? "high" : moodScore < 70 ? "medium" : "low";

    return {
      shouldInclude,
      priority: {
        id: "priority-mood",
        title: "Mood & Wellbeing",
        category: "mood",
        description: `Mood trends showing ${avgMood < 55 ? "challenges" : "room for improvement"}. Mental health affects physical health and vice versa.`,
        currentScore: moodScore,
        targetScore: Math.min(100, moodScore + potentialGain),
        potentialGain,
        confidence,
        severity,
        timeToImprove: "1-3 weeks with consistent mood-boosting activities",
        actionSteps: [
          "Engage in activities you enjoy daily",
          "Maintain social connections",
          "Practice gratitude journaling",
        ],
        healthImpact: potentialGain > 8 ? "high" : "medium",
        icon: "Heart",
        trend: avgMood < 55 ? "declining" : "stable",
      },
    };
  }

  private static analyzeMedication(
    medicationAdherence: number,
    checkInHistory: Array<{ date: Date }>
  ): { shouldInclude: boolean; priority: AIPriority } {
    const shouldInclude = medicationAdherence < 90;
    const deficit = 100 - medicationAdherence;
    const potentialGain = Math.round(deficit * 0.1);
    const confidence = Math.min(95, 70 + medicationAdherence / 3);
    const severity = medicationAdherence < 60 ? "critical" : medicationAdherence < 75 ? "high" : medicationAdherence < 85 ? "medium" : "low";

    return {
      shouldInclude,
      priority: {
        id: "priority-medication",
        title: "Medication Adherence",
        category: "medication",
        description: `Medication adherence at ${medicationAdherence}%. Consistent medication is crucial for treatment effectiveness.`,
        currentScore: medicationAdherence,
        targetScore: 100,
        potentialGain,
        confidence,
        severity,
        timeToImprove: "1 week with proper reminder systems",
        actionSteps: [
          "Set daily medication reminders",
          "Use a pill organizer",
          "Associate medication with daily routine",
        ],
        healthImpact: "high",
        icon: "Pill",
        trend: medicationAdherence < 80 ? "declining" : "stable",
      },
    };
  }

  private static generateOverallInsight(priorities: AIPriority[], healthScore: HealthScoreResult): string {
    if (priorities.length === 0) {
      return "Your health metrics are well-balanced. Continue maintaining your current healthy habits.";
    }

    const topPriority = priorities[0];
    const criticalCount = priorities.filter((p) => p.severity === "critical" || p.severity === "high").length;

    if (criticalCount >= 2) {
      return `${criticalCount} health areas need immediate attention. Focus on ${topPriority?.title.toLowerCase() || "your top priority"} first for maximum impact.`;
    }

    if (topPriority && topPriority.severity === "critical") {
      return `Critical: ${topPriority.title} requires immediate attention. ${topPriority.description.substring(0, 100)}...`;
    }

    return `Your health score of ${healthScore.score} can improve by ${priorities.reduce((sum, p) => sum + p.potentialGain, 0)} points by addressing these ${priorities.length} areas.`;
  }
}