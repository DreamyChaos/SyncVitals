"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  score: number;
  trend: number;
  onExplain?: () => void;
}

export function HealthScoreCard({ score, trend, onExplain }: HealthScoreCardProps) {
  const isPositive = trend >= 0;
  const scoreColorClass =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
        ? "text-amber-500"
        : "text-red-500";

  const scoreBgClass =
    score >= 80
      ? "bg-emerald-50 border-emerald-200"
      : score >= 60
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const strokeColor =
    score >= 80
      ? "#059669"
      : score >= 60
        ? "#D97706"
        : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-card rounded-2xl p-5 flex flex-col",
        "border-2 border-transparent hover:border-primary/20 transition-colors"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Overall Health Score
        </h3>
        <button
          onClick={onExplain}
          className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors px-2 py-1 rounded-lg hover:bg-secondary/10"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Explain Score
        </button>
      </div>

      <div className="flex items-center justify-center py-3">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={cn("text-5xl font-bold gradient-text", scoreColorClass)}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">out of 100</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={cn(
          "flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold",
          isPositive
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{isPositive ? "+" : ""}{trend}% from last week</span>
      </motion.div>
    </motion.div>
  );
}