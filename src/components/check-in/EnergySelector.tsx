"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Zap, Battery, BatteryFull } from "lucide-react";

type EnergyLevel = "low" | "medium" | "high";

const options: { value: EnergyLevel; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
  { value: "low", label: "Low", icon: Battery, color: "text-red-500", bg: "bg-red-50 border-red-200 dark:bg-red-500/20 dark:border-red-500/30" },
  { value: "medium", label: "Medium", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/30" },
  { value: "high", label: "High", icon: BatteryFull, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30" },
];

interface EnergySelectorProps {
  value: EnergyLevel;
  onChange: (value: EnergyLevel) => void;
}

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        return (
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
            <Icon className={cn("w-6 h-6 mb-1.5", option.color)} />
            <span className="text-sm font-medium text-foreground">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}