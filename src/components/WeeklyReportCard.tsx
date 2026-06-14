"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Calendar,
  Activity,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyReport } from "@/lib/intelligence/types";

interface WeeklyReportCardProps {
  report: WeeklyReport;
  compact?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  sleep: { bg: "bg-sleep-muted", text: "text-sleep", border: "border-sleep/30" },
  hydration: { bg: "bg-hydration-muted", text: "text-hydration", border: "border-hydration/30" },
  mood: { bg: "bg-mood-muted", text: "text-mood", border: "border-mood/30" },
  energy: { bg: "bg-energy-muted", text: "text-energy", border: "border-energy/30" },
  medication: { bg: "bg-medication-muted", text: "text-medication", border: "border-medication/30" },
  stress: { bg: "bg-stress-muted", text: "text-stress", border: "border-stress/30" },
  exercise: { bg: "bg-exercise-muted", text: "text-exercise", border: "border-exercise/30" },
};

export function WeeklyReportCard({ report, compact = false }: WeeklyReportCardProps) {
  if (!report) return null;

  const scoreChangeColor = report.scoreChange >= 0 ? "text-emerald-400" : "text-red-400";
  const scoreChangeBg = report.scoreChange >= 0 ? "bg-emerald-500/10" : "bg-red-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "ai-panel relative overflow-hidden",
        compact ? "p-5" : "p-6"
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/5 to-transparent rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-title font-semibold text-foreground">Weekly Health Report</h3>
              <p className="text-caption text-muted-foreground">
                {report.startDate.toLocaleDateString()} - {report.endDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
            This Week
          </span>
        </div>

        <div className="bg-surface/50 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Last Week</p>
                <p className="text-2xl font-bold text-foreground">{report.previousAverageScore}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">This Week</p>
                <p className="text-2xl font-bold text-foreground">{report.averageScore}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl", scoreChangeBg)}>
              {report.scoreChange >= 0 ? (
                <TrendingUp className={cn("w-5 h-5", scoreChangeColor)} />
              ) : (
                <TrendingDown className={cn("w-5 h-5", scoreChangeColor)} />
              )}
              <span className={cn("text-lg font-bold", scoreChangeColor)}>
                {report.scoreChange >= 0 ? "+" : ""}{report.scoreChange}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Best Improvement</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{report.bestImprovement.metric}</p>
            <p className="text-xs text-muted-foreground">
              {report.bestImprovement.change >= 0 ? "+" : ""}{report.bestImprovement.change} {report.bestImprovement.description}
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">Biggest Concern</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{report.biggestConcern.metric}</p>
            <p className="text-xs text-muted-foreground">{report.biggestConcern.description}</p>
          </div>
        </div>

        {report.recommendations.length > 0 && (
          <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-secondary">AI Recommendation</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {report.recommendations[0]}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            {report.risks.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-risk" />
                <span>{report.risks.length} active risk{report.risks.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {report.insights.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="w-3.5 h-3.5 text-secondary" />
                <span>{report.insights.length} insight{report.insights.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}