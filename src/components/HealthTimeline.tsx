"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Info, Clock, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/data";
import { useAppState } from "@/lib/app-context";

const typeConfig: Record<
  TimelineEvent["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; label: string }
> = {
  improvement: {
    icon: TrendingUp,
    color: "text-medication",
    bg: "bg-medication-muted",
    border: "border-medication/30",
    label: "Progress",
  },
  concern: {
    icon: TrendingDown,
    color: "text-stress",
    bg: "bg-stress-muted",
    border: "border-stress/30",
    label: "Concern",
  },
  risk: {
    icon: AlertTriangle,
    color: "text-risk",
    bg: "bg-risk-muted",
    border: "border-risk/30",
    label: "Risk",
  },
  info: {
    icon: Info,
    color: "text-hydration",
    bg: "bg-hydration-muted",
    border: "border-hydration/30",
    label: "Info",
  },
};

export function HealthTimeline({ onViewComplete }: { onViewComplete?: () => void }) {
  const { timeline } = useAppState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="ai-panel p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-title font-semibold text-foreground">Health Timeline</h3>
            <p className="text-caption text-muted-foreground">Your health journey</p>
          </div>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
          {timeline.length} Events
        </span>
      </div>

      <div className="relative pl-1">
        <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-secondary/60 via-border to-transparent" />

        <div className="space-y-5">
          {timeline.map((event, index) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative flex items-start gap-5"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border-2",
                      config.bg,
                      config.border
                    )}
                  >
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                      {typeof event.date === 'string' ? event.date : event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

                  <p className="text-body font-semibold text-foreground mb-1.5">
                    {event.title}
                  </p>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onViewComplete}
        className="w-full mt-6 pt-5 border-t border-border/50 flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors group"
      >
        <Sparkles className="w-4 h-4" />
        View Complete Timeline
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}