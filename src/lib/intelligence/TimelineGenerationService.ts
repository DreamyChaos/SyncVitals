// Timeline Intelligence - Auto-Generated Health Events

import {
  TimelineEvent,
  CheckInData,
  HealthScoreResult,
} from "./types";

export class TimelineGenerationService {
  /**
   * Generate timeline events from check-in data
   */
  static generateFromCheckIn(checkIn: CheckInData, previousCheckIn?: CheckInData): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Sleep milestone
    if (checkIn.sleepHours >= 8 && checkIn.sleepQuality === "excellent") {
      events.push({
        id: `timeline-sleep-${checkIn.date.getTime()}`,
        date: checkIn.date,
        title: "Excellent Sleep Achieved",
        description: `${checkIn.sleepHours}h of excellent quality sleep. This supports optimal recovery and cognitive function.`,
        type: "improvement",
        source: "checkin",
      });
    } else if (checkIn.sleepHours < 5) {
      events.push({
        id: `timeline-sleep-low-${checkIn.date.getTime()}`,
        date: checkIn.date,
        title: "Sleep Duration Below Recommended",
        description: `Only ${checkIn.sleepHours}h of sleep. Adults typically need 7-9 hours for optimal health.`,
        type: "concern",
        source: "checkin",
      });
    }

    // Mood improvement
    if (previousCheckIn) {
      const moodOrder = { poor: 1, okay: 2, good: 3, great: 4 };
      const currentMood = moodOrder[checkIn.mood];
      const prevMood = moodOrder[previousCheckIn.mood];

      if (currentMood - prevMood >= 2) {
        events.push({
          id: `timeline-mood-up-${checkIn.date.getTime()}`,
          date: checkIn.date,
          title: "Mood Significantly Improved",
          description: `Mood improved from ${previousCheckIn.mood} to ${checkIn.mood}. Positive emotional changes detected.`,
          type: "improvement",
          source: "checkin",
        });
      } else if (currentMood - prevMood <= -2) {
        events.push({
          id: `timeline-mood-down-${checkIn.date.getTime()}`,
          date: checkIn.date,
          title: "Mood Declined",
          description: `Mood dropped from ${previousCheckIn.mood} to ${checkIn.mood}. Consider addressing underlying factors.`,
          type: "concern",
          source: "checkin",
        });
      }
    }

    // Exercise completion
    if (checkIn.exerciseCompleted) {
      events.push({
        id: `timeline-exercise-${checkIn.date.getTime()}`,
        date: checkIn.date,
        title: "Exercise Completed",
        description: "Physical activity logged for today. Regular exercise supports cardiovascular health and mood.",
        type: "info",
        source: "checkin",
      });
    }

    // Stress detection
    if (checkIn.stressLevel === "very_stressful") {
      events.push({
        id: `timeline-stress-${checkIn.date.getTime()}`,
        date: checkIn.date,
        title: "High Stress Detected",
        description: "Stress level rated as very stressful. This may impact sleep, energy, and overall health.",
        type: "concern",
        source: "checkin",
      });
    }

    // Symptoms detection
    if (checkIn.symptoms.length > 0 && !checkIn.symptoms.includes("none")) {
      const severity = checkIn.symptoms.length >= 3 ? "risk" : "concern";
      events.push({
        id: `timeline-symptoms-${checkIn.date.getTime()}`,
        date: checkIn.date,
        title: `${checkIn.symptoms.length} Symptom${checkIn.symptoms.length > 1 ? "s" : ""} Reported`,
        description: `Symptoms reported: ${checkIn.symptoms.join(", ")}. Monitor and consult if persistent.`,
        type: severity,
        source: "checkin",
      });
    }

    return events;
  }

  /**
   * Generate events from health score changes
   */
  static generateFromScoreChange(
    currentScore: HealthScoreResult,
    previousScore: number
  ): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const change = currentScore.score - previousScore;

    if (change >= 5) {
      events.push({
        id: `timeline-score-up-${Date.now()}`,
        date: new Date(),
        title: "Health Score Improved",
        description: `Score increased by ${change} points. Your health habits are positively impacting your well-being.`,
        type: "improvement",
        source: "auto",
      });
    } else if (change <= -5) {
      events.push({
        id: `timeline-score-down-${Date.now()}`,
        date: new Date(),
        title: "Health Score Declined",
        description: `Score decreased by ${Math.abs(change)} points. Review your recent habits to identify contributing factors.`,
        type: "concern",
        source: "auto",
      });
    }

    return events;
  }

  /**
   * Generate milestone events
   */
  static generateMilestones(params: {
    consecutiveExerciseDays: number;
    perfectMedicationDays: number;
    sleepStreakDays: number;
    hydrationGoalHit: boolean;
  }): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const now = new Date();

    if (params.consecutiveExerciseDays === 7) {
      events.push({
        id: `timeline-milestone-exercise-week-${now.getTime()}`,
        date: now,
        title: "Weekly Exercise Streak!",
        description: "Exercised every day this week. This consistency is building strong health habits.",
        type: "improvement",
        source: "auto",
      });
    }

    if (params.perfectMedicationDays === 7) {
      events.push({
        id: `timeline-milestone-medication-${now.getTime()}`,
        date: now,
        title: "Perfect Medication Adherence",
        description: "Took all medications on schedule this week. This supports optimal treatment outcomes.",
        type: "improvement",
        source: "auto",
      });
    }

    if (params.sleepStreakDays >= 5) {
      events.push({
        id: `timeline-milestone-sleep-${now.getTime()}`,
        date: now,
        title: "Consistent Sleep Pattern",
        description: `${params.sleepStreakDays} days of good sleep. Consistent sleep supports better health.`,
        type: "improvement",
        source: "auto",
      });
    }

    if (params.hydrationGoalHit) {
      events.push({
        id: `timeline-milestone-hydration-${now.getTime()}`,
        date: now,
        title: "Hydration Goal Achieved",
        description: "Reached your daily hydration target. Maintaining hydration supports energy and cognition.",
        type: "improvement",
        source: "auto",
      });
    }

    return events;
  }

  /**
   * Generate risk-based events
   */
  static generateFromRisks(risks: any[]): TimelineEvent[] {
    return risks.map((risk) => ({
      id: `timeline-risk-${risk.type}-${Date.now()}`,
      date: new Date(),
      title: risk.title,
      description: risk.description,
      type: "risk" as const,
      source: "auto" as const,
      metadata: {
        severity: risk.severity,
        confidence: risk.confidence,
        contributingFactors: risk.contributingFactors,
      },
    }));
  }

  /**
   * Merge and sort events
   */
  static mergeEvents(events: TimelineEvent[]): TimelineEvent[] {
    return events
      .sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : a.date.getTime();
        const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : b.date.getTime();
        return dateB - dateA;
      })
      .slice(0, 20); // Keep last 20 events
  }
}