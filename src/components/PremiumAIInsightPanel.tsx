"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Clock, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Calendar, Heart, Activity, Droplets, Moon, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightResult {
  response: string;
  provider: string;
  responseTime: number;
}

interface ParsedHealthReport {
  summary: string;
  whyItMatters: string[];
  keyRisks: string[];
  recommendedActions: string[];
  nextWeekPlan: string[];
}

function parseAIResponse(response: string): ParsedHealthReport {
  const sections = response.split(/\n\n|\n(?=[A-Z])/);
  const report: ParsedHealthReport = {
    summary: "",
    whyItMatters: [],
    keyRisks: [],
    recommendedActions: [],
    nextWeekPlan: [],
  };

  let currentSection: keyof ParsedHealthReport | null = null;

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const lowerSection = trimmed.toLowerCase();

    if (lowerSection.includes("summary") || lowerSection.includes("health score") || lowerSection.includes("overview")) {
      report.summary = trimmed.replace(/^(summary|health summary|overview):?\s*/i, "");
      currentSection = "summary";
    } else if (lowerSection.includes("why") || lowerSection.includes("matters") || lowerSection.includes("impact")) {
      report.whyItMatters.push(trimmed.replace(/^(why this matters|impact|reason):?\s*/i, ""));
      currentSection = "whyItMatters";
    } else if (lowerSection.includes("risk") || lowerSection.includes("concern") || lowerSection.includes("warning")) {
      report.keyRisks.push(trimmed.replace(/^(key risks|risks|concerns|warning):?\s*/i, ""));
      currentSection = "keyRisks";
    } else if (lowerSection.includes("recommend") || lowerSection.includes("action") || lowerSection.includes("improve")) {
      report.recommendedActions.push(trimmed.replace(/^(recommended|recommendation|action):?\s*/i, ""));
      currentSection = "recommendedActions";
    } else if (lowerSection.includes("next week") || lowerSection.includes("plan") || lowerSection.includes("future")) {
      report.nextWeekPlan.push(trimmed.replace(/^(next week|plan|forward):?\s*/i, ""));
      currentSection = "nextWeekPlan";
    } else {
      if (currentSection === "whyItMatters" || currentSection === "keyRisks" || currentSection === "recommendedActions" || currentSection === "nextWeekPlan") {
        report[currentSection].push(trimmed);
      } else if (!report.summary) {
        report.summary = trimmed;
      }
    }
  }

  if (!report.summary && response) {
    report.summary = response.substring(0, 300) + (response.length > 300 ? "..." : "");
  }

  return report;
}

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: string[];
  borderColor: string;
}

function ReportSection({ title, icon: Icon, iconColor, items, borderColor }: SectionProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("p-4 rounded-xl border", borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PremiumAIInsightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  result: AIInsightResult | null;
  isLoading: boolean;
  error: string | null;
  healthContext?: {
    healthScore: number;
    healthAge: number;
    sleepHours: number;
    hydrationLiters: number;
    stressLevel: string;
    activityLevel: string;
    steps: number;
    heartRate: number;
    scoreChange: number;
  };
}

export function PremiumAIInsightPanel({
  isOpen,
  onClose,
  question,
  result,
  isLoading,
  error,
  healthContext,
}: PremiumAIInsightPanelProps) {
  const parsedReport = result?.response ? parseAIResponse(result.response) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto mt-8 max-w-3xl w-[calc(100%-2rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-4rem)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Health Intelligence Report
                  </h3>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {question}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center relative">
                    <Activity className="w-10 h-10 text-secondary animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-secondary/30 animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium mb-1">
                      Analyzing your health data...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deep analysis typically takes 30-90 seconds
                    </p>
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    <HealthMetric icon={Heart} label="Heart" value={healthContext?.heartRate ? `${healthContext.heartRate} bpm` : "--"} />
                    <HealthMetric icon={Moon} label="Sleep" value={healthContext?.sleepHours ? `${healthContext.sleepHours}h` : "--"} />
                    <HealthMetric icon={Droplets} label="Hydration" value={healthContext?.hydrationLiters ? `${healthContext.hydrationLiters}L` : "--"} />
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-foreground font-medium">{error}</p>
                  <button
                    onClick={onClose}
                    className="text-sm text-secondary hover:text-secondary/80"
                  >
                    Close and try again
                  </button>
                </div>
              )}

              {result && !isLoading && parsedReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-6 space-y-6"
                >
                  <div className="bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 rounded-xl p-5 border border-secondary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-secondary" />
                      <h4 className="text-sm font-semibold text-secondary">Health Summary</h4>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {parsedReport.summary || result.response}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Your Score</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {healthContext?.healthScore || "--"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {healthContext && (healthContext.scoreChange >= 0 ? `+${healthContext.scoreChange}` : healthContext.scoreChange)} from last week
                      </p>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Health Age</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {healthContext?.healthAge || "--"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">years old</p>
                    </div>
                  </div>

                  <ReportSection
                    title="Why This Matters"
                    icon={Sparkles}
                    iconColor="text-purple-400"
                    items={parsedReport.whyItMatters}
                    borderColor="border-purple-500/20 bg-purple-500/5"
                  />

                  <ReportSection
                    title="Key Risks"
                    icon={AlertTriangle}
                    iconColor="text-amber-400"
                    items={parsedReport.keyRisks}
                    borderColor="border-amber-500/20 bg-amber-500/5"
                  />

                  <ReportSection
                    title="Recommended Actions"
                    icon={CheckCircle2}
                    iconColor="text-emerald-400"
                    items={parsedReport.recommendedActions}
                    borderColor="border-emerald-500/20 bg-emerald-500/5"
                  />

                  {parsedReport.nextWeekPlan.length > 0 && (
                    <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-cyan-400">Next 7 Days Plan</h4>
                      </div>
                      <div className="space-y-2">
                        {parsedReport.nextWeekPlan.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {result.provider}
                      </span>
                      <span className="text-xs text-emerald-400">
                        {result.responseTime}ms
                      </span>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1"
                    >
                      Done
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HealthMetric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}