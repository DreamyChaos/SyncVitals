"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Plus } from "lucide-react";

const symptomOptions = [
  { id: "headache", label: "Headache", emoji: "🤕" },
  { id: "fever", label: "Fever", emoji: "🌡️" },
  { id: "fatigue", label: "Fatigue", emoji: "😴" },
  { id: "cough", label: "Cough", emoji: "😷" },
  { id: "body_pain", label: "Body Pain", emoji: "💪" },
  { id: "dizziness", label: "Dizziness", emoji: "🌀" },
  { id: "nausea", label: "Nausea", emoji: "🤢" },
  { id: "sore_throat", label: "Sore Throat", emoji: "🗣️" },
  { id: "stomach_pain", label: "Stomach Pain", emoji: "😣" },
  { id: "shortness_breath", label: "Shortness of Breath", emoji: "😮‍💨" },
  { id: "none", label: "None", emoji: "✅" },
];

interface SymptomsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  customSymptom?: string;
  onCustomSymptomChange?: (value: string) => void;
}

export function SymptomsSelector({
  value,
  onChange,
  customSymptom = "",
  onCustomSymptomChange,
}: SymptomsSelectorProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);

  const toggleSymptom = (id: string) => {
    if (id === "none") {
      onChange(value.includes("none") ? [] : ["none"]);
      return;
    }

    if (id === "other") {
      const newSelected = value.filter((v) => v !== "none" && v !== "other");
      if (value.includes("other")) {
        onChange(newSelected);
        setShowOtherInput(false);
      } else {
        onChange([...newSelected, "other"]);
        setShowOtherInput(true);
      }
      return;
    }

    const newValue = value.filter((v) => v !== "none" && v !== "other");
    if (value.includes(id)) {
      onChange(newValue.filter((v) => v !== id));
    } else {
      onChange([...newValue, id]);
    }
  };

  const isSelected = (id: string) => {
    if (id === "other") return value.includes("other");
    return value.includes(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {symptomOptions.map((symptom) => {
          const selected = symptom.id === "none"
            ? value.includes("none")
            : value.includes(symptom.id);

          return (
            <motion.button
              key={symptom.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSymptom(symptom.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-all text-sm font-medium",
                selected
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-surface border-border text-muted-foreground hover:bg-surface-hover dark:bg-surface-hover dark:border-border dark:text-muted-foreground dark:hover:bg-surface"
              )}
            >
              <span>{symptom.emoji}</span>
              <span>{symptom.label}</span>
              {selected && symptom.id !== "none" && (
                <X className="w-3 h-3 ml-1" />
              )}
            </motion.button>
          );
        })}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleSymptom("other")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-all text-sm font-medium",
            isSelected("other")
              ? "bg-primary/10 border-primary text-primary"
              : "bg-surface border-border text-muted-foreground hover:bg-surface-hover dark:bg-surface-hover dark:border-border dark:text-muted-foreground dark:hover:bg-surface"
          )}
        >
          {isSelected("other") ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Other</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Other</span>
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showOtherInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => onCustomSymptomChange?.(e.target.value)}
                placeholder="Describe your symptom..."
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-surface-hover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}