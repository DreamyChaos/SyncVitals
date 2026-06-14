"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StressLevel = "relaxed" | "normal" | "busy" | "very_stressful";

const options: { value: StressLevel; label: string; icon: string; color: string; bg: string }[] = [
  { value: "relaxed", label: "Relaxed", icon: "😌", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30" },
  { value: "normal", label: "Normal", icon: "😊", color: "text-blue-500", bg: "bg-blue-50 border-blue-200 dark:bg-blue-500/20 dark:border-blue-500/30" },
  { value: "busy", label: "Busy", icon: "😰", color: "text-amber-500", bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/30" },
  { value: "very_stressful", label: "Very Stressful", icon: "😫", color: "text-red-500", bg: "bg-red-50 border-red-200 dark:bg-red-500/20 dark:border-red-500/30" },
];

interface StressSelectorProps {
  value: StressLevel;
  onChange: (value: StressLevel) => void;
}

export function StressSelector({ value, onChange }: StressSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
            option.bg,
            value === option.value && "ring-2 ring-primary ring-offset-2 dark:ring-offset-background"
          )}
        >
          <span className="text-3xl mb-1.5">{option.icon}</span>
          <span className="text-sm font-medium text-foreground">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}