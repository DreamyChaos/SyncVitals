"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Brain, Activity, AlertTriangle, TrendingUp, TrendingDown, Info, ChevronRight, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreContribution, ContributingFactor, AIPriority } from "@/lib/intelligence/types";

interface ScoreData {
  score: number;
  previousScore?: number;
  change?: number;
  contributions: ScoreContribution[];
  biggestPositive?: ScoreContribution;
  biggestNegative?: ScoreContribution;
}

interface HealthAgeData {
  healthAge: number;
  chronologicalAge: number;
  difference: number;
  positiveFactors?: string[];
  negativeFactors?: string[];
  explanations?: string[];
}

interface RiskData {
  title: string;
  severity: string;
  confidence: number;
  description: string;
  contributingFactors: ContributingFactor[];
  trend?: "increasing" | "stable" | "decreasing";
  recommendation?: string;
}

interface PriorityData {
  title: string;
  category: string;
  reason: string;
  expectedImpact: {
    scoreGain: number;
    benefits: string[];
  };
  actionSteps: string[];
}

interface ImprovementData {
  opportunities: {
    category: string;
    action: string;
    potentialGain: number;
    currentValue: number;
  }[];
}

type ExplainModalType = "score" | "healthAge" | "risk" | "priority" | "improvement";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ExplainModalType;
  data?: ScoreData | HealthAgeData | RiskData | PriorityData | ImprovementData;
}

const categoryColors: Record<string, string> = {
  sleep: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  hydration: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  mood: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  energy: "from-teal-500/20 to-emerald-500/20 border-teal-500/30",
  medication: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  stress: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  exercise: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  symptoms: "from-red-500/20 to-orange-500/20 border-red-500/30",
};

const categoryGradients: Record<string, string> = {
  sleep: "from-purple-500 to-violet-500",
  hydration: "from-blue-500 to-cyan-500",
  mood: "from-pink-500 to-rose-500",
  energy: "from-teal-500 to-emerald-500",
  medication: "from-emerald-500 to-green-500",
  stress: "from-orange-500 to-amber-500",
  exercise: "from-cyan-500 to-blue-500",
  symptoms: "from-red-500 to-orange-500",
};

