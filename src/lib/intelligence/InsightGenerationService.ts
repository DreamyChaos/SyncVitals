// AI Insight Generator - Data-Driven Health Insights

import {
  CheckInData,
  AIInsight,
  DetectedRisk,
  SCORE_WEIGHTS,
} from "./types";

interface TrendDirection {
  direction: "up" | "down" | "stable";
  percentChange: number;
}

export class InsightGenerationService {
  /**
   * Analyze sleep trend and generate insight
   */
  static analyzeSleepTrend(checkIns: CheckInData[]): AIInsight | null {
    if (checkIns.length < 3) return null;

    const recentDays = checkIns.slice(0, 3);
    const previousDays = checkIns.slice(3, 6);

    if (previousDays.length === 0) return null;

    const recentAvg = recentDays.reduce((sum, d) => sum + d.sleepHours, 0) / recentDays.length;
    const previousAvg = previousDays.reduce((sum, d) => sum + d.sleepHours, 0) / previousDays.length;
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (Math.abs(change) < 10) {
      return {
        id: `insight-sleep-stable-${Date.now()}`,
        category: "Sleep",
        text: `Your sleep duration has remained stable at around ${Math.round(recentAvg)} hours. Consistency in sleep patterns supports better health outcomes.`,
        confidence: 85,
        supportingData: [
          `Average: ${Math.round(recentAvg)}h over ${recentDays.length} days`,
          `Variance: ${Math.abs(change).toFixed(0)}%`,
        ],
        generatedAt: new Date(),
      };
    }

    if (change > 10) {
      return {
        id: `insight-sleep-up-${Date.now()}`,
        category: "Sleep",
        text: `Great progress! Your sleep duration has increased by ${Math.abs(change).toFixed(0)}% over the last few days. More sleep is associated with better recovery and cognitive function.`,
        confidence: 88,
        supportingData: [
          `Previous avg: ${previousAvg.toFixed(1)}h`,
          `Current avg: ${recentAvg.toFixed(1)}h`,
          `Change: +${change.toFixed(0)}%`,
        ],
        generatedAt: new Date(),
      };
    }

    // Check if stress is increasing while sleep is decreasing
    const recentStress = recentDays.reduce((sum, d) => {
      const s: Record<string, number> = { very_stressful: 4, busy: 3, normal: 2, relaxed: 1 };
      return sum + s[d.stressLevel];
    }, 0) / recentDays.length;
    const previousStress = previousDays.reduce((sum, d) => {
      const s: Record<string, number> = { very_stressful: 4, busy: 3, normal: 2, relaxed: 1 };
      return sum + s[d.stressLevel];
    }, 0) / previousDays.length;

    if (recentStress > previousStress) {
      return {
        id: `insight-sleep-down-stress-${Date.now()}`,
        category: "Sleep",
        text: `Your sleep quality declined over the last three days while stress levels increased. This pattern is associated with lower energy scores and reduced cognitive performance.`,
        confidence: 82,
        supportingData: [
          `Sleep change: ${change.toFixed(0)}%`,
          `Stress trend: ${recentStress > previousStress ? "increasing" : "stable"}`,
        ],
        generatedAt: new Date(),
      };
    }

    return {
      id: `insight-sleep-down-${Date.now()}`,
      category: "Sleep",
      text: `Your sleep duration has decreased by ${Math.abs(change).toFixed(0)}% recently. This may be affecting your energy and overall health score.`,
      confidence: 80,
      supportingData: [
        `Previous avg: ${previousAvg.toFixed(1)}h`,
        `Current avg: ${recentAvg.toFixed(1)}h`,
        `Change: ${change.toFixed(0)}%`,
      ],
      generatedAt: new Date(),
    };
  }

