"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImprovementOpportunity {
  category: string;
  action: string;
  potentialGain: number;
  currentValue: number;
}

interface HealthImprovementOpportunitiesProps {
  opportunities: ImprovementOpportunity[];
  onExplainImprovement?: () => void;
}

const categoryColors: Record<string, string> = {
  sleep: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  hydration: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  mood: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  energy: "from-teal-500/20 to-emerald-500/20 border-teal-500/30",
  medication: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  stress: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  exercise: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  symptoms: "from-red-500/20 to-orange-500/20 border-red-500/30",
};

const categoryGradients: Record<string, string> = {
  sleep: "from-purple-500 to-violet-500",
  hydration: "from-blue-500 to-cyan-500",
  mood: "from-pink-500 to-rose-500",
  energy: "from-teal-500 to-emerald-500",
  medication: "from-emerald-500 to-green-500",
  stress: "from-orange-500 to-amber-500",
  exercise: "from-cyan-500 to-blue-500",
  symptoms: "from-red-500 to-orange-500",
};

export function HealthImprovementOpportunities({
  opportunities,
  onExplainImprovement,
}: HealthImprovementOpportunitiesProps) {
  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="ai-panel p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-title font-semibold text-foreground">Improvement Opportunities</h3>
            <p className="text-caption text-muted-foreground">Highest impact actions</p>
          </div>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
          +Score
        </span>
      </div>

      <div className="space-y-3">
        {opportunities.slice(0, 3).map((opp, index) => {
          const colorClass = categoryColors[opp.category.toLowerCase()] || categoryColors.symptoms;
          const gradient = categoryGradients[opp.category.toLowerCase()] || categoryGradients.symptoms;

          return (
            <motion.div
              key={opp.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border bg-gradient-to-r",
                colorClass
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{opp.category}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-bold">+{opp.potentialGain}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{opp.action}</p>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", gradient)}
                    initial={{ width: `${opp.currentValue}%` }}
                    animate={{ width: `${Math.min(opp.currentValue + opp.potentialGain, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {Math.round(opp.currentValue)}% → {Math.round(opp.currentValue + opp.potentialGain)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {onExplainImprovement && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={onExplainImprovement}
            className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            View detailed analysis
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}