export function ExplainModal({ isOpen, onClose, type, data }: ExplainModalProps) {
  const handleGetRecommendations = () => {
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case "score":
        return renderScoreContent(data as ScoreData);
      case "healthAge":
        return renderHealthAgeContent(data as HealthAgeData);
      case "risk":
        return renderRiskContent(data as RiskData);
      case "priority":
        return renderPriorityContent(data as PriorityData);
      case "improvement":
        return renderImprovementContent(data as ImprovementData);
      default:
        return null;
    }
  };

  const renderScoreContent = (data: ScoreData) => {
    if (!data) return null;
    const isPositiveChange = (data.change || 0) >= 0;

    return (
      <div className="space-y-6">
        {data.previousScore !== undefined && (
          <div className="bg-surface/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Previous Score</p>
                <p className="text-2xl font-bold text-foreground">{data.previousScore}</p>
              </div>
              <div className="flex items-center gap-1">
                {isPositiveChange ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className={cn(
                  "text-lg font-semibold",
                  isPositiveChange ? "text-emerald-500" : "text-red-500"
                )}>
                  {isPositiveChange ? "+" : ""}{data.change}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Score</p>
                <p className="text-2xl font-bold text-foreground">{data.score}</p>
              </div>
            </div>
          </div>
        )}

        {data.biggestPositive && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-medium mb-1">Biggest Positive Contributor</p>
            <p className="text-foreground font-medium">{data.biggestPositive.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{data.biggestPositive.reason}</p>
          </div>
        )}

        {data.biggestNegative && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-red-400 font-medium mb-1">Biggest Opportunity for Improvement</p>
            <p className="text-foreground font-medium">{data.biggestNegative.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{data.biggestNegative.reason}</p>
          </div>
        )}

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            Score Breakdown
          </h4>
          <div className="space-y-3">
            {data.contributions?.map((contribution, i) => (
              <motion.div
                key={contribution.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "p-3 rounded-lg border",
                  contribution.impact === "positive" && "bg-emerald-500/5 border-emerald-500/20",
                  contribution.impact === "negative" && "bg-red-500/5 border-red-500/20",
                  contribution.impact === "neutral" && "bg-surface border-border"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{contribution.label}</span>
                  <span className={cn(
                    "text-sm font-semibold",
                    contribution.impact === "positive" && "text-emerald-500",
                    contribution.impact === "negative" && "text-red-500",
                    contribution.impact === "neutral" && "text-muted-foreground"
                  )}>
                    {contribution.impact === "positive" ? "+" : contribution.impact === "negative" ? "" : ""}
                    {Math.round(contribution.value)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{contribution.reason}</p>
                <div className="mt-2 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", categoryGradients[contribution.category] || "from-gray-500 to-gray-400")}
                    initial={{ width: 0 }}
                    animate={{ width: `${(contribution.value / contribution.maxValue) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-surface/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Final Score</span>
            <span className="text-xl font-bold text-foreground">{data.score}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthAgeContent = (data: HealthAgeData) => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Actual Age</p>
            <p className="text-2xl font-bold text-foreground">{data.chronologicalAge}</p>
          </div>
          <div className="bg-secondary/10 rounded-xl p-4 text-center border border-secondary/20">
            <p className="text-xs text-secondary mb-1">Health Age</p>
            <p className="text-2xl font-bold text-secondary">{data.healthAge}</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Difference</p>
            <p className={cn(
              "text-2xl font-bold",
              data.difference < 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {data.difference > 0 ? "+" : ""}{data.difference} years
            </p>
          </div>
        </div>

        <div className="text-center p-4 bg-surface/50 rounded-xl">
          <p className="text-sm text-muted-foreground">
            Your health habits suggest your biological age is{" "}
            <span className={data.difference < 0 ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
              {Math.abs(data.difference)} years {data.difference < 0 ? "younger" : "older"}
            </span>{" "}
            than your actual age
          </p>
        </div>

        {data.positiveFactors && data.positiveFactors.length > 0 && (
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Positive Factors
            </h4>
            <div className="space-y-2">
              {data.positiveFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                  <span className="text-foreground">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.negativeFactors && data.negativeFactors.length > 0 && (
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Areas for Improvement
            </h4>
            <div className="space-y-2">
              {data.negativeFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                  <span className="text-foreground">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.explanations && data.explanations.length > 0 && (
          <div className="bg-surface/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">Analysis</p>
            <div className="space-y-1">
              {data.explanations.map((exp, i) => (
                <p key={i} className="text-sm text-foreground">{exp}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRiskContent = (data: RiskData) => {
    if (!data) return null;

    const severityColors = {
      low: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
      medium: "text-orange-500 bg-orange-500/10 border-orange-500/30",
      high: "text-red-500 bg-red-500/10 border-red-500/30",
      critical: "text-red-600 bg-red-600/10 border-red-600/30",
    };

    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border",
            severityColors[data.severity as keyof typeof severityColors] || severityColors.low
          )}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground">{data.title}</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full border capitalize font-medium",
                severityColors[data.severity as keyof typeof severityColors] || severityColors.low
              )}>
                {data.severity}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Confidence: {Math.round(data.confidence)}%</span>
              {data.trend && (
                <span className="flex items-center gap-1">
                  Trend: {data.trend === "increasing" ? "↗️" : data.trend === "decreasing" ? "↘️" : "→"}{" "}
                  {data.trend}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface/50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Why This Risk Was Detected</h4>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>

        {data.contributingFactors && data.contributingFactors.length > 0 && (
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-foreground mb-4">Contributing Factors</h4>
            <div className="space-y-3">
              {data.contributingFactors.map((factor, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-surface rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{factor.name}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      factor.impact > 0 ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {factor.impact > 0 ? "High impact" : "Moderate impact"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                  {factor.value > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Value: {factor.value}%</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {data.recommendation && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-secondary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Recommendation
            </h4>
            <p className="text-sm text-foreground">{data.recommendation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderPriorityContent = (data: PriorityData) => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="bg-surface/50 rounded-xl p-4">
          <h4 className="text-xs text-muted-foreground mb-1">Why This Priority Matters</h4>
          <p className="text-sm text-foreground">{data.reason}</p>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            Expected Impact
          </h4>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                +{data.expectedImpact.scoreGain} Health Score points
              </span>
            </div>
            <div className="space-y-1">
              {data.expectedImpact.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Action Steps</h4>
          <div className="space-y-2">
            {data.actionSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-lg">
                <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-secondary">{i + 1}</span>
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderImprovementContent = (data: ImprovementData) => {
    if (!data?.opportunities) return null;

    return (
      <div className="space-y-6">
        <div className="bg-surface/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Focus on these high-impact actions to improve your health score most effectively.
          </p>
        </div>

        <div className="space-y-3">
          {data.opportunities.map((opp, i) => (
            <motion.div
              key={opp.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-4 rounded-xl border",
                categoryColors[opp.category.toLowerCase()] || "bg-surface border-border"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">{opp.category}</h4>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+{opp.potentialGain}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{opp.action}</p>
              <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", categoryGradients[opp.category.toLowerCase()] || "from-gray-500 to-gray-400")}
                  initial={{ width: `${opp.currentValue}%` }}
                  animate={{ width: `${Math.min(opp.currentValue + opp.potentialGain, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {Math.round(opp.currentValue)}% → Target: {Math.round(opp.currentValue + opp.potentialGain)}%
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const typeConfig = {
    score: { title: "Health Score Breakdown", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    healthAge: { title: "Health Age Analysis", icon: Brain, color: "text-blue-400", bg: "bg-blue-500/20" },
    risk: { title: "Risk Details", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20" },
    priority: { title: "Priority Explanation", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/20" },
    improvement: { title: "Health Improvement Opportunities", icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  };

  const config = typeConfig[type] || typeConfig.score;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.bg)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {config.title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {renderContent()}

              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={handleGetRecommendations}
                  className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Get personalized recommendations
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}