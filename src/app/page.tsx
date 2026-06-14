"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  User,
  Settings,
  Menu,
  Shield,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Brain,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Droplets,
  Moon,
  Heart,
  Clock,
  Pill,
  X,
  Home,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import {
  AIPriorities,
  AIInsight,
  SilentRiskDetection,
  MedicationAdherence,
  WeeklyTrendChart,
  TodaySnapshot,
  HealthTimeline,
  ExplainModal,
  ThemeToggle,
  CheckInButton,
  HealthImprovementOpportunities,
  WeeklyReportCard,
  MonthlyReportCard,
  PremiumAIInsightPanel,
  UserAvatarMenu,
} from "@/components";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAppState } from "@/lib/app-context";
import { MockDataGenerator } from "@/lib/intelligence/MockDataGenerator";
import { HealthAgeService } from "@/lib/intelligence/HealthAgeService";
import { HealthScoreService } from "@/lib/intelligence/HealthScoreService";
import { buildHealthContext } from "@/lib/ai/HealthContextBuilder";
import { type RiskDetection } from "@/lib/data";
import { ScoreContribution, ContributingFactor, AIPriority } from "@/lib/intelligence/types";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const {
    healthScore,
    healthAge,
    risks,
    priorities,
    insights,
    chronologicalAge,
    medications,
    checkInHistory,
    hydration,
    weeklyReport,
    monthlyReport,
    timeline,
  } = useAppState();

  const score = healthScore.score;
  const trend = healthScore.change;
  const isPositive = trend >= 0;

  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: "text-emerald-400", glow: "shadow-emerald-500/30" };
    if (s >= 60) return { text: "text-amber-400", glow: "shadow-amber-500/30" };
    return { text: "text-red-400", glow: "shadow-red-500/30" };
  };
  const scoreStyle = getScoreColor(score);

  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    type: "score" | "healthAge" | "risk" | "priority" | "improvement";
    data?: ScoreData | HealthAgeData | RiskData | PriorityData | ImprovementData;
  }>({ isOpen: false, type: "score" });

  const [topAIQuery, setTopAIQuery] = useState("");
  const [topAIResult, setTopAIResult] = useState<{
    response: string;
    provider: string;
    responseTime: number;
  } | null>(null);
  const [topAIIsLoading, setTopAIIsLoading] = useState(false);
  const [topAIError, setTopAIError] = useState<string | null>(null);
  const [showTopAIResult, setShowTopAIResult] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<{
    id: string;
    name: string;
    dosage: string;
    schedule: string;
    compliance: number;
    nextDose: string;
    nextDoseTime: string;
    missedThisWeek: number;
  } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [footerInfo, setFooterInfo] = useState<{ type: "privacy" | "terms" | "contact"; title: string; content: string } | null>(null);

  type ScoreData = {
    score: number;
    previousScore: number;
    change: number;
    contributions: ScoreContribution[];
    biggestPositive?: ScoreContribution;
    biggestNegative?: ScoreContribution;
  };

  type HealthAgeData = {
    healthAge: number;
    chronologicalAge: number;
    difference: number;
    positiveFactors?: string[];
    negativeFactors?: string[];
    explanations?: string[];
  };

  type RiskData = {
    title: string;
    severity: string;
    confidence: number;
    description: string;
    contributingFactors: ContributingFactor[];
    trend?: "increasing" | "stable" | "decreasing";
    recommendation?: string;
  };

  type PriorityData = {
    title: string;
    category: string;
    reason: string;
    expectedImpact: {
      scoreGain: number;
      benefits: string[];
    };
    actionSteps: string[];
  };

  type ImprovementData = {
    opportunities: {
      category: string;
      action: string;
      potentialGain: number;
      currentValue: number;
    }[];
  };

  const openScoreExplain = () => {
    const contributions = healthScore.contributions;
    const positiveContrib = [...contributions].filter(c => c.impact === "positive").sort((a, b) => b.value - a.value)[0];
    const negativeContrib = [...contributions].filter(c => c.impact === "negative").sort((a, b) => a.value - b.value)[0];

    setExplainModal({
      isOpen: true,
      type: "score",
      data: {
        score: healthScore.score,
        previousScore: healthScore.previousScore,
        change: healthScore.change,
        contributions: contributions,
        biggestPositive: positiveContrib,
        biggestNegative: negativeContrib,
      } as ScoreData,
    });
  };

  const openHealthAgeExplain = () => {
    const explanation = HealthAgeService.explainHealthAgeDifference(healthAge);

    setExplainModal({
      isOpen: true,
      type: "healthAge",
      data: {
        healthAge: healthAge.healthAge,
        chronologicalAge: healthAge.chronologicalAge,
        difference: healthAge.difference,
        positiveFactors: explanation.positive,
        negativeFactors: explanation.negative,
        explanations: healthAge.explanations,
      } as HealthAgeData,
    });
  };

  const openRiskExplain = (risk: RiskDetection) => {
    const matchedRisk = risks.find(r => r.id === risk.id);
    const fullRisk = matchedRisk || {
      id: risk.id,
      title: risk.title,
      severity: risk.severity as "low" | "medium" | "high" | "critical",
      confidence: 75,
      description: risk.reason,
      contributingFactors: [] as ContributingFactor[],
      trend: "stable" as const,
    };

    setExplainModal({
      isOpen: true,
      type: "risk",
      data: {
        title: fullRisk.title,
        severity: fullRisk.severity,
        confidence: fullRisk.confidence,
        description: fullRisk.description,
        contributingFactors: fullRisk.contributingFactors,
        trend: fullRisk.trend,
      } as RiskData,
    });
  };

  const openPriorityExplain = (priority: AIPriority) => {
    const benefits: string[] = [];
    if (priority.category === "hydration") {
      benefits.push("Improved Energy Levels", "Reduced Dehydration Risk", "Better Cognitive Function");
    } else if (priority.category === "sleep") {
      benefits.push("Improved Memory Consolidation", "Better Stress Management", "Enhanced Immune Function");
    } else if (priority.category === "stress") {
      benefits.push("Lower Cortisol Levels", "Improved Sleep Quality", "Better Emotional Balance");
    } else if (priority.category === "exercise") {
      benefits.push("Improved Cardiovascular Health", "Better Mood Regulation", "Increased Energy Levels");
    } else if (priority.category === "mood") {
      benefits.push("Better Relationships", "Improved Productivity", "Enhanced Well-being");
    } else if (priority.category === "medication") {
      benefits.push("Better Treatment Outcomes", "Reduced Health Risks", "Improved Symptom Control");
    } else {
      benefits.push("Improved Overall Health", "Better Quality of Life");
    }

    setExplainModal({
      isOpen: true,
      type: "priority",
      data: {
        title: priority.title,
        category: priority.category,
        reason: priority.description,
        expectedImpact: {
          scoreGain: priority.potentialGain,
          benefits: benefits,
        },
        actionSteps: priority.actionSteps,
      } as PriorityData,
    });
  };

  const openImprovementExplain = () => {
    const opportunities = HealthScoreService.getImprovementOpportunities(healthScore.contributions);

    setExplainModal({
      isOpen: true,
      type: "improvement",
      data: {
        opportunities: opportunities.map(o => ({
          category: o.category,
          action: o.action,
          potentialGain: o.potentialGain,
          currentValue: o.currentValue,
        })),
      } as ImprovementData,
    });
  };

  const handleTopAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topAIQuery.trim() || topAIIsLoading) return;

    setTopAIIsLoading(true);
    setTopAIError(null);
    setTopAIResult(null);
    setShowTopAIResult(true);

    try {
      const healthContext = buildHealthContext({
        healthScore,
        healthAge,
        checkInHistory,
        hydration,
        risks,
        priorities,
        medications,
      });

      const response = await fetch("/api/deep-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: topAIQuery,
          healthContext,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTopAIResult({
          response: result.response,
          provider: result.provider,
          responseTime: result.responseTime,
        });
      } else {
        setTopAIError(result.error || "Analysis failed");
      }
    } catch (err) {
      setTopAIError("Failed to connect to AI service");
    } finally {
      setTopAIIsLoading(false);
    }
  };

  const handleExploreInsights = () => {
    const question = "What are my top health priorities and what can I do to improve them?";
    setTopAIQuery(question);
    setShowTopAIResult(true);
    setTopAIIsLoading(true);
    setTopAIError(null);
    setTopAIResult(null);

    const healthContext = buildHealthContext({
      healthScore,
      healthAge,
      checkInHistory,
      hydration,
      risks,
      priorities,
      medications,
    });

    fetch("/api/deep-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: question,
        healthContext,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setTopAIResult({
            response: result.response,
            provider: result.provider,
            responseTime: result.responseTime,
          });
        } else {
          setTopAIError(result.error || "Analysis failed");
        }
      })
      .catch(() => {
        setTopAIError("Failed to connect to AI service");
      })
      .finally(() => {
        setTopAIIsLoading(false);
      });
  };

  const handleViewCompleteTimeline = () => {
    setShowTimelineModal(true);
  };

  const handleViewMedicationDetails = (med: {
    id: string;
    name: string;
    dosage: string;
    schedule: string;
    compliance: number;
    nextDose: string;
    nextDoseTime: string;
    missedThisWeek: number;
  }) => {
    setSelectedMedication(med);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">
                  SyncVitals
                </h1>
                <p className="text-xs text-muted-foreground">
                  Preventive Health
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
              <form onSubmit={handleTopAISearch} className="relative w-full flex items-center gap-3 px-4 py-2.5 bg-surface/50 border border-border rounded-xl hover:bg-surface hover:border-border-hover transition-all">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={topAIQuery}
                  onChange={(e) => setTopAIQuery(e.target.value)}
                  placeholder="Ask about your health patterns..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  disabled={topAIIsLoading}
                />
                <button
                  type="submit"
                  disabled={!topAIQuery.trim() || topAIIsLoading}
                  className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full hover:bg-secondary/30 transition-colors disabled:opacity-50"
                >
                  {topAIIsLoading ? "..." : "AI"}
                </button>
              </form>
            </div>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <NotificationDropdown />

              <Link
                href="/settings"
                className="p-2.5 rounded-xl hover:bg-surface transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
              </Link>

              <UserAvatarMenu />

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2.5 rounded-xl hover:bg-surface"
              >
                <Menu className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Hero Section - AI Command Center */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="ai-panel p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Health Score Display */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl" />
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-surface-elevated"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={cn(
                          "text-6xl font-bold tracking-tighter text-score",
                          scoreStyle.text
                        )}
                        style={{ textShadow: `0 0 40px var(--primary-glow)` }}
                      >
                        {score}
                      </motion.span>
                      <span className="text-xs text-muted-foreground mt-1">Health Score</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={cn(
                    "flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium w-fit mx-auto",
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{isPositive ? "+" : ""}{trend}% from last week</span>
                </motion.div>
              </div>

              {/* AI Intelligence Panel */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-title font-semibold text-foreground">AI Health Analysis</h2>
                    <p className="text-caption text-muted-foreground">Real-time pattern recognition</p>
                  </div>
                </div>

                {/* Key Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="glass-card-static p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-3.5 h-3.5 text-hydration" />
                      <span className="text-caption text-muted-foreground">Health Signals</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">6</p>
                  </div>

                  <div className="glass-card-static p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-secondary" />
                      <span className="text-caption text-muted-foreground">Patterns</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">2</p>
                  </div>

                  <div className="glass-card-static p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-risk" />
                      <span className="text-caption text-muted-foreground">Active Risks</span>
                    </div>
                    <p className="text-lg font-bold text-amber-400">1</p>
                  </div>
                </div>

                {/* Today's Key Insight */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="text-label font-medium text-foreground">Today&apos;s Key Insight</span>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                    <p className="text-body text-foreground leading-relaxed">
                      {insights[0]?.text || "Complete your daily check-in to receive personalized insights."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-muted-foreground">AI Confidence</span>
                      <div className="w-24 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${insights[0]?.confidence || 0}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-sm font-bold text-secondary">
                        {insights[0]?.confidence || 0}%
                      </span>
                    </div>

                    <button
                      onClick={openScoreExplain}
                      className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Health Age Card */}
              <div className="flex-shrink-0 lg:w-56">
                <div className="glass-card-static p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-caption text-muted-foreground">Health Age</span>
                    <button
                      onClick={openHealthAgeExplain}
                      className="p-1 rounded-lg hover:bg-surface transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="text-center mb-3">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold text-score gradient-text-health"
                    >
                      {healthAge.healthAge}
                    </motion.p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      years young
                    </p>
                  </div>

                  <div className="relative h-1.5 bg-surface-hover rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-hydration rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(healthAge.healthAge / chronologicalAge) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-emerald-400">
                      {Math.abs(healthAge.difference)} years {healthAge.difference >= 0 ? "younger" : "older"}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      than actual age
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          <CheckInButton />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Moon className="w-4 h-4" />
            <span>Good sleep patterns</span>
            <span className="text-border">|</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="w-4 h-4" />
            <span>Hydration on track</span>
            <span className="text-border">|</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span>Medication taken</span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* AI Priorities - Top Priority */}
          <div className="md:col-span-8">
            <AIPriorities priorities={priorities} />
          </div>

          {/* Risk Detection */}
          <div className="md:col-span-4">
            <SilentRiskDetection
              risks={risks.map(r => ({
                id: r.id,
                title: r.title,
                reason: r.description,
                severity: r.severity,
                timestamp: r.detectedAt.toLocaleDateString(),
              }))}
              onExplainRisk={(risk) => {
                const matchedRisk = risks.find(r => r.id === risk.id);
                if (matchedRisk) {
                  setExplainModal({
                    isOpen: true,
                    type: "risk",
                    data: {
                      title: matchedRisk.title,
                      severity: matchedRisk.severity,
                      confidence: matchedRisk.confidence,
                      description: matchedRisk.description,
                      contributingFactors: matchedRisk.contributingFactors,
                      trend: matchedRisk.trend,
                      recommendation: matchedRisk.title.includes("Burnout")
                        ? "Improve sleep consistency and reduce workload intensity."
                        : matchedRisk.title.includes("Dehydration")
                        ? "Increase water intake to 8+ glasses daily."
                        : matchedRisk.title.includes("Fatigue")
                        ? "Prioritize rest and review sleep patterns."
                        : matchedRisk.title.includes("Medication")
                        ? "Set reminders for medication times."
                        : "Monitor and address this risk with consistent check-ins.",
                    } as RiskData,
                  });
                }
              }}
            />
          </div>

          {/* Weekly Trends Chart */}
          <div className="md:col-span-8">
            <WeeklyTrendChart
              data={MockDataGenerator.generateWeeklyTrends(checkInHistory)}
            />
          </div>

          {/* Today Snapshot */}
          <div className="md:col-span-4">
            <TodaySnapshot
              snapshot={{
                sleepHours: checkInHistory[0]?.sleepHours || 7,
                sleepQuality: { poor: 40, fair: 65, good: 85, excellent: 100 }[checkInHistory[0]?.sleepQuality || "good"],
                waterIntake: hydration.current / 1000,
                mood: checkInHistory[0]?.mood || "okay",
                moodScore: { poor: 30, okay: 55, good: 80, great: 100 }[checkInHistory[0]?.mood || "okay"],
                stressLevel: { very_stressful: 80, busy: 60, normal: 40, relaxed: 20 }[checkInHistory[0]?.stressLevel || "normal"],
                energyLevel: { low: 30, medium: 60, high: 100 }[checkInHistory[0]?.energyLevel || "medium"],
                exerciseMinutes: checkInHistory[0]?.exerciseCompleted ? 30 : 0,
              }}
            />
          </div>

          {/* Health Timeline - 70% width */}
          <div className="md:col-span-8">
            <HealthTimeline onViewComplete={handleViewCompleteTimeline} />
          </div>

          {/* Medication Adherence - 30% width */}
          <div className="md:col-span-4">
            <MedicationAdherence
              medications={medications.map(m => ({
                id: m.id,
                name: m.name,
                dosage: m.dosage,
                schedule: m.schedule,
                frequency: m.frequency,
                status: m.status,
                compliance: m.compliance,
                nextDose: m.name.split(" ")[0],
                nextDoseTime: m.schedule,
                missedThisWeek: m.missedThisWeek,
                instructions: m.instructions,
                startDate: m.startDate,
                endDate: m.endDate,
                notes: m.notes,
              }))}
              onViewDetails={handleViewMedicationDetails}
            />
          </div>

          {/* AI Insight */}
          <div className="md:col-span-12">
            <AIInsight
              insight={{
                id: insights[0]?.id || "insight-1",
                text: insights[0]?.text || "Complete your daily check-in to receive personalized insights.",
                category: (insights[0]?.category as any) || "Health",
                confidence: insights[0]?.confidence || 0,
              }}
              onExplore={handleExploreInsights}
            />
          </div>

          {/* Reports Section */}
          <div className="md:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {weeklyReport && <WeeklyReportCard report={weeklyReport} compact />}
              {monthlyReport && <MonthlyReportCard report={monthlyReport} showHighlights />}
            </div>
          </div>

          {/* Health Improvement Opportunities */}
          <div className="md:col-span-12">
            <HealthImprovementOpportunities
              opportunities={(() => {
                const opportunities = HealthScoreService.getImprovementOpportunities(healthScore.contributions);
                return opportunities.map(o => ({
                  category: o.category,
                  action: o.action,
                  potentialGain: o.potentialGain,
                  currentValue: o.currentValue,
                }));
              })()}
              onExplainImprovement={openImprovementExplain}
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showTimelineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTimelineModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto bg-background border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <h2 className="text-lg font-semibold text-foreground">Complete Health Timeline</h2>
                </div>
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6">
                <div className="relative pl-1">
                  <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-secondary/60 via-border to-transparent" />
                  <div className="space-y-5">
                    {timeline.map((event, index) => {
                      const typeConfigLocal: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; label: string }> = {
                        improvement: { icon: TrendingUp, color: "text-medication", bg: "bg-medication-muted", border: "border-medication/30", label: "Progress" },
                        concern: { icon: TrendingDown, color: "text-stress", bg: "bg-stress-muted", border: "border-stress/30", label: "Concern" },
                        risk: { icon: AlertTriangle, color: "text-risk", bg: "bg-risk-muted", border: "border-risk/30", label: "Risk" },
                        info: { icon: Info, color: "text-hydration", bg: "bg-hydration-muted", border: "border-hydration/30", label: "Info" },
                      };
                      const config = typeConfigLocal[event.type];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative flex items-start gap-5"
                        >
                          <div className="relative z-10 flex-shrink-0">
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border-2", config.bg, config.border)}>
                              <Icon className={cn("w-5 h-5", config.color)} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                                {typeof event.date === 'string' ? event.date : event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                                event.type === "improvement" && "bg-medication/10 text-medication",
                                event.type === "concern" && "bg-stress/10 text-stress",
                                event.type === "risk" && "bg-risk/10 text-risk",
                                event.type === "info" && "bg-hydration/10 text-hydration"
                              )}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-body font-semibold text-foreground mb-1.5">{event.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMedication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedMedication(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-medication-muted flex items-center justify-center">
                      <Pill className="w-5 h-5 text-medication" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{selectedMedication.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedMedication.dosage}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMedication(null)}
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-muted-foreground mb-1">Schedule</p>
                    <p className="text-sm font-semibold text-foreground">{selectedMedication.schedule}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-muted-foreground mb-1">Adherence</p>
                    <p className="text-sm font-semibold text-medication">{selectedMedication.compliance}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-muted-foreground mb-1">Missed This Week</p>
                    <p className="text-sm font-semibold text-stress">{selectedMedication.missedThisWeek}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-muted-foreground mb-1">Next Dose</p>
                    <p className="text-sm font-semibold text-foreground">{selectedMedication.nextDose}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Reminder set for {selectedMedication.nextDoseTime}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Menu</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                <Link
                  href="/"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-foreground"
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  href="/check-in"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-foreground"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  Check-In
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-foreground"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-foreground"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumAIInsightPanel
        isOpen={showTopAIResult}
        onClose={() => setShowTopAIResult(false)}
        question={topAIQuery}
        result={topAIResult}
        isLoading={topAIIsLoading}
        error={topAIError}
        healthContext={{
          healthScore: healthScore.score,
          healthAge: healthAge.healthAge,
          sleepHours: checkInHistory[0]?.sleepHours || 7,
          hydrationLiters: Math.round((hydration.current / 1000) * 10) / 10,
          stressLevel: checkInHistory[0]?.stressLevel || "normal",
          activityLevel: checkInHistory[0]?.exerciseCompleted ? "Active" : "Sedentary",
          steps: 6500,
          heartRate: 68,
          scoreChange: healthScore.change,
        }}
      />

      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 SyncVitals. Your body shouldn&apos;t be a mystery.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setFooterInfo({ type: "privacy", title: "Privacy Policy", content: "SyncVitals takes your privacy seriously. All your health data is stored locally on your device and is never shared with third parties. We do not collect, transmit, or store any of your personal health information on external servers. Your data remains under your control at all times." })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setFooterInfo({ type: "terms", title: "Terms of Service", content: "SyncVitals is a health tracking and insights application. It is not a medical device and should not be used for medical diagnosis or treatment. Always consult with healthcare professionals for medical advice. By using SyncVitals, you agree to use the app responsibly." })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setFooterInfo({ type: "contact", title: "Contact Us", content: "For support, feedback, or inquiries, please reach out to us at support@syncvitals.app. We typically respond within 24-48 hours." })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {footerInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setFooterInfo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{footerInfo.title}</h2>
                <button
                  onClick={() => setFooterInfo(null)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{footerInfo.content}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExplainModal
        isOpen={explainModal.isOpen}
        onClose={() => setExplainModal({ isOpen: false, type: "score" })}
        type={explainModal.type}
        data={explainModal.data}
      />
    </div>
  );
}