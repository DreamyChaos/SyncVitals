"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-context";

const encouragingMessages = [
  "Nice. You're getting closer to your goal.",
  "Great intake! Your body will thank you.",
  "Hydration at its finest. Keep it up!",
  "Smart choice. Optimal hydration achieved.",
  "Well done. Your cells are happy.",
];

export function HydrationTrackerCard() {
  const { hydration, addHydration, addTimelineEvent } = useAppState();
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const percentage = Math.round((hydration.current / hydration.goal) * 100);
  const remaining = Math.max(0, hydration.goal - hydration.current);

  const handleAdd = (amount: number) => {
    addHydration(amount);
    const msg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    setLastMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);

    if (hydration.current + amount >= hydration.goal) {
      addTimelineEvent({
        date: "Today",
        title: "Daily hydration goal achieved",
        type: "improvement",
        description: `Consumed ${hydration.current + amount}ml of water today.`,
      });
    }
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 2000) {
      handleAdd(amount);
      setCustomAmount("");
      setShowCustom(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Hydration Tracker</h3>
            <p className="text-xs text-muted-foreground">Stay hydrated throughout the day</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-surface rounded-xl p-4 mb-4">
        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-foreground font-mono">
              {(hydration.current / 1000).toFixed(1)}L
            </span>
            <span className="text-sm text-muted-foreground">
              / {(hydration.goal / 1000).toFixed(1)}L
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {remaining > 0 ? `${(remaining / 1000).toFixed(1)}L remaining` : "Goal achieved!"}
          </div>
        </div>

        <div className="relative h-2.5 bg-slate-200 dark:bg-surface-hover rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(250)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            250ml
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(500)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium dark:bg-blue-500/20 dark:text-blue-400"
          >
            <Plus className="w-4 h-4" />
            500ml
          </motion.button>
        </div>

        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + Custom amount
          </button>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Amount (ml)"
              min="50"
              max="2000"
              className="flex-1 px-3 py-2 bg-white dark:bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomAdd}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              Add
            </motion.button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400">{lastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {percentage >= 100 && (
        <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Daily goal achieved!
          </span>
        </div>
      )}
    </div>
  );
}