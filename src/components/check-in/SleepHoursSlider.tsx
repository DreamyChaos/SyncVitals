"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SleepHoursSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function SleepHoursSlider({ value, onChange }: SleepHoursSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Hours slept</span>
        <span className="text-2xl font-bold text-foreground font-mono">{value}h</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-100 dark:bg-surface-hover rounded-full appearance-none cursor-pointer slider-track"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(value / 12) * 100}%, var(--surface-hover) ${(value / 12) * 100}%, var(--surface-hover) 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">0h</span>
          <span className="text-[10px] text-muted-foreground">12h</span>
        </div>
      </div>
    </div>
  );
}