  /**
   * Analyze hydration and generate insight
   */
  static analyzeHydration(currentProgress: number, previousProgress: number): AIInsight | null {
    const change = currentProgress - previousProgress;

    if (change > 15) {
      return {
        id: `insight-hydration-up-${Date.now()}`,
        category: "Hydration",
        text: `Hydration improved by ${Math.abs(change).toFixed(0)}% compared to the previous period. Better hydration supports cognitive function and energy levels.`,
        confidence: 85,
        supportingData: [
          `Current: ${currentProgress}%`,
          `Previous: ${previousProgress}%`,
          `Change: +${change.toFixed(0)}%`,
        ],
        generatedAt: new Date(),
      };
    }

    if (change < -15) {
      return {
        id: `insight-hydration-down-${Date.now()}`,
        category: "Hydration",
        text: `Hydration has dropped by ${Math.abs(change).toFixed(0)}%. Staying well-hydrated is linked to improved mood and energy. Consider setting regular drinking reminders.`,
        confidence: 88,
        supportingData: [
          `Current: ${currentProgress}%`,
          `Previous: ${previousProgress}%`,
          `Change: ${change.toFixed(0)}%`,
        ],
        generatedAt: new Date(),
      };
    }

    if (currentProgress < 60) {
      return {
        id: `insight-hydration-low-${Date.now()}`,
        category: "Hydration",
        text: `Your hydration is currently below target at ${currentProgress}%. Increasing water intake could improve your energy and focus throughout the day.`,
        confidence: 90,
        supportingData: [
          `Current progress: ${currentProgress}%`,
          `Target: 100%`,
        ],
        generatedAt: new Date(),
      };
    }

    return {
      id: `insight-hydration-stable-${Date.now()}`,
      category: "Hydration",
      text: `Hydration consistency appears steady. Keep maintaining your current water intake habits.`,
      confidence: 75,
      supportingData: [
        `Current: ${currentProgress}%`,
      ],
      generatedAt: new Date(),
    };
  }

  /**
   * Analyze mood and correlation with activity
   */
  static analyzeMoodCorrelation(checkIns: CheckInData[]): AIInsight | null {
    if (checkIns.length < 5) return null;

    const moodMap: Record<string, number> = { poor: 1, okay: 2, good: 3, great: 4 };
    const exerciseMap = { true: 1, false: 0 };

    const recentData = checkIns.slice(0, 5);

    const daysWithExercise = recentData.filter((d) => d.exerciseCompleted);
    const daysWithout = recentData.filter((d) => !d.exerciseCompleted);

    if (daysWithExercise.length >= 2 && daysWithout.length >= 2) {
      const avgMoodWithExercise =
        daysWithExercise.reduce((sum, d) => sum + moodMap[d.mood], 0) / daysWithExercise.length;
      const avgMoodWithout =
        daysWithout.reduce((sum, d) => sum + moodMap[d.mood], 0) / daysWithout.length;

      if (Math.abs(avgMoodWithExercise - avgMoodWithout) >= 0.5) {
        const improvement = avgMoodWithExercise > avgMoodWithout;
        return {
          id: `insight-mood-exercise-${Date.now()}`,
          category: "Mood",
          text: improvement
            ? `Your mood ratings are ${((avgMoodWithExercise - avgMoodWithout) / avgMoodWithout * 100).toFixed(0)}% higher on days when you exercise. This suggests a positive mood-exercise connection for you.`
            : `Interestingly, your mood ratings appear slightly lower on exercise days. This could be due to timing or intensity of workouts.`,
          confidence: 72,
          supportingData: [
            `Avg mood with exercise: ${avgMoodWithExercise.toFixed(1)}`,
            `Avg mood without exercise: ${avgMoodWithout.toFixed(1)}`,
            `Based on ${recentData.length} days of data`,
          ],
          generatedAt: new Date(),
        };
      }
    }

    // Check for declining mood trend
    const firstHalf = recentData.slice(2);
    const secondHalf = recentData.slice(0, 2);
    const firstAvg = firstHalf.reduce((sum, d) => sum + moodMap[d.mood], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + moodMap[d.mood], 0) / secondHalf.length;

    if (secondAvg < firstAvg - 0.3) {
      return {
        id: `insight-mood-declining-${Date.now()}`,
        category: "Mood",
        text: `Your mood ratings have shown a slight declining trend recently. Consider engaging in activities you enjoy or discussing any persistent low mood with a healthcare provider.`,
        confidence: 75,
        supportingData: [
          `Recent average mood: ${secondAvg.toFixed(1)}`,
          `Previous average mood: ${firstAvg.toFixed(1)}`,
        ],
        generatedAt: new Date(),
      };
    }

    return null;
  }

