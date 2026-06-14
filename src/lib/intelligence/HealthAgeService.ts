// Health Age Engine - Predictive Biological Age Calculator

import {
  HealthAgeResult,
  CheckInData,
  HydrationLog,
  MedicationLog,
} from "./types";

interface HealthTrend {
  direction: "improving" | "stable" | "declining";
  changePercent: number;
  confidence: number;
}

interface TrendAnalysis {
  sleepTrend: HealthTrend;
  stressTrend: HealthTrend;
  energyTrend: HealthTrend;
  hydrationTrend: HealthTrend;
  exerciseTrend: HealthTrend;
}

export class HealthAgeService {
  /**
   * Analyze trends over a period
   */
  static analyzeTrends(data: CheckInData[]): TrendAnalysis {
    const recentData = data.slice(0, 7); // Last 7 days
    const olderData = data.slice(7, 14); // Previous 7 days

    if (olderData.length === 0) {
      return {
        sleepTrend: { direction: "stable", changePercent: 0, confidence: 50 },
        stressTrend: { direction: "stable", changePercent: 0, confidence: 50 },
        energyTrend: { direction: "stable", changePercent: 0, confidence: 50 },
        hydrationTrend: { direction: "stable", changePercent: 0, confidence: 50 },
        exerciseTrend: { direction: "stable", changePercent: 0, confidence: 50 },
      };
    }

    const avgSleepRecent = recentData.reduce((sum, d) => sum + d.sleepHours, 0) / recentData.length;
    const avgSleepOlder = olderData.reduce((sum, d) => sum + d.sleepHours, 0) / olderData.length;
    const sleepChange = avgSleepOlder > 0 ? ((avgSleepRecent - avgSleepOlder) / avgSleepOlder) * 100 : 0;

    const stressMap = { very_stressful: 4, busy: 3, normal: 2, relaxed: 1 };
    const avgStressRecent = recentData.reduce((sum, d) => sum + stressMap[d.stressLevel], 0) / recentData.length;
    const avgStressOlder = olderData.reduce((sum, d) => sum + stressMap[d.stressLevel], 0) / olderData.length;
    const stressChange = avgStressOlder > 0 ? ((avgStressOlder - avgStressRecent) / avgStressOlder) * 100 : 0;

    const energyMap = { low: 1, medium: 2, high: 3 };
    const avgEnergyRecent = recentData.reduce((sum, d) => sum + energyMap[d.energyLevel], 0) / recentData.length;
    const avgEnergyOlder = olderData.reduce((sum, d) => sum + energyMap[d.energyLevel], 0) / olderData.length;
    const energyChange = avgEnergyOlder > 0 ? ((avgEnergyRecent - avgEnergyOlder) / avgEnergyOlder) * 100 : 0;

    const exerciseRecent = recentData.filter((d) => d.exerciseCompleted).length / recentData.length;
    const exerciseOlder = olderData.filter((d) => d.exerciseCompleted).length / olderData.length;
    const exerciseChange = exerciseOlder > 0 ? ((exerciseRecent - exerciseOlder) / exerciseOlder) * 100 : 0;

    const toTrend = (change: number): HealthTrend["direction"] => {
      if (change > 5) return "improving";
      if (change < -5) return "declining";
      return "stable";
    };

    return {
      sleepTrend: {
        direction: toTrend(sleepChange),
        changePercent: Math.round(sleepChange),
        confidence: Math.min(Math.abs(sleepChange) * 3 + 50, 95),
      },
      stressTrend: {
        direction: toTrend(stressChange),
        changePercent: Math.round(stressChange),
        confidence: Math.min(Math.abs(stressChange) * 3 + 50, 95),
      },
      energyTrend: {
        direction: toTrend(energyChange),
        changePercent: Math.round(energyChange),
        confidence: Math.min(Math.abs(energyChange) * 3 + 50, 95),
      },
      exerciseTrend: {
        direction: toTrend(exerciseChange),
        changePercent: Math.round(exerciseChange),
        confidence: Math.min(Math.abs(exerciseChange) * 3 + 50, 95),
      },
      hydrationTrend: { direction: "stable", changePercent: 0, confidence: 50 },
    };
  }

  /**
   * Calculate hydration adherence from logs
   */
  static calculateHydrationAdherence(logs: HydrationLog[]): number {
    if (logs.length === 0) return 75; // Default
    const avgProgress = logs.reduce((sum, l) => sum + (l.amount / l.goal) * 100, 0) / logs.length;
    return Math.round(Math.min(avgProgress, 100));
  }

  /**
   * Calculate medication adherence from logs
   */
  static calculateMedicationAdherence(logs: MedicationLog[]): number {
    if (logs.length === 0) return 85; // Default
    const taken = logs.filter((l) => l.status === "taken").length;
    return Math.round((taken / logs.length) * 100);
  }

