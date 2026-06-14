"use client";

import { motion } from "framer-motion";
import { Cpu, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AIStatusCardProps {
  signals?: number;
  patterns?: number;
  activeRisks?: number;
}

export function AIStatusCard({
  signals = 6,
  patterns = 2,
  activeRisks = 1,
}: AIStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-secondary" />
        </div>
        <span className="text-xs font-semibold text-foreground">AI Status</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Monitoring</span>
          </div>
          <span className="text-xs font-bold text-foreground">
            {signals} Health Signals
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Patterns</span>
          </div>
          <span className="text-xs font-bold text-foreground">
            {patterns} Detected
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Active Risks</span>
          </div>
          <span className={cn(
            "text-xs font-bold",
            activeRisks > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {activeRisks}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}