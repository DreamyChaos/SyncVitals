// Health Score Engine - Deterministic Weighted Scoring System

import {
  HealthMetrics,
  HealthScoreResult,
  ScoreContribution,
  SCORE_WEIGHTS,
  SLEEP_QUALITY_MAP,
  ENERGY_MAP,
  MOOD_MAP,
  STRESS_MAP,
  SYMPTOM_SEVERITY_WEIGHTS,
  SleepQuality,
  EnergyLevel,
  Mood,
  StressLevel,
} from "./types";

export class HealthScoreService {
  /**
   * Calculate base score for a single category
   */
  static calculateCategoryScore(
    category: keyof typeof SCORE_WEIGHTS,
    rawValue: number
  ): number {
    const weight = SCORE_WEIGHTS[category];
    return rawValue * weight * 100;
  }

  /**
   * Calculate sleep score from hours and quality
   */
  static calculateSleepScore(hours: number, quality: SleepQuality): number {
    // Optimal sleep: 7-9 hours
    let hoursScore = 1.0;
    if (hours < 5) hoursScore = 0.3;
    else if (hours < 6) hoursScore = 0.5;
    else if (hours < 7) hoursScore = 0.75;
    else if (hours <= 9) hoursScore = 1.0;
    else if (hours <= 10) hoursScore = 0.85;
    else hoursScore = 0.6;

    const qualityScore = SLEEP_QUALITY_MAP[quality];
    return (hoursScore * 0.4 + qualityScore * 0.6);
  }

  /**
   * Calculate energy score
   */
  static calculateEnergyScore(level: EnergyLevel): number {
    return ENERGY_MAP[level];
  }

  /**
   * Calculate mood score
   */
  static calculateMoodScore(mood: Mood): number {
    return MOOD_MAP[mood];
  }

  /**
   * Calculate stress score (inverse - lower stress = higher score)
   */
  static calculateStressScore(level: StressLevel): number {
    return STRESS_MAP[level];
  }

  /**
   * Calculate exercise score
   */
  static calculateExerciseScore(completed: boolean, streak: number = 0): number {
    let baseScore = completed ? 1.0 : 0.0;
    // Streak bonus (caps at +10%)
    const streakBonus = Math.min(streak * 0.02, 0.1);
    return Math.min(baseScore + streakBonus, 1.0);
  }

  /**
   * Calculate hydration score
   */
  static calculateHydrationScore(progress: number): number {
    // Progress is 0-100
    return Math.min(progress / 100, 1.0);
  }

  /**
   * Calculate medication adherence score
   */
  static calculateMedicationScore(adherence: number): number {
    // Adherence is 0-100
    return adherence / 100;
  }

  /**
   * Calculate symptoms penalty
   */
  static calculateSymptomsScore(
    symptoms: string[],
    severityWeights: Record<string, number> = SYMPTOM_SEVERITY_WEIGHTS
  ): number {
    if (symptoms.length === 0) return 1.0;
    if (symptoms.includes("none")) return 1.0;

    let totalSeverity = 0;
    for (const symptom of symptoms) {
      totalSeverity += severityWeights[symptom] || 2;
    }

    // Max severity around 10 symptoms * 5 = 50
    const normalizedSeverity = Math.min(totalSeverity / 50, 1.0);
    // Penalty: 0 symptoms = 1.0, severe = 0.2
    return 1.0 - normalizedSeverity * 0.8;
  }

