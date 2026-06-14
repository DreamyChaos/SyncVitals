"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Brain,
  Droplets,
  Pill,
  Sparkles,
  Zap,
  Heart,
  Utensils,
  Info,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIPriority } from "@/lib/intelligence";

interface AIPrioritiesProps {
  priorities: AIPriority[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon: Moon,
  Brain: Brain,
  Droplets: Droplets,
  Pill: Pill,
  Zap: Zap,
  Heart: Heart,
  Utensils: Utensils,
};

const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  sleep: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: "text-purple-400" },
  hydration: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: "text-blue-400" },
  stress: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", icon: "text-orange-400" },
  mood: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30", icon: "text-pink-400" },
  medication: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", icon: "text-emerald-400" },
  exercise: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", icon: "text-cyan-400" },
};

const severityBadge: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-500/20", text: "text-red-400" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  low: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
};

export function AIPriorities({ priorities }: AIPrioritiesProps) {
  const [selectedPriority, setSelectedPriority] = useState<AIPriority | null>(null);

  if (!priorities || priorities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="ai-panel p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-title font-semibold text-foreground">AI Health Priorities</h3>
              <p className="text-caption text-muted-foreground">Personalized recommendations</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-foreground font-medium">All health metrics balanced!</p>
          <p className="text-sm text-muted-foreground mt-1">No priority areas need attention</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="ai-panel p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-title font-semibold text-foreground">AI Health Priorities</h3>
              <p className="text-caption text-muted-foreground">Ranked by impact potential</p>
            </div>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
            {priorities.length} Areas
          </span>
        </div>

        <div className="space-y-3">
          {priorities.map((priority, index) => {
            const Icon = iconMap[priority.icon] || Brain;
            const colors = categoryColors[priority.category] || categoryColors.sleep;
            const sev = severityBadge[priority.severity] || severityBadge.low;

            return (
              <motion.div
                key={priority.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedPriority(priority)}
              >
                <div className={cn(
                  "p-4 rounded-xl border transition-all",
                  colors.border,
                  "hover:bg-surface-elevated"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      colors.bg
                    )}>
                      <Icon className={cn("w-5 h-5", colors.icon)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-body font-semibold text-foreground">
                            {priority.title}
                          </p>
                          <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase",
                            sev.bg,
                            sev.text
                          )}>
                            {priority.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">+{priority.potentialGain}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {priority.confidence}% confidence
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {priority.timeToImprove}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Tap any priority to see action steps and details
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedPriority && (
          <PriorityDetailPanel
            priority={selectedPriority}
            onClose={() => setSelectedPriority(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PriorityDetailPanel({ priority, onClose }: { priority: AIPriority; onClose: () => void }) {
  const colors = categoryColors[priority.category] || categoryColors.sleep;
  const Icon = iconMap[priority.icon] || Brain;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mx-auto mt-16 max-w-lg w-[calc(100%-2rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("p-4 border-b border-border", colors.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
                <Icon className={cn("w-5 h-5", colors.icon)} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{priority.title}</h3>
                <p className="text-xs text-muted-foreground">AI Health Priority Detail</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-surface/50 rounded-xl p-4">
            <p className="text-sm text-foreground leading-relaxed">{priority.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{priority.currentScore}</p>
              <p className="text-xs text-muted-foreground">Current Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">+{priority.potentialGain}</p>
              <p className="text-xs text-muted-foreground">Potential Gain</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{priority.confidence}%</p>
              <p className="text-xs text-muted-foreground">Confidence</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recommended Actions
            </h4>
            <div className="space-y-2">
              {priority.actionSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{priority.timeToImprove}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className={priority.trend === "improving" ? "text-emerald-400" : priority.trend === "declining" ? "text-red-400" : "text-muted-foreground"}>
                {priority.trend}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}