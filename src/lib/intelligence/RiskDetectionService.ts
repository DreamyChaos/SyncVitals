// Silent Risk Detection Engine - Pattern-Based Risk Identification

import {
  CheckInData,
  DetectedRisk,
  RiskType,
  RiskSeverity,
  ContributingFactor,
} from "./types";

interface RiskThresholds {
  burnout: {
    stressMin: number;
    energyMax: number;
    sleepQualityMax: string;
    consecutiveDays: number;
  };
  fatigue: {
    energyMax: string;
    symptomsMin: number;
    sleepHoursMax: number;
  };
  dehydration: {
    hydrationPercentMax: number;
    consecutiveDays: number;
  };
  medication: {
    adherenceMin: number;
    missedMin: number;
  };
  poorSleep: {
    qualityMax: string;
    hoursMin: number;
    consecutiveDays: number;
  };
}

const DEFAULT_THRESHOLDS: RiskThresholds = {
  burnout: {
    stressMin: 2.5, // Average stress score (normalized)
    energyMax: 1.5, // Low/medium average
    sleepQualityMax: "fair",
    consecutiveDays: 3,
  },
  fatigue: {
    energyMax: "medium",
    symptomsMin: 2,
    sleepHoursMax: 6,
  },
  dehydration: {
    hydrationPercentMax: 50,
    consecutiveDays: 2,
  },
  medication: {
    adherenceMin: 70,
    missedMin: 2,
  },
  poorSleep: {
    qualityMax: "fair",
    hoursMin: 6,
    consecutiveDays: 3,
  },
};

export class RiskDetectionService {
  /**
   * Calculate normalized stress score from stress level
   */
  private static getStressScore(stressLevel: string): number {
    const map: Record<string, number> = {
      relaxed: 1.0,
      normal: 0.7,
      busy: 0.4,
      very_stressful: 0.15,
    };
    return map[stressLevel] || 0.5;
  }

  /**
   * Calculate normalized energy score
   */
  private static getEnergyScore(energyLevel: string): number {
    const map: Record<string, number> = {
      high: 1.0,
      medium: 0.5,
      low: 0.2,
    };
    return map[energyLevel] || 0.5;
  }

  /**
   * Detect Burnout Risk
   */
  static detectBurnoutRisk(
    checkInHistory: CheckInData[],
    thresholds: RiskThresholds["burnout"] = DEFAULT_THRESHOLDS.burnout
  ): DetectedRisk | null {
    if (checkInHistory.length < 3) return null;

    const recentData = checkInHistory.slice(0, thresholds.consecutiveDays);
    if (recentData.length < thresholds.consecutiveDays) return null;

    // Check stress increasing
    const avgStress = recentData.reduce((sum, d) => sum + this.getStressScore(d.stressLevel), 0) / recentData.length;
    const isStressHigh = avgStress < thresholds.stressMin;

    // Check energy decreasing
    const avgEnergy = recentData.reduce((sum, d) => sum + this.getEnergyScore(d.energyLevel), 0) / recentData.length;
    const isEnergyLow = avgEnergy < thresholds.energyMax;

    // Check sleep quality poor
    const poorSleepDays = recentData.filter(
      (d) => d.sleepQuality === "poor" || d.sleepQuality === "fair"
    ).length;
    const isSleepPoor = poorSleepDays >= thresholds.consecutiveDays;

    if (isStressHigh || isEnergyLow || isSleepPoor) {
      const factors: ContributingFactor[] = [];
      let confidence = 50;

      if (isStressHigh) {
        factors.push({
          name: "Elevated Stress",
          value: Math.round((1 - avgStress) * 100),
          impact: -30,
          description: `Average stress level ${Math.round(avgStress * 100)}% (high stress detected)`,
        });
        confidence += 15;
      }

      if (isEnergyLow) {
        factors.push({
          name: "Low Energy",
          value: Math.round(avgEnergy * 100),
          impact: -25,
          description: `Average energy level ${Math.round(avgEnergy * 100)}% (below optimal)`,
        });
        confidence += 12;
      }

      if (isSleepPoor) {
        factors.push({
          name: "Poor Sleep Quality",
          value: Math.round((poorSleepDays / thresholds.consecutiveDays) * 100),
          impact: -20,
          description: `${poorSleepDays} of ${thresholds.consecutiveDays} days with poor sleep`,
        });
        confidence += 10;
      }

      // Determine severity
      let severity: RiskSeverity = "low";
      if (factors.length >= 2 && confidence >= 70) severity = "high";
      else if (factors.length >= 2 || confidence >= 60) severity = "medium";

      return {
        id: `risk-burnout-${Date.now()}`,
        type: "burnout",
        severity,
        confidence: Math.min(confidence, 95),
        title: "Potential Burnout Risk",
        description: "Multiple stress indicators suggest you may be experiencing burnout. Your body is signaling that the current pace may not be sustainable.",
        contributingFactors: factors,
        detectedAt: new Date(),
        trend: isStressHigh && recentData[0].stressLevel === "very_stressful" ? "increasing" : "stable",
      };
    }

    return null;
  }