  /**
   * Generate detailed score contributions
   */
  static generateContributions(
    metrics: HealthMetrics,
    previousMetrics?: HealthMetrics
  ): ScoreContribution[] {
    const contributions: ScoreContribution[] = [];

    // Sleep
    const sleepScore = this.calculateSleepScore(metrics.sleepHours, metrics.sleepQuality);
    const sleepContribution = sleepScore * SCORE_WEIGHTS.sleep;
    contributions.push({
      category: "sleep",
      label: "Sleep Quality",
      value: Math.round(sleepContribution * 100),
      maxValue: 20,
      impact: sleepContribution >= 0.15 ? "positive" : sleepContribution <= 0.08 ? "negative" : "neutral",
      reason: `${metrics.sleepHours}h sleep with ${metrics.sleepQuality} quality`,
    });

    // Energy
    const energyScore = this.calculateEnergyScore(metrics.energyLevel);
    const energyContribution = energyScore * SCORE_WEIGHTS.energy;
    contributions.push({
      category: "energy",
      label: "Energy Level",
      value: Math.round(energyContribution * 100),
      maxValue: 12,
      impact: energyScore >= 0.65 ? "positive" : "negative",
      reason: `Energy currently ${metrics.energyLevel}`,
    });

    // Mood
    const moodScore = this.calculateMoodScore(metrics.mood);
    const moodContribution = moodScore * SCORE_WEIGHTS.mood;
    contributions.push({
      category: "mood",
      label: "Mood",
      value: Math.round(moodContribution * 100),
      maxValue: 12,
      impact: moodScore >= 0.65 ? "positive" : moodScore <= 0.4 ? "negative" : "neutral",
      reason: `Mood rated as ${metrics.mood}`,
    });

    // Stress (inverted - high stress = low score)
    const stressScore = this.calculateStressScore(metrics.stressLevel);
    const stressContribution = stressScore * SCORE_WEIGHTS.stress;
    contributions.push({
      category: "stress",
      label: "Stress Management",
      value: Math.round(stressContribution * 100),
      maxValue: 15,
      impact: stressScore >= 0.65 ? "positive" : stressScore <= 0.35 ? "negative" : "neutral",
      reason: `Stress level: ${metrics.stressLevel.replace("_", " ")}`,
    });

    // Exercise
    const exerciseScore = this.calculateExerciseScore(metrics.exerciseCompleted);
    const exerciseContribution = exerciseScore * SCORE_WEIGHTS.exercise;
    contributions.push({
      category: "exercise",
      label: "Exercise",
      value: Math.round(exerciseContribution * 100),
      maxValue: 10,
      impact: exerciseScore >= 0.8 ? "positive" : exerciseScore <= 0.2 ? "negative" : "neutral",
      reason: metrics.exerciseCompleted ? "Exercise completed today" : "No exercise recorded",
    });

    // Hydration
    const hydrationScore = this.calculateHydrationScore(metrics.hydrationProgress);
    const hydrationContribution = hydrationScore * SCORE_WEIGHTS.hydration;
    contributions.push({
      category: "hydration",
      label: "Hydration",
      value: Math.round(hydrationContribution * 100),
      maxValue: 13,
      impact: hydrationScore >= 0.8 ? "positive" : hydrationScore <= 0.4 ? "negative" : "neutral",
      reason: `${metrics.hydrationProgress}% of daily goal`,
    });

    // Medication
    const medicationScore = this.calculateMedicationScore(metrics.medicationAdherence);
    const medicationContribution = medicationScore * SCORE_WEIGHTS.medication;
    contributions.push({
      category: "medication",
      label: "Medication Adherence",
      value: Math.round(medicationContribution * 100),
      maxValue: 10,
      impact: medicationScore >= 0.9 ? "positive" : medicationScore <= 0.7 ? "negative" : "neutral",
      reason: `${metrics.medicationAdherence}% adherence rate`,
    });

    // Symptoms
    const symptomsScore = this.calculateSymptomsScore(metrics.symptoms);
    const symptomsContribution = symptomsScore * SCORE_WEIGHTS.symptoms;
    contributions.push({
      category: "symptoms",
      label: "Symptoms",
      value: Math.round(symptomsContribution * 100),
      maxValue: 8,
      impact: symptomsScore >= 0.9 ? "positive" : symptomsScore <= 0.6 ? "negative" : "neutral",
      reason: symptomsScore >= 0.9
        ? "No significant symptoms reported"
        : `${metrics.symptomsCount} symptoms reported`,
    });

    return contributions;
  }

  /**
   * Calculate comprehensive health score
   */
  static calculateHealthScore(
    metrics: HealthMetrics,
    previousMetrics?: HealthMetrics
  ): HealthScoreResult {
    const contributions = this.generateContributions(metrics, previousMetrics);

    // Calculate total score
    const totalScore = contributions.reduce((sum, c) => sum + c.value, 0);

    // Calculate factor breakdown
    const factors = {
      sleep: Math.round(this.calculateSleepScore(metrics.sleepHours, metrics.sleepQuality) * 100),
      energy: Math.round(this.calculateEnergyScore(metrics.energyLevel) * 100),
      mood: Math.round(this.calculateMoodScore(metrics.mood) * 100),
      stress: Math.round(this.calculateStressScore(metrics.stressLevel) * 100),
      exercise: Math.round(this.calculateExerciseScore(metrics.exerciseCompleted) * 100),
      hydration: Math.round(this.calculateHydrationScore(metrics.hydrationProgress) * 100),
      medication: metrics.medicationAdherence,
      symptoms: Math.round(this.calculateSymptomsScore(metrics.symptoms) * 100),
    };

    // Calculate previous score if available
    let previousScore = 0;
    let change = 0;
    if (previousMetrics) {
      const prevContributions = this.generateContributions(previousMetrics);
      previousScore = prevContributions.reduce((sum, c) => sum + c.value, 0);
      change = Math.round(totalScore - previousScore);
    }

    return {
      score: Math.round(totalScore),
      previousScore: Math.round(previousScore),
      change,
      contributions,
      factors,
      generatedAt: new Date(),
    };
  }

  /**
   * Get improvement opportunities based on lowest scoring categories
   */
  static getImprovementOpportunities(contributions: ScoreContribution[]): {
    category: string;
    currentValue: number;
    potentialGain: number;
    action: string;
  }[] {
    const sortedByValue = [...contributions]
      .filter((c) => c.impact === "negative" || c.impact === "neutral")
      .sort((a, b) => a.value - b.value);

    const opportunities = sortedByValue.slice(0, 3).map((c) => {
      const maxValue = SCORE_WEIGHTS[c.category as keyof typeof SCORE_WEIGHTS] * 100;
      const potentialGain = Math.round(maxValue - c.value);

      let action = "";
      switch (c.category) {
        case "sleep":
          action = "Aim for 7-9 hours of quality sleep";
          break;
        case "hydration":
          action = "Increase water intake by 1-2 glasses per day";
          break;
        case "stress":
          action = "Practice stress management techniques";
          break;
        case "exercise":
          action = "Add 20-30 minutes of physical activity";
          break;
        case "mood":
          action = "Engage in activities that boost mood";
          break;
        case "energy":
          action = "Improve sleep and nutrition for energy";
          break;
        case "medication":
          action = "Set reminders for medication times";
          break;
        case "symptoms":
          action = "Monitor and address recurring symptoms";
          break;
      }

      return {
        category: c.label,
        currentValue: c.value,
        potentialGain,
        action,
      };
    });

    return opportunities;
  }
}