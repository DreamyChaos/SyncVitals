"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthAgeCardProps {
  healthAge: number;
  chronologicalAge: number;
  onExplain?: () => void;
}

export function HealthAgeCard({ healthAge, chronologicalAge, onExplain }: HealthAgeCardProps) {
  const difference = chronologicalAge - healthAge;
  const isYounger = difference > 0;
  const percentage = Math.min((healthAge / chronologicalAge) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Health Age
        </h3>
        <button
          onClick={onExplain}
          className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors px-2 py-1 rounded-lg hover:bg-secondary/10"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Explain
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center flex-1"
        >
          <p className="text-3xl font-bold text-foreground font-mono">
            {healthAge}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Health Age</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center px-3"
        >
          <span className="text-sm text-muted-foreground">vs</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center flex-1"
        >
          <p className="text-3xl font-bold text-muted-foreground font-mono">
            {chronologicalAge}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">Actual Age</p>
        </motion.div>
      </div>

      <div className="relative h-2.5 bg-slate-100 dark:bg-surface-hover rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className={cn(
          "flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl",
          isYounger
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        )}
      >
        <span className="text-lg">{isYounger ? "🌱" : "⏳"}</span>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {isYounger ? `${difference} years younger` : `${Math.abs(difference)} years older`}
          </p>
          <p className="text-xs opacity-70 font-medium">
            {isYounger ? "Health habits paying off" : "Room for improvement"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}