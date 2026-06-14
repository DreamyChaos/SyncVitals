// Weekly Report Service - Weekly Health Summary Generation

import {
  CheckInData,
  WeeklyReport,
  DetectedRisk,
  AIInsight,
} from "./types";

export class WeeklyReportService {
  /**
   * Generate weekly health report
   */
  static generateReport(params: {
    weekData: CheckInData[];
    previousWeekData: CheckInData[];
    healthScores: number[];
    previousHealthScores: number[];
    activeRisks: DetectedRisk[];
    insights: AIInsight[];
  }): WeeklyReport {
    const { weekData, previousWeekData, healthScores, previousHealthScores, activeRisks, insights } = params;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    // Calculate averages
    const avgSleep = weekData.reduce((sum, d) => sum + d.sleepHours, 0) / weekData.length;
    const prevAvgSleep = previousWeekData.reduce((sum, d) => sum + d.sleepHours, 0) / Math.max(previousWeekData.length, 1);

    const exerciseDays = weekData.filter((d) => d.exerciseCompleted).length;
    const prevExerciseDays = previousWeekData.filter((d) => d.exerciseCompleted).length;

    // Calculate average score
    const averageScore = healthScores.length > 0
      ? Math.round(healthScores.reduce((sum, s) => sum + s, 0) / healthScores.length)
      : 75;
    const previousAverageScore = previousHealthScores.length > 0
      ? Math.round(previousHealthScores.reduce((sum, s) => sum + s, 0) / previousHealthScores.length)
      : 75;
    const scoreChange = averageScore - previousAverageScore;

    // Find best improvement
    const sleepChange = avgSleep - prevAvgSleep;
    const exerciseChange = exerciseDays - prevExerciseDays;

    let bestImprovement = {
      metric: "Overall Health",
      change: scoreChange,
      description: scoreChange >= 0
        ? "Your health metrics improved this week"
        : "Health metrics remained stable",
    };

    if (sleepChange > 0.5) {
      bestImprovement = {
        metric: "Sleep",
        change: Math.round(sleepChange * 10) / 10,
        description: `Average sleep increased by ${Math.abs(sleepChange).toFixed(1)} hours`,
      };
    } else if (exerciseChange > 1) {
      bestImprovement = {
        metric: "Exercise",
        change: exerciseChange,
        description: `Exercised ${exerciseChange} more day${exerciseChange > 1 ? "s" : ""} this week`,
      };
    }

    // Find biggest concern
    let biggestConcern = {
      metric: "None",
      change: 0,
      description: "No significant concerns detected",
    };

    if (scoreChange < -5) {
      biggestConcern = {
        metric: "Overall Health",
        change: scoreChange,
        description: "Health score declined this week. Review your recent habits.",
      };
    } else if (sleepChange < -0.5) {
      biggestConcern = {
        metric: "Sleep",
        change: Math.round(sleepChange * 10) / 10,
        description: `Sleep decreased by ${Math.abs(sleepChange).toFixed(1)} hours`,
      };
    } else if (activeRisks.length > 0) {
      biggestConcern = {
        metric: activeRisks[0].type.replace("_", " "),
        change: -1,
        description: activeRisks[0].title,
      };
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (sleepChange < 0) {
      recommendations.push("Prioritize sleep consistency - aim for the same bedtime nightly");
    }
    if (exerciseChange <= 0 && exerciseDays < 4) {
      recommendations.push("Schedule regular exercise - even 20 minutes makes a difference");
    }
    if (activeRisks.some((r) => r.type === "dehydration")) {
      recommendations.push("Set hydration reminders throughout the day");
    }
    if (activeRisks.some((r) => r.type === "burnout")) {
      recommendations.push("Consider stress management techniques like meditation");
    }
    if (recommendations.length === 0) {
      recommendations.push("Continue maintaining your current healthy habits");
      recommendations.push("Regular check-ins help track your progress");
    }

    return {
      startDate: weekStart,
      endDate: now,
      averageScore,
      previousAverageScore,
      scoreChange,
      bestImprovement,
      biggestConcern,
      risks: activeRisks.slice(0, 3),
      insights: insights.slice(0, 2),
      recommendations: recommendations.slice(0, 3),
      generatedAt: now,
    };
  }

  /**
   * Format report as readable text
   */
  static formatReportText(report: WeeklyReport): string {
    const lines: string[] = [];

    lines.push("═══════════════════════════════════════");
    lines.push("         WEEKLY HEALTH REPORT         ");
    lines.push("═══════════════════════════════════════");
    lines.push("");
    lines.push(`Period: ${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}`);
    lines.push("");
    lines.push("┌─────────────────────────────────────┐");
    lines.push(`│  Average Health Score: ${report.averageScore}/100     │`);
    lines.push(`│  Change: ${report.scoreChange >= 0 ? "+" : ""}${report.scoreChange} from last week       │`);
    lines.push("└─────────────────────────────────────┘");
    lines.push("");

    lines.push("★ BEST IMPROVEMENT");
    lines.push(`   ${report.bestImprovement.metric}: ${report.bestImprovement.description}`);
    lines.push("");

    lines.push("⚠️ BIGGEST CONCERN");
    lines.push(`   ${report.biggestConcern.metric}: ${report.biggestConcern.description}`);
    lines.push("");

    if (report.recommendations.length > 0) {
      lines.push("📋 AI RECOMMENDATIONS");
      report.recommendations.forEach((rec, i) => {
        lines.push(`   ${i + 1}. ${rec}`);
      });
      lines.push("");
    }

    lines.push("═══════════════════════════════════════");

    return lines.join("\n");
  }
}

// Monthly Report Service
export class MonthlyReportService {
  /**
   * Generate monthly health report
   */
  static generateReport(params: {
    monthData: CheckInData[];
    healthScores: number[];
    healthAgeChange: number;
    risksSummary: any[];
    improvementsSummary: string[];
  }): any {
    const { monthData, healthScores, healthAgeChange, risksSummary, improvementsSummary } = params;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate monthly statistics
    const avgScore = healthScores.length > 0
      ? Math.round(healthScores.reduce((sum, s) => sum + s, 0) / healthScores.length)
      : 75;

    // Score trend (weekly averages)
    const weeklyAverages: number[] = [];
    for (let i = 0; i < 4; i++) {
      const weekScores = healthScores.slice(i * 7, (i + 1) * 7);
      if (weekScores.length > 0) {
        weeklyAverages.push(Math.round(weekScores.reduce((sum, s) => sum + s, 0) / weekScores.length));
      }
    }

    // Sleep statistics
    const avgSleep = monthData.reduce((sum, d) => sum + d.sleepHours, 0) / Math.max(monthData.length, 1);
    const exerciseDays = monthData.filter((d) => d.exerciseCompleted).length;

    // Risk summary
    const topRisks = [...new Set(risksSummary)].slice(0, 3);

    // Generate AI summary
    let aiSummary = "";
    if (healthAgeChange < 0) {
      aiSummary = `Your health age has improved by ${Math.abs(healthAgeChange)} years this month. This is excellent progress and reflects your consistent healthy habits. `;
    } else if (healthAgeChange > 0) {
      aiSummary = `Your health age has increased by ${healthAgeChange} year${healthAgeChange > 1 ? "s" : ""} this month. Some health factors may need attention. `;
    } else {
      aiSummary = "Your health age remained stable this month. Continue maintaining your current habits. ";
    }

    if (avgScore >= 80) {
      aiSummary += "Your health score is in the 'excellent' range, indicating strong overall wellness.";
    } else if (avgScore >= 70) {
      aiSummary += "Your health score is good. Small improvements in targeted areas could elevate your wellness.";
    } else {
      aiSummary += "Your health score indicates room for improvement. Focus on the key recommendations below.";
    }

    return {
      month: monthStart,
      averageScore: avgScore,
      scoreTrend: weeklyAverages,
      healthAgeChange,
      risksSummary: topRisks,
      improvementsSummary: improvementsSummary.slice(0, 5),
      aiSummary,
      statistics: {
        avgSleepHours: Math.round(avgSleep * 10) / 10,
        exerciseDays,
        totalCheckIns: monthData.length,
      },
      generatedAt: now,
    };
  }

