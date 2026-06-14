// Mock Data Generator - Realistic Demo Data Generator
// Generates realistic health data for demo purposes

import { CheckInData, SleepQuality, EnergyLevel, Mood, StressLevel } from "./types";

interface GeneratedHealthData {
  checkInHistory: CheckInData[];
  hydrationLogs: { date: Date; amount: number; goal: number }[];
  medicationLogs: { medicationId: string; date: Date; status: "taken" | "skipped" | "missed" }[];
  profile: {
    name: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
  };
}

class MockDataGenerator {
  private static randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private static pickWeighted<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  private static generateSleepQuality(hours: number, baseQuality: number): SleepQuality {
    if (hours < 5) return "poor";
    if (hours < 6) return baseQuality > 0.6 ? "fair" : "poor";
    if (hours < 7) return baseQuality > 0.7 ? "good" : "fair";
    if (hours <= 9) return baseQuality > 0.8 ? "excellent" : "good";
    if (hours <= 10) return "good";
    return "fair";
  }

  private static generateSymptoms(stressLevel: StressLevel, energyLevel: EnergyLevel): string[] {
    const symptoms: string[] = [];
    const stressScore = { very_stressful: 4, busy: 3, normal: 2, relaxed: 1 }[stressLevel];
    const energyScore = { low: 1, medium: 2, high: 3 }[energyLevel];

    if (stressScore >= 4 && Math.random() > 0.5) {
      symptoms.push("headache");
    }
    if (stressScore >= 3 && Math.random() > 0.7) {
      symptoms.push("fatigue");
    }
    if (energyScore <= 1 && Math.random() > 0.6) {
      symptoms.push("fatigue");
    }
    if (Math.random() > 0.85) {
      symptoms.push(this.pick(["body_pain", "dizziness", "stomach_pain"]));
    }

    return symptoms.length > 0 ? symptoms : [];
  }

  static generateCheckInHistory(days: number = 14, startDate: Date = new Date()): CheckInData[] {
    const history: CheckInData[] = [];
    let baseSleepHours = this.randomBetween(6, 8);
    let baseQuality = this.randomBetween(0.6, 0.9);
    let baseEnergy: EnergyLevel = this.pick(["medium", "high"]);
    let baseMood: Mood = this.pick(["okay", "good"]);
    let baseStress: StressLevel = this.pick(["normal", "busy"]);

    // Create a trend - gradually improve or decline over the period
    const trendDirection = Math.random() > 0.5 ? "improving" : "declining";

    for (let i = days; i >= 1; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - i);

      // Add some variation based on day of week (weekends slightly better)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Sleep varies realistically
      let sleepHours = baseSleepHours + this.randomBetween(-1.5, 1.5);
      if (isWeekend) sleepHours += 0.5;
      sleepHours = Math.max(4, Math.min(11, sleepHours));

      // Quality correlates with sleep hours
      const qualityFactor = Math.min(1, sleepHours / 8);
      let quality = baseQuality + (qualityFactor - 0.7) * 0.3 + this.randomBetween(-0.15, 0.15);
      quality = Math.max(0.3, Math.min(1, quality));

      // Energy follows sleep and has some correlation with mood
      let energyRoll = Math.random();
      if (sleepHours < 6) energyRoll -= 0.3;
      if (quality < 0.5) energyRoll -= 0.2;
      const energyLevels: EnergyLevel[] = ["low", "medium", "medium", "high", "high"];
      const energy = energyRoll < 0.2 ? "low" : energyLevels[Math.floor(energyRoll * 5)];

      // Mood varies but has correlation with stress and energy
      let moodRoll = Math.random();
      if (energy === "low") moodRoll -= 0.2;
      const moods: Mood[] = ["poor", "okay", "okay", "good", "good", "great"];
      const mood = moodRoll < 0.15 ? "poor" : moods[Math.floor(moodRoll * 6)];

      // Stress - inverse correlation with sleep quality
      let stressRoll = Math.random();
      if (sleepHours < 6) stressRoll += 0.2;
      if (i % 5 === 0) stressRoll += 0.15; // Every 5th day slightly more stressed
      const stressLevels: StressLevel[] = ["relaxed", "normal", "normal", "busy", "busy", "very_stressful"];
      const stress = stressRoll < 0.15 ? "very_stressful" : stressLevels[Math.floor(stressRoll * 6)];

      // Exercise more likely on certain days, less on weekends (different preferences)
      const exerciseCompleted = isWeekend
        ? Math.random() > 0.4
        : Math.random() > 0.55;

      // Generate symptoms based on overall state
      const symptoms = this.generateSymptoms(stress, energy);

      // Apply trend
      if (trendDirection === "improving") {
        baseSleepHours = Math.min(9, baseSleepHours + 0.02);
        baseQuality = Math.min(1, baseQuality + 0.01);
      } else {
        if (i < days / 2) {
          // First half slightly better
          baseSleepHours = Math.max(5.5, baseSleepHours - 0.03);
          baseQuality = Math.max(0.4, baseQuality - 0.015);
        }
      }

      history.push({
        date,
        sleepHours: Math.round(sleepHours * 10) / 10,
        sleepQuality: this.generateSleepQuality(sleepHours, quality),
        energyLevel: energy,
        mood,
        stressLevel: stress,
        exerciseCompleted,
        symptoms,
        notes: Math.random() > 0.85 ? this.generateNote(stress, energy) : undefined,
      });
    }