  /**
   * Calculate Health Age based on multiple factors
   */
  static calculateHealthAge(
    chronologicalAge: number,
    trends: TrendAnalysis,
    hydrationAdherence: number,
    medicationAdherence: number
  ): HealthAgeResult {
    // Base calculation starts at chronological age
    let ageAdjustment = 0;
    const explanations: string[] = [];

    // Sleep impact (significant factor)
    if (trends.sleepTrend.direction === "improving") {
      ageAdjustment -= 2;
      explanations.push("Consistent quality sleep reducing biological age");
    } else if (trends.sleepTrend.direction === "declining") {
      ageAdjustment += 2;
      explanations.push("Sleep patterns contributing to accelerated aging");
    } else {
      explanations.push("Sleep patterns within normal range");
    }

    // Stress impact (high impact)
    if (trends.stressTrend.direction === "improving") {
      ageAdjustment -= 1.5;
      explanations.push("Effective stress management supporting longevity");
    } else if (trends.stressTrend.direction === "declining") {
      ageAdjustment += 2;
      explanations.push("Elevated stress levels affecting biological age");
    }

    // Energy trend (reflects overall vitality)
    if (trends.energyTrend.direction === "improving") {
      ageAdjustment -= 1;
      explanations.push("Improving energy levels indicate better vitality");
    } else if (trends.energyTrend.direction === "declining") {
      ageAdjustment += 1;
      explanations.push("Declining energy may signal increased biological stress");
    }

    // Exercise trend (strong impact on aging)
    if (trends.exerciseTrend.direction === "improving") {
      ageAdjustment -= 1.5;
      explanations.push("Regular exercise supporting healthy aging");
    } else if (trends.exerciseTrend.direction === "declining") {
      ageAdjustment += 1.5;
      explanations.push("Reduced activity levels affecting fitness age");
    }

    // Hydration adherence
    if (hydrationAdherence >= 85) {
      ageAdjustment -= 0.5;
      explanations.push("Good hydration supporting cellular health");
    } else if (hydrationAdherence < 60) {
      ageAdjustment += 0.5;
      explanations.push("Below-target hydration may affect biological age");
    }

    // Medication adherence
    if (medicationAdherence >= 90) {
      ageAdjustment -= 0.3;
      explanations.push("Consistent medication routine supporting health");
    } else if (medicationAdherence < 70) {
      ageAdjustment += 0.5;
      explanations.push("Inconsistent medication affecting treatment efficacy");
    }

    // Clamp adjustment to reasonable range
    ageAdjustment = Math.max(-8, Math.min(8, ageAdjustment));

    const healthAge = Math.round(chronologicalAge + ageAdjustment);
    const difference = chronologicalAge - healthAge;

    return {
      healthAge,
      chronologicalAge,
      difference,
      factors: {
        sleepTrend: trends.sleepTrend.changePercent,
        exerciseTrend: trends.exerciseTrend.changePercent,
        stressTrend: trends.stressTrend.changePercent,
        hydrationAdherence,
        medicationAdherence,
        energyTrend: trends.energyTrend.changePercent,
      },
      explanations,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate detailed explanation for health age difference
   */
  static explainHealthAgeDifference(result: HealthAgeResult): {
    positive: string[];
    negative: string[];
    overall: string;
  } {
    const positive: string[] = [];
    const negative: string[] = [];

    if (result.difference > 0) {
      positive.push(`Health habits ${Math.abs(result.difference)} years younger than chronological age`);
      if (result.factors.sleepTrend > 5) positive.push("Sleep consistency improved significantly");
      if (result.factors.exerciseTrend > 5) positive.push("Physical activity increasing");
      if (result.factors.hydrationAdherence >= 80) positive.push("Hydration well-maintained");
      if (result.factors.medicationAdherence >= 90) positive.push("Medication adherence excellent");
    } else if (result.difference < 0) {
      negative.push(`Health age ${Math.abs(result.difference)} years older than chronological age`);
      if (result.factors.sleepTrend < -5) negative.push("Sleep quality declining");
      if (result.factors.stressTrend > 10) negative.push("Stress levels elevated");
      if (result.factors.exerciseTrend < -5) negative.push("Physical activity declining");
      if (result.factors.hydrationAdherence < 60) negative.push("Hydration needs attention");
      if (result.factors.medicationAdherence < 70) negative.push("Medication adherence below target");
    }

    let overall = "";
    if (result.difference >= 2) {
      overall = "Your health habits are supporting a younger biological age. Continue maintaining these positive patterns.";
    } else if (result.difference >= 0) {
      overall = "Your health metrics are aligned with your chronological age. Small improvements in key areas could reduce your health age further.";
    } else if (result.difference >= -2) {
      overall = "Some health factors are contributing to an older biological age. Targeted improvements could help reverse this trend.";
    } else {
      overall = "Multiple health factors are contributing to an elevated biological age. Focus on the key areas below to improve your health age.";
    }

    return { positive, negative, overall };
  }
}