"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, AlertOctagon, ShieldAlert, ChevronRight, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskDetection } from "@/lib/data";

const severityConfig: Record<
  RiskDetection["severity"],
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; glow: string }
> = {
  critical: {
    icon: AlertOctagon,
    color: "text-risk",
    bg: "bg-risk-muted",
    border: "border-risk/20",
    glow: "shadow-risk/20",
  },
  high: {
    icon: AlertTriangle,
    color: "text-stress",
    bg: "bg-stress-muted",
    border: "border-stress/20",
    glow: "shadow-stress/20",
  },
  medium: {
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
  low: {
    icon: Info,
    color: "text-hydration",
    bg: "bg-hydration-muted",
    border: "border-hydration/20",
    glow: "shadow-hydration/20",
  },
};

const confidenceColors: Record<string, string> = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-muted-foreground",
};

const getConfidenceLevel = (confidence: number): string => {
  if (confidence >= 80) return "high";
  if (confidence >= 50) return "medium";
  return "low";
};

interface SilentRiskDetectionProps {
  risks: RiskDetection[];
  onExplainRisk?: (risk: RiskDetection) => void;
  showConfidence?: boolean;
}

export function SilentRiskDetection({ risks, onExplainRisk, showConfidence = true }: SilentRiskDetectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="ai-panel p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-risk-muted flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-risk" />
          </div>
          <div>
            <h3 className="text-title font-semibold text-foreground">Risk Detection</h3>
            <p className="text-caption text-muted-foreground">AI-monitored health risks</p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-semibold px-3 py-1.5 rounded-full border",
          risks.some(r => r.severity === 'critical')
            ? "bg-risk-muted text-risk border-risk/30"
            : "bg-stress-muted text-stress border-stress/30"
        )}>
          {risks.length} Active
        </span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {risks.map((risk, index) => {
          const config = severityConfig[risk.severity];
          const Icon = config.icon;

          return (
            <motion.div
              key={risk.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={cn(
                "group p-4 rounded-xl border transition-all duration-200",
                config.bg,
                config.border,
                "hover:shadow-lg",
                config.glow
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border border-current/10",
                  config.bg
                )}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-body font-semibold text-foreground">
                      {risk.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {showConfidence && (risk as any).confidence !== undefined && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                          (risk as any).confidence >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : (risk as any).confidence >= 50
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-surface text-muted-foreground"
                        )}>
                          <Percent className="w-3 h-3" />
                          <span>{Math.round((risk as any).confidence)}%</span>
                        </div>
                      )}
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        risk.severity === "critical" && "bg-risk/20 text-risk",
                        risk.severity === "high" && "bg-stress/20 text-stress",
                        risk.severity === "medium" && "bg-amber-500/20 text-amber-400",
                        risk.severity === "low" && "bg-hydration/20 text-hydration"
                      )}>
                        {risk.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-caption text-muted-foreground mb-3 leading-relaxed">
                    {risk.reason}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {risk.timestamp}
                    </span>
                    <button
                      onClick={() => onExplainRisk?.(risk)}
                      className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}