    return history;
  }

  private static generateNote(stress: StressLevel, energy: EnergyLevel): string {
    const notes: string[] = [];
    if (stress === "very_stressful" || stress === "busy") {
      notes.push("Busy workday, multiple deadlines");
    }
    if (energy === "low") {
      notes.push("Feeling tired throughout the day");
    }
    if (Math.random() > 0.7) {
      notes.push("Productive day overall");
    }
    return notes.length > 0 ? this.pick(notes) : "";
  }

  static generateHydrationLogs(checkIns: CheckInData[], dailyGoal: number = 2500): { date: Date; amount: number; goal: number }[] {
    return checkIns.map((checkIn) => {
      // Hydration correlates somewhat with energy
      let baseAmount = dailyGoal * this.randomBetween(0.5, 1.1);

      // More water on exercise days
      if (checkIn.exerciseCompleted) {
        baseAmount *= this.randomBetween(1.05, 1.2);
      }

      // Less water when tired/low energy
      if (checkIn.energyLevel === "low") {
        baseAmount *= this.randomBetween(0.75, 0.95);
      }

      // Weekend hydration tends to be lower
      const dayOfWeek = checkIn.date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseAmount *= this.randomBetween(0.8, 0.95);
      }

      return {
        date: checkIn.date,
        amount: Math.round(baseAmount),
        goal: dailyGoal,
      };
    });
  }

  static generateMedicationLogs(
    medications: { id: string; name: string }[],
    checkIns: CheckInData[],
    adherenceBase: number = 88
  ): { medicationId: string; date: Date; status: "taken" | "skipped" | "missed" }[] {
    const logs: { medicationId: string; date: Date; status: "taken" | "skipped" | "missed" }[] = [];

    for (const med of medications) {
      for (const checkIn of checkIns) {
        // Adherence varies by day and medication type
        let adherenceRoll = Math.random() * 100;

        // Morning medications have slightly higher adherence
        if (med.name.includes("Vitamin") || med.name.includes("Omega")) {
          adherenceRoll += 5;
        }

        // Evening medications slightly lower
        if (med.name.includes("Magnesium")) {
          adherenceRoll -= 8;
        }

        // Stress slightly reduces adherence
        if (checkIn.stressLevel === "very_stressful") {
          adherenceRoll -= 5;
        }

        let status: "taken" | "skipped" | "missed";
        if (adherenceRoll < adherenceBase) {
          status = "taken";
        } else if (adherenceRoll < adherenceBase + 5) {
          status = "skipped";
        } else {
          status = "missed";
        }

        logs.push({
          medicationId: med.id,
          date: checkIn.date,
          status,
        });
      }
    }

    return logs;
  }

  static generateDefaultMedications(): { id: string; name: string; dosage: string; schedule: string }[] {
    return [
      { id: "med-1", name: "Vitamin D3", dosage: "5000 IU", schedule: "8:00 AM" },
      { id: "med-2", name: "Omega-3", dosage: "1000mg", schedule: "9:00 AM" },
      { id: "med-3", name: "Magnesium Glycinate", dosage: "400mg", schedule: "10:00 PM" },
    ];
  }

  static generateProfile(): { name: string; age: number; gender: string; height: number; weight: number } {
    const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Quinn"];
    return {
      name: this.pick(names),
      age: this.randomInt(25, 45),
      gender: this.pick(["Male", "Female", "Prefer not to say"]),
      height: this.randomInt(160, 185),
      weight: this.randomInt(55, 90),
    };
  }

  static generateAll(days: number = 14): GeneratedHealthData {
    const medications = this.generateDefaultMedications();
    const profile = this.generateProfile();
    const startDate = new Date();
    const checkInHistory = this.generateCheckInHistory(days, startDate);
    const hydrationLogs = this.generateHydrationLogs(checkInHistory);
    const medicationLogs = this.generateMedicationLogs(medications, checkInHistory);

    return {
      checkInHistory,
      hydrationLogs,
      medicationLogs,
      profile,
    };
  }

  static generateWeeklyTrends(checkIns: CheckInData[]): {
    day: string;
    sleep: number;
    mood: number;
    stress: number;
    energy: number;
  }[] {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const recentCheckIns = checkIns.slice(0, 7).reverse();

    return recentCheckIns.map((checkIn, index) => {
      const moodScore = { poor: 30, okay: 55, good: 80, great: 100 }[checkIn.mood];
      const stressScore = { very_stressful: 20, busy: 50, normal: 75, relaxed: 100 }[checkIn.stressLevel];
      const energyScore = { low: 35, medium: 65, high: 100 }[checkIn.energyLevel];
      const sleepScore = ({ poor: 40, fair: 65, good: 85, excellent: 100 })[checkIn.sleepQuality] * (checkIn.sleepHours / 8);

      return {
        day: days[checkIn.date.getDay()],
        sleep: Math.round(sleepScore),
        mood: Math.round(moodScore),
        stress: Math.round(stressScore),
        energy: Math.round(energyScore),
      };
    });
  }
}

export { MockDataGenerator };
export type { GeneratedHealthData };