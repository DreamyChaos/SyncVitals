"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Activity,
  Brain,
  Droplets,
  Moon,
  Heart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonthlyReport } from "@/lib/intelligence/types";

interface MonthlyReportCardProps {
  report: MonthlyReport;
  showHighlights?: boolean;
}

const trendIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sleep: Moon,
  hydration: Droplets,
  mood: Heart,
  energy: Zap,
  score: Activity,
  healthAge: Brain,
};

const trendColors: Record<string, { bg: string; text: string; border: string }> = {
  sleep: { bg: "bg-sleep-muted", text: "text-sleep", border: "border-sleep/30" },
  hydration: { bg: "bg-hydration-muted", text: "text-hydration", border: "border-hydration/30" },
  mood: { bg: "bg-mood-muted", text: "text-mood", border: "border-mood/30" },
  energy: { bg: "bg-energy-muted", text: "text-energy", border: "border-energy/30" },
  medication: { bg: "bg-medication-muted", text: "text-medication", border: "border-medication/30" },
  stress: { bg: "bg-stress-muted", text: "text-stress", border: "border-stress/30" },
  exercise: { bg: "bg-exercise-muted", text: "text-exercise", border: "border-exercise/30" },
};

interface TrendItemProps {
  label: string;
  change: number;
  icon: string;
  color: string;
}

function TrendItem({ label, change, icon, color }: TrendItemProps) {
  const Icon = trendIcons[icon] || Activity;
  const colorClass = trendColors[color] || trendColors.energy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border",
        colorClass.bg,
        colorClass.border
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass.bg)}>
          <Icon className={cn("w-4 h-4", colorClass.text)} />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {change > 0 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
        {change < 0 && <TrendingDown className="w-4 h-4 text-red-400" />}
        {change === 0 && <Minus className="w-4 h-4 text-muted-foreground" />}
        <span className={cn(
          "text-sm font-semibold",
          change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-muted-foreground"
        )}>
          {change > 0 ? "+" : ""}{change}%
        </span>
      </div>
    </motion.div>
  );
}

export function MonthlyReportCard({ report, showHighlights = true }: MonthlyReportCardProps) {
  if (!report) return null;

  const monthName = report.month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const healthAgeChangeColor = report.healthAgeChange <= 0 ? "text-emerald-400" : "text-red-400";

  const highlights = [
    { label: "Score Progress", value: `${report.scoreTrend.length > 0 && report.scoreTrend[report.scoreTrend.length - 1] > report.scoreTrend[0] ? "+" : ""}${report.scoreTrend.length > 0 ? report.scoreTrend[report.scoreTrend.length - 1] - (report.scoreTrend[0] || 0) : 0} points`, icon: "score", positive: report.scoreTrend.length > 0 && report.scoreTrend[report.scoreTrend.length - 1] > report.scoreTrend[0] },
    { label: "Health Age", value: `${report.healthAgeChange <= 0 ? "-" : "+"}${Math.abs(report.healthAgeChange)} years`, icon: "healthAge", positive: report.healthAgeChange <= 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="ai-panel p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-title font-semibold text-foreground">Monthly Health Report</h3>
              <p className="text-caption text-muted-foreground">{monthName}</p>
            </div>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
            This Month
          </span>
        </div>

        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-5 mb-5 border border-secondary/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Monthly Average</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">{report.averageScore}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-3">
            {report.scoreTrend.map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-surface-hover rounded-full overflow-hidden" style={{ height: `${score}%`, maxHeight: "60px" }}>
                  <div className="w-full h-full bg-gradient-to-t from-secondary to-primary rounded-full" />
                </div>
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Weekly score trend
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={cn(
            "p-4 rounded-xl border",
            healthAgeChangeColor.includes("emerald") ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className={cn("w-4 h-4", healthAgeChangeColor)} />
              <span className="text-xs text-muted-foreground">Health Age</span>
            </div>
            <p className={cn("text-xl font-bold", healthAgeChangeColor)}>
              {report.healthAgeChange <= 0 ? "" : "+"}{report.healthAgeChange} years
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              vs last month
            </p>
          </div>

          <div className="bg-surface/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Overall</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {report.averageScore >= 80 ? "Excellent" : report.averageScore >= 70 ? "Good" : "Needs Work"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on all metrics
            </p>
          </div>
        </div>

        {showHighlights && (
          <div className="mb-5">
            <h4 className="text-sm font-medium text-foreground mb-3">Monthly Highlights</h4>
            <div className="space-y-2">
              {highlights.map((highlight, i) => (
                <motion.div
                  key={highlight.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center justify-between p-3 bg-surface rounded-xl"
                >
                  <span className="text-sm text-foreground">{highlight.label}</span>
                  <span className={cn(
                    "text-sm font-semibold",
                    highlight.positive ? "text-emerald-400" : "text-red-400"
                  )}>
                    {highlight.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-xs font-medium text-secondary">AI Monthly Reflection</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {report.aiSummary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}