  /**
   * Analyze medication adherence
   */
  static analyzeMedicationAdherence(
    currentAdherence: number,
    previousAdherence: number
  ): AIInsight | null {
    const change = currentAdherence - previousAdherence;

    if (change > 10) {
      return {
        id: `insight-medication-up-${Date.now()}`,
        category: "Medication",
        text: `Medication adherence improved by ${Math.abs(change).toFixed(0)}% this period. Consistent medication-taking supports better treatment outcomes.`,
        confidence: 92,
        supportingData: [
          `Current adherence: ${currentAdherence}%`,
          `Previous adherence: ${previousAdherence}%`,
        ],
        generatedAt: new Date(),
      };
    }

    if (change < -10 && currentAdherence < 80) {
      return {
        id: `insight-medication-down-${Date.now()}`,
        category: "Medication",
        text: `Medication adherence has dropped to ${currentAdherence}%. Setting reminders or linking medication to daily routines can help improve consistency.`,
        confidence: 90,
        supportingData: [
          `Current adherence: ${currentAdherence}%`,
          `Previous adherence: ${previousAdherence}%`,
        ],
        generatedAt: new Date(),
      };
    }

    return null;
  }

  /**
   * Analyze stress patterns
   */
  static analyzeStressPatterns(checkIns: CheckInData[]): AIInsight | null {
    if (checkIns.length < 4) return null;

    const stressMap: Record<string, number> = { very_stressful: 4, busy: 3, normal: 2, relaxed: 1 };

    const recentDays = checkIns.slice(0, 2);
    const previousDays = checkIns.slice(2, 4);

    const recentStress = recentDays.reduce((sum, d) => sum + stressMap[d.stressLevel], 0) / recentDays.length;
    const previousStress = previousDays.reduce((sum, d) => sum + stressMap[d.stressLevel], 0) / previousDays.length;

    if (recentStress > 2.5 && recentStress > previousStress) {
      const energyMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
      const recentEnergy = recentDays.reduce((sum, d) => sum + energyMap[d.energyLevel], 0) / recentDays.length;

      if (recentEnergy < 2) {
        return {
          id: `insight-stress-energy-${Date.now()}`,
          category: "Stress",
          text: `High stress levels appear to be affecting your energy. When stress increases without corresponding rest, it can create a cycle of fatigue. Consider stress-reduction techniques.`,
          confidence: 78,
          supportingData: [
            `Stress level: ${recentDays[0].stressLevel.replace("_", " ")}`,
            `Energy level: ${recentDays[0].energyLevel}`,
          ],
          generatedAt: new Date(),
        };
      }

      return {
        id: `insight-stress-high-${Date.now()}`,
        category: "Stress",
        text: `Your stress levels have been elevated recently. While some stress is normal, sustained high stress can impact sleep, mood, and immune function.`,
        confidence: 82,
        supportingData: [
          `Current stress: ${recentDays[0].stressLevel.replace("_", " ")}`,
        ],
        generatedAt: new Date(),
      };
    }

    if (recentStress < 2 && recentStress < previousStress) {
      return {
        id: `insight-stress-low-${Date.now()}`,
        category: "Stress",
        text: `Your stress management appears effective. Lower stress levels are associated with better sleep quality and improved overall well-being.`,
        confidence: 85,
        supportingData: [
          `Current stress: ${recentDays[0].stressLevel.replace("_", " ")}`,
          `Previous stress: ${previousDays[0].stressLevel.replace("_", " ")}`,
        ],
        generatedAt: new Date(),
      };
    }

    return null;
  }

