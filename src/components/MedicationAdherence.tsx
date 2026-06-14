"use client";

import { motion } from "framer-motion";
import { Pill, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Medication } from "@/lib/data";

interface MedicationAdherenceProps {
  medications: Medication[];
  onViewDetails?: (medication: Medication) => void;
}

export function MedicationAdherence({ medications, onViewDetails }: MedicationAdherenceProps) {
  const totalMissed = medications.reduce((sum, med) => sum + med.missedThisWeek, 0);
  const overallAdherence = Math.round(
    medications.reduce((sum, med) => sum + med.compliance, 0) / medications.length
  );

  const getAdherenceColor = (compliance: number) => {
    if (compliance >= 90) return { text: "text-medication", bg: "bg-medication-muted", border: "border-medication/30" };
    if (compliance >= 70) return { text: "text-stress", bg: "bg-stress-muted", border: "border-stress/30" };
    return { text: "text-risk", bg: "bg-risk-muted", border: "border-risk/30" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="ai-panel p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-medication-muted flex items-center justify-center">
            <Pill className="w-5 h-5 text-medication" />
          </div>
          <div>
            <h3 className="text-title font-semibold text-foreground">Medications</h3>
            <p className="text-caption text-muted-foreground">Track your adherence</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 bg-medication-muted text-medication border border-medication/30 rounded-full">
          {medications.length} Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-surface-elevated border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-medication" />
            <span className="text-caption font-medium text-muted-foreground">Adherence</span>
          </div>
          <p className="text-2xl font-bold text-foreground font-mono tracking-tight">{overallAdherence}%</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-elevated border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className={cn(
              "w-4 h-4",
              totalMissed > 0 ? "text-stress" : "text-medication"
            )} />
            <span className="text-caption font-medium text-muted-foreground">Missed</span>
          </div>
          <p className="text-2xl font-bold text-foreground font-mono tracking-tight">{totalMissed}</p>
        </div>
      </div>

      <div className="space-y-3">
        {medications.map((med, index) => {
          const adherenceStyle = getAdherenceColor(med.compliance);

          return (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group p-4 rounded-xl bg-surface-elevated border border-border/50 hover:border-border transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-body font-semibold text-foreground">{med.name}</p>
                  <p className="text-caption text-muted-foreground">{med.dosage}</p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border",
                    adherenceStyle.bg,
                    adherenceStyle.border,
                    adherenceStyle.text
                  )}
                >
                  {med.compliance >= 90 ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {med.compliance}%
                </div>
              </div>

              <div className="flex items-center justify-between text-caption">
                <span className="text-muted-foreground font-medium">{med.schedule}</span>
                {med.missedThisWeek > 0 && (
                  <span className="text-stress flex items-center gap-1 font-medium">
                    <XCircle className="w-3 h-3" />
                    {med.missedThisWeek} missed
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-caption">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Next: </span>
                  <span className="text-foreground font-semibold">
                    {med.nextDose} at {med.nextDoseTime}
                  </span>
                </div>
                <button
                  onClick={() => onViewDetails?.(med)}
                  className="text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 text-caption font-medium"
                >
                  Details
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}