"use client";

import { motion } from "framer-motion";
import { Pill, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Medication } from "@/lib/data";

interface MedicationSummaryProps {
  medications: Medication[];
}

export function MedicationSummary({ medications }: MedicationSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">
            Medication Summary
          </h3>
        </div>
        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
          {medications.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {medications.map((med, index) => {
          const isHighCompliance = med.compliance >= 90;
          const isMediumCompliance = med.compliance >= 70 && med.compliance < 90;

          return (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dosage}</p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    isHighCompliance
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isMediumCompliance
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                  )}
                >
                  {isHighCompliance ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {med.compliance}%
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{med.schedule}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Next: </span>
                <span className="text-foreground font-medium">
                  {med.nextDose} at {med.nextDoseTime}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}