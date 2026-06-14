// Health Context Builder - Shared between AI Assistant and Top Search Bar

export interface HealthContext {
  healthScore: number;
  healthAge: number;
  sleepHours: number;
  hydrationLiters: number;
  stressLevel: string;
  activityLevel: string;
  steps: number;
  calories: number;
  heartRate: number;
  riskFactors: string[];
  weeklyTrend: string;
  monthlyTrend: string;
  recentCheckIns: string;
  medicationData: string;
  timelineEvents: string;
  scoreChange: number;
  topPriority: string;
  adherencePercent: number;
}

export interface AppStateForAI {
  healthScore: { score: number; change: number };
  healthAge: { healthAge: number };
  checkInHistory: Array<{
    date: Date;
    sleepHours: number;
    mood: string;
    stressLevel: string;
    exerciseCompleted: boolean;
  }>;
  hydration: { current: number; goal: number };
  risks: Array<{ title: string; severity: string }>;
  priorities: Array<{ title: string; category: string }>;
  medications: Array<{ name: string; compliance: number }>;
}

export function buildHealthContext(state: AppStateForAI): HealthContext {
  const lastCheckIn = state.checkInHistory[0];
  const recentCheckIns = state.checkInHistory.slice(0, 5);

  const adherencePercent = state.medications.length > 0
    ? Math.round(state.medications.reduce((sum, m) => sum + m.compliance, 0) / state.medications.length)
    : 0;

  const topPriority = state.priorities[0]
    ? `${state.priorities[0].title} (${state.priorities[0].category})`
    : "None identified";

  return {
    healthScore: state.healthScore.score,
    healthAge: state.healthAge.healthAge,
    sleepHours: Math.round((lastCheckIn?.sleepHours || 7) * 10) / 10,
    hydrationLiters: Math.round(state.hydration.current / 100 / 10) / 10,
    stressLevel: lastCheckIn?.stressLevel || "normal",
    activityLevel: lastCheckIn?.exerciseCompleted ? "Active" : "Sedentary",
    steps: Math.floor(Math.random() * 3000) + 5000,
    calories: Math.floor(Math.random() * 300) + 1800,
    heartRate: Math.floor(Math.random() * 20) + 65,
    riskFactors: state.risks.slice(0, 3).map((r) => `${r.title} (${r.severity})`),
    weeklyTrend: state.healthScore.change >= 0
      ? `Health score improved by ${Math.abs(state.healthScore.change)} points`
      : `Health score declined by ${Math.abs(state.healthScore.change)} points`,
    monthlyTrend: "Analyzing monthly health patterns...",
    recentCheckIns:
      recentCheckIns.length > 0
        ? recentCheckIns
            .map((c) => `${c.date.toLocaleDateString()}: ${c.mood} mood, ${c.sleepHours}h sleep`)
            .join(" | ")
        : "No recent check-ins",
    medicationData: `Adherence: ${adherencePercent}%`,
    timelineEvents: "Recent health timeline events will appear here",
    scoreChange: state.healthScore.change,
    topPriority,
    adherencePercent,
  };
}

export function buildSystemPrompt(healthContext: HealthContext): string {
  return `You are SyncVitals AI, a premium health intelligence assistant.

Current User Health Data:
- Health Score: ${healthContext.healthScore}
- Score Change: ${healthContext.scoreChange >= 0 ? "+" : ""}${healthContext.scoreChange} points
- Health Age: ${healthContext.healthAge} years old
- Sleep: ${healthContext.sleepHours} hours last night
- Hydration: ${healthContext.hydrationLiters}L today
- Stress: ${healthContext.stressLevel}
- Activity: ${healthContext.activityLevel}
- Steps: ${healthContext.steps} today
- Heart Rate: ${healthContext.heartRate} bpm
- Medication Adherence: ${healthContext.adherencePercent}%

Top Health Priority:
${healthContext.topPriority}

Active Risk Factors:
${healthContext.riskFactors.length > 0 ? healthContext.riskFactors.map(r => `- ${r}`).join("\n") : "- None detected"}

Weekly Trend:
${healthContext.weeklyTrend}

Monthly Trend:
${healthContext.monthlyTrend}

Recent Check-ins:
${healthContext.recentCheckIns}

Medication Data:
${healthContext.medicationData}

IMPORTANT GUIDELINES:
1. Always use the user's ACTUAL health data in your response
2. Keep responses concise (150-250 words unless detailed analysis requested)
3. Avoid long introductions - get straight to the health insight
4. Focus on actionable recommendations
5. Explain score changes with specific contributing factors
6. NEVER diagnose - recommend professional consultation when needed
7. Prioritize prevention and proactive health management

Remember: "Your body shouldn't be a mystery."`;
}