  /**
   * Detect Fatigue Risk
   */
  static detectFatigueRisk(
    checkInHistory: CheckInData[],
    thresholds: RiskThresholds["fatigue"] = DEFAULT_THRESHOLDS.fatigue
  ): DetectedRisk | null {
    if (checkInHistory.length < 2) return null;

    const recentData = checkInHistory[0]; // Today/yesterday
    const isEnergyLow = recentData.energyLevel === "low" || recentData.energyLevel === "medium";
    const hasSymptoms = recentData.symptoms.length >= thresholds.symptomsMin;
    const poorSleep = recentData.sleepHours < thresholds.sleepHoursMax;

    if (isEnergyLow && (hasSymptoms || poorSleep)) {
      const factors: ContributingFactor[] = [];
      let confidence = 55;

      if (isEnergyLow) {
        factors.push({
          name: "Low Energy Level",
          value: recentData.energyLevel === "low" ? 30 : 55,
          impact: -20,
          description: `Current energy is ${recentData.energyLevel}`,
        });
        confidence += 10;
      }

      if (hasSymptoms) {
        factors.push({
          name: "Symptoms Present",
          value: Math.round((recentData.symptoms.length / 5) * 100),
          impact: -15,
          description: `${recentData.symptoms.length} symptoms reported`,
        });
        confidence += 15;
      }

      if (poorSleep) {
        factors.push({
          name: "Insufficient Sleep",
          value: Math.round((recentData.sleepHours / 8) * 100),
          impact: -10,
          description: `Only ${recentData.sleepHours} hours of sleep`,
        });
        confidence += 8;
      }

      return {
        id: `risk-fatigue-${Date.now()}`,
        type: "fatigue",
        severity: factors.length >= 2 ? "medium" : "low",
        confidence: Math.min(confidence, 85),
        title: "Fatigue Detected",
        description: "Your body is showing signs of fatigue. This could be due to insufficient sleep, symptoms, or accumulated stress.",
        contributingFactors: factors,
        detectedAt: new Date(),
        trend: "stable",
      };
    }

    return null;
  }

  /**
   * Detect Dehydration Risk
   */
  static detectDehydrationRisk(
    hydrationProgress: number,
    consecutiveDaysBelow: number = 2
  ): DetectedRisk | null {
    if (hydrationProgress < 50 && consecutiveDaysBelow >= 2) {
      return {
        id: `risk-dehydration-${Date.now()}`,
        type: "dehydration",
        severity: hydrationProgress < 30 ? "high" : "medium",
        confidence: 75,
        title: "Hydration Below Target",
        description: "Your hydration has been consistently below the recommended level. Staying hydrated is essential for energy and cognitive function.",
        contributingFactors: [
          {
            name: "Low Hydration",
            value: hydrationProgress,
            impact: -15,
            description: `Only ${hydrationProgress}% of daily goal reached`,
          },
        ],
        detectedAt: new Date(),
        trend: "stable",
      };
    }

    if (hydrationProgress < 60) {
      return {
        id: `risk-dehydration-${Date.now()}`,
        type: "dehydration",
        severity: "low",
        confidence: 60,
        title: "Hydration Opportunity",
        description: "Your hydration could use improvement. Consider setting reminders to drink water throughout the day.",
        contributingFactors: [
          {
            name: "Below Target Hydration",
            value: hydrationProgress,
            impact: -8,
            description: `${hydrationProgress}% of daily goal`,
          },
        ],
        detectedAt: new Date(),
        trend: "stable",
      };
    }

    return null;
  }

