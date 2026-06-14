"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SleepQuality = "poor" | "fair" | "good" | "excellent";

const options: { value: SleepQuality; label: string; emoji: string; color: string }[] = [
  { value: "poor", label: "Poor", emoji: "😞", color: "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400" },
  { value: "fair", label: "Fair", emoji: "😐", color: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400" },
  { value: "good", label: "Good", emoji: "🙂", color: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400" },
  { value: "excellent", label: "Excellent", emoji: "😁", color: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400" },
];

interface SleepQualitySelectorProps {
  value: SleepQuality;
  onChange: (value: SleepQuality) => void;
}

export function SleepQualitySelector({ value, onChange }: SleepQualitySelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((option) => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
            option.color,
            value === option.value && "ring-2 ring-primary ring-offset-2 dark:ring-offset-background"
          )}
        >
          <span className="text-2xl mb-1">{option.emoji}</span>
          <span className="text-xs font-medium">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}