"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface ExerciseSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ExerciseSelector({ value, onChange }: ExerciseSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange(true)}
        className={cn(
          "flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all",
          value === true
            ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-500/20 dark:border-emerald-500"
            : "bg-surface border-border dark:bg-surface-hover"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
          value === true ? "bg-emerald-500" : "bg-surface-hover"
        )}>
          <Check className={cn("w-6 h-6", value === true ? "text-white" : "text-muted-foreground")} />
        </div>
        <span className={cn(
          "text-sm font-semibold",
          value === true ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"
        )}>
          Yes
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">Exercise completed</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange(false)}
        className={cn(
          "flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all",
          value === false
            ? "bg-slate-100 border-slate-300 dark:bg-surface dark:border-slate-600"
            : "bg-surface border-border dark:bg-surface-hover"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
          value === false ? "bg-slate-300 dark:bg-slate-600" : "bg-surface-hover"
        )}>
          <X className={cn("w-6 h-6", value === false ? "text-white" : "text-muted-foreground")} />
        </div>
        <span className={cn(
          "text-sm font-semibold",
          value === false ? "text-slate-700 dark:text-slate-300" : "text-foreground"
        )}>
          No
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">Rest day</span>
      </motion.button>
    </div>
  );
}