  /**
   * Detect Medication Non-Compliance
   */
  static detectMedicationNonCompliance(
    adherenceRate: number,
    missedCount: number,
    totalCount: number
  ): DetectedRisk | null {
    if (adherenceRate < 70) {
      return {
        id: `risk-medication-${Date.now()}`,
        type: "medication_non_compliance",
        severity: adherenceRate < 50 ? "high" : "medium",
        confidence: 85,
        title: "Medication Adherence Below Target",
        description: "Your medication adherence has dropped below recommended levels. Consistent medication is important for treatment effectiveness.",
        contributingFactors: [
          {
            name: "Low Adherence Rate",
            value: adherenceRate,
            impact: -25,
            description: `${adherenceRate}% adherence over ${totalCount} doses`,
          },
          {
            name: "Missed Doses",
            value: missedCount,
            impact: -10,
            description: `${missedCount} missed doses detected`,
          },
        ],
        detectedAt: new Date(),
        trend: adherenceRate < 50 ? "increasing" : "stable",
      };
    }

    if (adherenceRate < 85) {
      return {
        id: `risk-medication-${Date.now()}`,
        type: "medication_non_compliance",
        severity: "low",
        confidence: 65,
        title: "Medication Adherence Opportunity",
        description: "Your medication adherence could be improved. Setting reminders or creating a routine might help.",
        contributingFactors: [
          {
            name: "Suboptimal Adherence",
            value: adherenceRate,
            impact: -10,
            description: `${adherenceRate}% adherence rate`,
          },
        ],
        detectedAt: new Date(),
        trend: "stable",
      };
    }

    return null;
  }

  /**
   * Detect Poor Sleep Pattern
   */
  static detectPoorSleepPattern(
    checkInHistory: CheckInData[],
    thresholds: RiskThresholds["poorSleep"] = DEFAULT_THRESHOLDS.poorSleep
  ): DetectedRisk | null {
    if (checkInHistory.length < thresholds.consecutiveDays) return null;

    const recentData = checkInHistory.slice(0, thresholds.consecutiveDays);

    const poorSleepDays = recentData.filter(
      (d) =>
        d.sleepQuality === "poor" ||
        d.sleepHours < thresholds.hoursMin ||
        (d.sleepQuality === "fair" && d.sleepHours < 7)
    ).length;

    if (poorSleepDays >= thresholds.consecutiveDays) {
      const avgSleepHours = recentData.reduce((sum, d) => sum + d.sleepHours, 0) / recentData.length;
      const avgQualityScore =
        recentData.reduce((sum, d) => {
          const q: Record<string, number> = { poor: 1, fair: 2, good: 3, excellent: 4 };
          return sum + (q[d.sleepQuality] || 2);
        }, 0) / recentData.length;

      return {
        id: `risk-poor-sleep-${Date.now()}`,
        type: "poor_sleep_pattern",
        severity: poorSleepDays === thresholds.consecutiveDays && avgSleepHours < 5 ? "high" : "medium",
        confidence: 80,
        title: "Poor Sleep Pattern Detected",
        description: "Your sleep patterns show consistent issues. This could be affecting your energy, mood, and long-term health.",
        contributingFactors: [
          {
            name: "Low Sleep Duration",
            value: Math.round((avgSleepHours / 9) * 100),
            impact: -15,
            description: `Average ${avgSleepHours.toFixed(1)} hours over ${thresholds.consecutiveDays} days`,
          },
          {
            name: "Sleep Quality",
            value: Math.round((avgQualityScore / 4) * 100),
            impact: -10,
            description: `Average quality: ${recentData[0].sleepQuality}`,
          },
        ],
        detectedAt: new Date(),
        trend: recentData[0].sleepQuality === "poor" ? "increasing" : "stable",
      };
    }

    return null;
  }

  /**
   * Run all risk detections
   */
  static detectAllRisks(params: {
    checkInHistory: CheckInData[];
    hydrationProgress: number;
    medicationAdherence: number;
    missedMedicationCount: number;
    totalMedicationCount: number;
  }): DetectedRisk[] {
    const risks: DetectedRisk[] = [];

    const burnout = this.detectBurnoutRisk(params.checkInHistory);
    if (burnout) risks.push(burnout);

    const fatigue = this.detectFatigueRisk(params.checkInHistory);
    if (fatigue) risks.push(fatigue);

    const dehydration = this.detectDehydrationRisk(params.hydrationProgress);
    if (dehydration) risks.push(dehydration);

    const medication = this.detectMedicationNonCompliance(
      params.medicationAdherence,
      params.missedMedicationCount,
      params.totalMedicationCount
    );
    if (medication) risks.push(medication);

    const poorSleep = this.detectPoorSleepPattern(params.checkInHistory);
    if (poorSleep) risks.push(poorSleep);

    // Sort by severity and confidence
    return risks.sort((a, b) => {
      const severityOrder: Record<RiskSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }
}