"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardCheck, Sparkles } from "lucide-react";

export function CheckInButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href="/check-in"
        className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm text-primary-foreground overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, white) 100%)",
          boxShadow: "0 2px 12px var(--primary-glow)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Sparkles className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Complete Today&apos;s Check-In</span>
      </Link>
    </motion.div>
  );
}