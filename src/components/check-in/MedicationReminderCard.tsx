"use client";

import { motion } from "framer-motion";
import { Pill, Clock, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-context";

interface MedicationReminderCardProps {
  onViewCenter?: () => void;
}

export function MedicationReminderCard({ onViewCenter }: MedicationReminderCardProps) {
  const { medications, updateMedicationStatus, addTimelineEvent } = useAppState();

  const activeMedications = medications.filter((m) => m.status === "active");
  const pendingMeds = activeMedications.filter((m) => m.currentStatus === "pending");
  const takenMeds = activeMedications.filter((m) => m.currentStatus === "taken");
  const takenToday = takenMeds.length;

  const handleTaken = (med: typeof medications[0]) => {
    updateMedicationStatus(med.id, "taken");
    addTimelineEvent({
      date: "Today",
      title: `${med.name} taken`,
      type: "improvement",
      description: `${med.name} (${med.dosage}) taken at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  const handleSkip = (med: typeof medications[0]) => {
    updateMedicationStatus(med.id, "skipped");
    addTimelineEvent({
      date: "Today",
      title: `${med.name} skipped`,
      type: "info",
      description: `${med.name} dose was skipped.`,
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Medication Reminder</h3>
            <p className="text-xs text-muted-foreground">
              {takenToday} of {activeMedications.length} taken today
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {activeMedications.map((med) => (
          <div
            key={med.id}
            className={cn(
              "p-3 rounded-xl border-2 transition-all",
              med.currentStatus === "taken" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30",
              med.currentStatus === "skipped" && "bg-slate-50 border-slate-200 dark:bg-surface dark:border-slate-700",
              med.currentStatus === "pending" && "bg-slate-50 border-slate-200 dark:bg-surface dark:border-slate-700"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.dosage}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{med.schedule}</span>
              </div>
            </div>

            {med.currentStatus === "pending" && (
              <div className="flex gap-2 mt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTaken(med)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium"
                >
                  <Check className="w-3 h-3" />
                  Taken
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSkip(med)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-medium dark:bg-slate-700 dark:text-slate-300"
                >
                  <X className="w-3 h-3" />
                  Skip
                </motion.button>
              </div>
            )}

            {med.currentStatus === "taken" && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                <Check className="w-3 h-3" />
                <span>Taken at {med.takenAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}

            {med.currentStatus === "skipped" && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>Skipped</span>
              </div>
            )}

            {med.status === "paused" && (
              <div className="flex items-center gap-1.5 text-xs text-stress mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>Paused</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onViewCenter}
        className="text-xs text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 mt-4"
      >
        View Medication Center
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}