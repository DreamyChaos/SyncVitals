"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesInput({ value, onChange }: NotesInputProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Log anything notable - symptoms, events, feelings..."
        rows={3}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">Optional</span>
        {value.length > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-xs text-secondary"
          >
            <Sparkles className="w-3 h-3" />
            AI will analyze this
          </motion.span>
        )}
      </div>
    </div>
  );
}