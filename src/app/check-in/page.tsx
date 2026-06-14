"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Heart,
  X,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MoodSelector } from "@/components/check-in/MoodSelector";
import { EnergySelector } from "@/components/check-in/EnergySelector";
import { SleepQualitySelector } from "@/components/check-in/SleepQualitySelector";
import { SleepHoursSlider } from "@/components/check-in/SleepHoursSlider";
import { SymptomsSelector } from "@/components/check-in/SymptomsSelector";
import { StressSelector } from "@/components/check-in/StressSelector";
import { ExerciseSelector } from "@/components/check-in/ExerciseSelector";
import { NotesInput } from "@/components/check-in/NotesInput";
import { MedicationReminderCard } from "@/components/check-in/MedicationReminderCard";
import { HydrationTrackerCard } from "@/components/check-in/HydrationTrackerCard";
import { CheckInComplete } from "@/components/check-in/CheckInComplete";

interface MorningCheckInData {
  sleepHours: number;
  sleepQuality: "poor" | "fair" | "good" | "excellent";
  energyLevel: "low" | "medium" | "high";
  mood: "poor" | "okay" | "good" | "great";
  symptoms: string[];
}

interface EveningCheckInData {
  stressLevel: "relaxed" | "normal" | "busy" | "very_stressful";
  exerciseCompleted: boolean;
  notes: string;
}

export default function CheckInPage() {
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "evening">("morning");
  const [isComplete, setIsComplete] = useState(false);
  const [customSymptom, setCustomSymptom] = useState("");
  const [morningData, setMorningData] = useState<MorningCheckInData>({
    sleepHours: 7,
    sleepQuality: "good",
    energyLevel: "medium",
    mood: "okay",
    symptoms: [],
  });
  const [eveningData, setEveningData] = useState<EveningCheckInData>({
    stressLevel: "normal",
    exerciseCompleted: false,
    notes: "",
  });
  const [showMedicationCenter, setShowMedicationCenter] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) {
      setTimeOfDay("evening");
    }
  }, []);

  const handleMorningSubmit = () => {
    setIsComplete(true);
  };

  const handleEveningSubmit = () => {
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <CheckInComplete
        timeOfDay={timeOfDay}
        onDismiss={() => setIsComplete(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                {timeOfDay === "morning" ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {timeOfDay === "morning" ? "Morning Check-In" : "Evening Check-In"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {timeOfDay === "morning" ? "Start your day right" : "Wrap up your day"}
                </p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {timeOfDay === "morning" ? "Answer a few quick questions" : "Quick daily summary"}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeOfDay === "morning" ? "25 seconds" : "15 seconds"}
            </span>
          </div>
          <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: timeOfDay === "morning" ? "60%" : "100%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {timeOfDay === "morning" ? (
            <motion.div
              key="morning"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Sleep</h2>
                    <p className="text-xs text-muted-foreground">How did you sleep?</p>
                  </div>
                </div>
                <SleepHoursSlider
                  value={morningData.sleepHours}
                  onChange={(val) => setMorningData({ ...morningData, sleepHours: val })}
                />
                <div className="mt-4">
                  <SleepQualitySelector
                    value={morningData.sleepQuality}
                    onChange={(val) => setMorningData({ ...morningData, sleepQuality: val })}
                  />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Energy Level</h2>
                    <p className="text-xs text-muted-foreground">How's your energy this morning?</p>
                  </div>
                </div>
                <EnergySelector
                  value={morningData.energyLevel}
                  onChange={(val) => setMorningData({ ...morningData, energyLevel: val })}
                />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Mood</h2>
                    <p className="text-xs text-muted-foreground">How are you feeling?</p>
                  </div>
                </div>
                <MoodSelector
                  value={morningData.mood}
                  onChange={(val) => setMorningData({ ...morningData, mood: val })}
                />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Any Symptoms?</h2>
                    <p className="text-xs text-muted-foreground">Optional - select all that apply</p>
                  </div>
                </div>
                <SymptomsSelector
                  value={morningData.symptoms}
                  onChange={(val) => setMorningData({ ...morningData, symptoms: val })}
                  customSymptom={customSymptom}
                  onCustomSymptomChange={setCustomSymptom}
                />
              </div>

              <MedicationReminderCard onViewCenter={() => setShowMedicationCenter(true)} />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleMorningSubmit}
                className="w-full btn-primary justify-center py-4 text-base"
              >
                Complete Morning Check-In
                <CheckCircle2 className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="evening"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Stress Level</h2>
                    <p className="text-xs text-muted-foreground">How was your day?</p>
                  </div>
                </div>
                <StressSelector
                  value={eveningData.stressLevel}
                  onChange={(val) => setEveningData({ ...eveningData, stressLevel: val })}
                />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Exercise</h2>
                    <p className="text-xs text-muted-foreground">Did you exercise today?</p>
                  </div>
                </div>
                <ExerciseSelector
                  value={eveningData.exerciseCompleted}
                  onChange={(val) => setEveningData({ ...eveningData, exerciseCompleted: val })}
                />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Notes</h2>
                    <p className="text-xs text-muted-foreground">Anything unusual? (Optional)</p>
                  </div>
                </div>
                <NotesInput
                  value={eveningData.notes}
                  onChange={(val) => setEveningData({ ...eveningData, notes: val })}
                />
              </div>

              <MedicationReminderCard onViewCenter={() => setShowMedicationCenter(true)} />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleEveningSubmit}
                className="w-full btn-primary justify-center py-4 text-base"
              >
                Complete Evening Check-In
                <CheckCircle2 className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <HydrationTrackerCard />
      </main>

      <AnimatePresence>
        {showMedicationCenter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowMedicationCenter(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-medication-muted flex items-center justify-center">
                    <Pill className="w-5 h-5 text-medication" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Medication Center</h2>
                    <p className="text-sm text-muted-foreground">Manage your medications</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMedicationCenter(false)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Medication management coming soon. You can track taken/skiped medications above.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}