"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, ChevronRight, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/data";

const categoryConfig: Record<string, {
  bg: string;
  text: string;
  border: string;
  icon: string;
}> = {
  Sleep: {
    bg: "bg-sleep-muted",
    text: "text-sleep",
    border: "border-sleep/30",
    icon: "text-sleep",
  },
  Mood: {
    bg: "bg-mood-muted",
    text: "text-mood",
    border: "border-mood/30",
    icon: "text-mood",
  },
  Stress: {
    bg: "bg-stress-muted",
    text: "text-stress",
    border: "border-stress/30",
    icon: "text-stress",
  },
  Hydration: {
    bg: "bg-hydration-muted",
    text: "text-hydration",
    border: "border-hydration/30",
    icon: "text-hydration",
  },
  Energy: {
    bg: "bg-energy-muted",
    text: "text-energy",
    border: "border-energy/30",
    icon: "text-energy",
  },
};

interface AIInsightProps {
  insight: Insight;
  onExplore?: () => void;
}

export function AIInsight({ insight, onExplore }: AIInsightProps) {
  const config = categoryConfig[insight.category] || categoryConfig.Sleep;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="ai-panel p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/5 to-transparent rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <Brain className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-title font-semibold text-foreground">AI Deep Analysis</h3>
                <span className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full border",
                  config.bg,
                  config.border,
                  config.text
                )}>
                  {insight.category}
                </span>
              </div>
              <p className="text-caption text-muted-foreground">Pattern recognition & predictions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-border/50">
              <Lightbulb className="w-4 h-4 text-secondary" />
              <span className="text-caption font-semibold text-secondary">AI Confidence</span>
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg leading-relaxed text-foreground font-medium mb-5"
        >
          {insight.text}
        </motion.p>

        <div className="flex items-center justify-between pt-5 border-t border-border/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${insight.confidence}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
              <span className="text-lg font-bold text-secondary">
                {insight.confidence}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-caption text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-medication" />
              <span>Based on 847 data points</span>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onExplore}
            className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors group"
          >
            Explore Insights
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}