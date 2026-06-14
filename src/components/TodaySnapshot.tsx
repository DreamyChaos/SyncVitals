"use client";

import { motion } from "framer-motion";
import { Moon, Droplets, Brain, Zap, Activity, Smile, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodaySnapshot as TodaySnapshotType } from "@/lib/data";

const metrics = [
  {
    key: "sleepHours" as keyof TodaySnapshotType,
    label: "Sleep",
    unit: "hrs",
    icon: Moon,
    color: "var(--sleep)",
    bg: "bg-sleep-muted",
  },
  {
    key: "waterIntake" as keyof TodaySnapshotType,
    label: "Water",
    unit: "L",
    icon: Droplets,
    color: "var(--hydration)",
    bg: "bg-hydration-muted",
  },
  {
    key: "stressLevel" as keyof TodaySnapshotType,
    label: "Stress",
    unit: "%",
    icon: Brain,
    color: "var(--stress)",
    bg: "bg-stress-muted",
    invert: true,
  },
  {
    key: "energyLevel" as keyof TodaySnapshotType,
    label: "Energy",
    unit: "%",
    icon: Zap,
    color: "var(--energy)",
    bg: "bg-energy-muted",
  },
  {
    key: "moodScore" as keyof TodaySnapshotType,
    label: "Mood",
    unit: "%",
    icon: Smile,
    color: "var(--mood)",
    bg: "bg-mood-muted",
  },
  {
    key: "exerciseMinutes" as keyof TodaySnapshotType,
    label: "Exercise",
    unit: "min",
    icon: Activity,
    color: "var(--medication)",
    bg: "bg-medication-muted",
  },
];

interface TodaySnapshotProps {
  snapshot: TodaySnapshotType;
}

export function TodaySnapshot({ snapshot }: TodaySnapshotProps) {
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
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-title font-semibold text-foreground">Today&apos;s Snapshot</h3>
            <p className="text-caption text-muted-foreground">Real-time metrics</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const value = snapshot[metric.key] as number;
          const displayValue = metric.key === "waterIntake" ? value.toFixed(1) : value;

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-surface-elevated transition-colors"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  metric.bg
                )}
                style={{ boxShadow: `0 4px 12px ${metric.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              <p className="text-xl font-bold text-foreground font-mono tracking-tight">
                {displayValue}
                <span className="text-xs font-medium text-muted-foreground ml-0.5">
                  {metric.unit}
                </span>
              </p>
              <p className="text-caption text-muted-foreground mt-0.5">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}