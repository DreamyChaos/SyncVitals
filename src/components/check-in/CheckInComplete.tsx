"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

interface CheckInCompleteProps {
  timeOfDay: "morning" | "evening";
  onDismiss: () => void;
}

export function CheckInComplete({ timeOfDay, onDismiss }: CheckInCompleteProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card rounded-3xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Check-In Complete!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          Great job. Your health profile has been updated.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-8"
        >
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">Health Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">87</span>
              <span className="text-xs text-emerald-500">+1</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/5 dark:bg-secondary/10 rounded-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-foreground">AI Processing</span>
            </div>
            <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-full animate-pulse">
              Analyzing...
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Link
            href="/"
            onClick={onDismiss}
            className="w-full btn-primary justify-center py-3"
          >
            <Calendar className="w-4 h-4" />
            View Dashboard
          </Link>

          <button
            onClick={onDismiss}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {timeOfDay === "morning" ? "Evening check-in later" : "Morning check-in tomorrow"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}