  /**
   * Format monthly report as premium text
   */
  static formatReportText(report: any): string {
    const monthName = report.month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const lines: string[] = [];
    lines.push("");
    lines.push("╔════════════════════════════════════════════════════════════╗");
    lines.push(`║                   ${monthName.toUpperCase().padStart(20)} HEALTH REPORT              ║`);
    lines.push("╚════════════════════════════════════════════════════════════╝");
    lines.push("");
    lines.push("┌────────────────────────────────────────────────────────────┐");
    lines.push(`│  Average Health Score: ${report.averageScore}/100                       │`);
    lines.push(`│  Health Age Change: ${report.healthAgeChange <= 0 ? "-" : "+"}${Math.abs(report.healthAgeChange)} year(s)                          │`);
    lines.push("└────────────────────────────────────────────────────────────┘");
    lines.push("");

    lines.push("📊 SCORE TREND");
    if (report.scoreTrend.length > 0) {
      const minScore = Math.min(...report.scoreTrend);
      const maxScore = Math.max(...report.scoreTrend);
      const range = maxScore - minScore;
      for (let i = 0; i < report.scoreTrend.length; i++) {
        const score = report.scoreTrend[i];
        const barLength = Math.round(((score - minScore) / Math.max(range, 1)) * 20);
        const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
        lines.push(`   Week ${i + 1}: ${bar} ${score}`);
      }
    } else {
      lines.push("   Insufficient data for trend");
    }
    lines.push("");

    if (report.topRisks && report.topRisks.length > 0) {
      lines.push("⚠️ KEY HEALTH RISKS");
      report.topRisks.forEach((risk: string) => {
        lines.push(`   • ${risk.replace("_", " ")}`);
      });
      lines.push("");
    }

    lines.push("🤖 AI ANALYSIS");
    lines.push(`   ${report.aiSummary}`);
    lines.push("");

    if (report.improvementsSummary.length > 0) {
      lines.push("✅ KEY IMPROVEMENTS");
      report.improvementsSummary.forEach((improvement: string) => {
        lines.push(`   • ${improvement}`);
      });
      lines.push("");
    }

    lines.push("📈 STATISTICS");
    lines.push(`   Average Sleep: ${report.statistics.avgSleepHours}h`);
    lines.push(`   Exercise Days: ${report.statistics.exerciseDays}`);
    lines.push(`   Check-ins Completed: ${report.statistics.totalCheckIns}`);
    lines.push("");
    lines.push("═══════════════════════════════════════════════════════════════");
    lines.push("");

    return lines.join("\n");
  }
}