  /**
   * Analyze symptom patterns
   */
  static analyzeSymptoms(checkIns: CheckInData[]): AIInsight | null {
    if (checkIns.length < 3) return null;

    const recentDays = checkIns.slice(0, 3);
    const totalSymptoms = recentDays.reduce((sum, d) => sum + d.symptoms.length, 0);

    if (totalSymptoms >= 5) {
      // Find most common symptom
      const symptomCounts: Record<string, number> = {};
      for (const checkIn of recentDays) {
        for (const symptom of checkIn.symptoms) {
          if (symptom !== "none") {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          }
        }
      }

      const mostCommon = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])[0];

      if (mostCommon) {
        const symptomLabels: Record<string, string> = {
          headache: "headaches",
          fatigue: "fatigue",
          body_pain: "body pain",
          dizziness: "dizziness",
          nausea: "nausea",
        };

        return {
          id: `insight-symptoms-${Date.now()}`,
          category: "Health",
          text: `You've reported ${mostCommon[1]} instances of ${symptomLabels[mostCommon[0]] || mostCommon[0]} over the last 3 days. If these persist, consider discussing with a healthcare provider.`,
          confidence: 80,
          supportingData: [
            `Symptom: ${mostCommon[0]}`,
            `Occurrences: ${mostCommon[1]}`,
            `Total symptoms reported: ${totalSymptoms}`,
          ],
          generatedAt: new Date(),
        };
      }
    }

    if (totalSymptoms === 0) {
      return {
        id: `insight-symptoms-none-${Date.now()}`,
        category: "Health",
        text: `No symptoms reported over the last 3 days. This is a positive indicator of good health and recovery.`,
        confidence: 90,
        supportingData: [
          `Symptom-free days: ${recentDays.length}`,
        ],
        generatedAt: new Date(),
      };
    }

    return null;
  }

  /**
   * Generate all relevant insights
   */
  static generateInsights(params: {
    checkInHistory: CheckInData[];
    currentHydration: number;
    previousHydration: number;
    currentMedicationAdherence: number;
    previousMedicationAdherence: number;
    activeRisks: DetectedRisk[];
  }): AIInsight[] {
    const insights: AIInsight[] = [];

    const sleepInsight = this.analyzeSleepTrend(params.checkInHistory);
    if (sleepInsight) insights.push(sleepInsight);

    const hydrationInsight = this.analyzeHydration(params.currentHydration, params.previousHydration);
    if (hydrationInsight) insights.push(hydrationInsight);

    const moodInsight = this.analyzeMoodCorrelation(params.checkInHistory);
    if (moodInsight) insights.push(moodInsight);

    const medicationInsight = this.analyzeMedicationAdherence(
      params.currentMedicationAdherence,
      params.previousMedicationAdherence
    );
    if (medicationInsight) insights.push(medicationInsight);

    const stressInsight = this.analyzeStressPatterns(params.checkInHistory);
    if (stressInsight) insights.push(stressInsight);

    const symptomInsight = this.analyzeSymptoms(params.checkInHistory);
    if (symptomInsight) insights.push(symptomInsight);

    // If we have an active risk, generate a risk-specific insight
    if (params.activeRisks.length > 0) {
      const topRisk = params.activeRisks[0];
      insights.push({
        id: `insight-risk-${topRisk.type}-${Date.now()}`,
        category: "Risk Alert",
        text: topRisk.description,
        confidence: topRisk.confidence,
        supportingData: topRisk.contributingFactors.map((f) => f.description),
        generatedAt: new Date(),
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }
}