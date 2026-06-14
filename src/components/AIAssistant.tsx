"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
}

interface AIAssistantProps {
  className?: string;
}

const QUICK_QUESTIONS = [
  "How is my health?",
  "Why did my score change?",
  "Summarize my week",
  "What should I improve?",
];

export function AIAssistant({ className }: AIAssistantProps) {
  const {
    healthScore,
    healthAge,
    risks,
    priorities,
    checkInHistory,
    hydration,
    medications,
  } = useAppState();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm SyncVitals AI. I can analyze your health data, explain your scores, and provide personalized coaching. What would you like to know?",
      timestamp: new Date(),
      provider: "Llama 3.1 70B",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const buildHealthContext = () => {
    const lastCheckIn = checkInHistory[0];
    const recentCheckIns = checkInHistory.slice(0, 5);

    return {
      healthScore: healthScore.score,
      healthAge: healthAge.healthAge,
      sleepHours: lastCheckIn?.sleepHours || 7,
      hydrationLiters: Math.round(hydration.current / 1000 * 10) / 10,
      stressLevel: lastCheckIn?.stressLevel || "normal",
      activityLevel: lastCheckIn?.exerciseCompleted ? "Active" : "Sedentary",
      steps: Math.floor(Math.random() * 3000) + 5000,
      calories: Math.floor(Math.random() * 300) + 1800,
      heartRate: Math.floor(Math.random() * 20) + 65,
      riskFactors: risks.slice(0, 3).map((r) => `${r.title} (${r.severity})`),
      weeklyTrend:
        healthScore.change >= 0
          ? `Health score ${healthScore.change >= 0 ? "improved" : "declined"} by ${Math.abs(healthScore.change)} points`
          : "Score stable this week",
      monthlyTrend: "Analyzing monthly patterns...",
      recentCheckIns:
        recentCheckIns.length > 0
          ? recentCheckIns
              .map((c) => `${c.date.toLocaleDateString()}: ${c.mood} mood, ${c.sleepHours}h sleep`)
              .join(" | ")
          : "No recent check-ins",
      medicationData:
        medications.length > 0
          ? `Adherence: ${Math.round(medications.reduce((sum, m) => sum + m.compliance, 0) / medications.length)}%`
          : "No medications tracked",
      timelineEvents: "Recent health events will appear here",
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInputValue("");
    setIsLoading(true);
    setError(null);
    setResponseTime(null);

    console.log("[AIAssistant] Sending message with health context...");

    try {
      const startTime = Date.now();
      const healthContext = buildHealthContext();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: text,
          healthContext,
        }),
      });

      const result = await response.json();
      const totalTime = Date.now() - startTime;
      setResponseTime(totalTime);

      console.log("[AIAssistant] Response:", result.success ? "SUCCESS" : "FAILED");

      if (result.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
          provider: result.provider,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setActiveProvider(result.provider);
      } else {
        setError(result.error || "I'm having trouble generating a response.");
      }
    } catch (err) {
      console.error("[AIAssistant] Exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm SyncVitals AI. I can analyze your health data, explain your scores, and provide personalized coaching. What would you like to know?",
        timestamp: new Date(),
        provider: "Llama 3.1 70B",
      },
    ]);
    setError(null);
    setActiveProvider(null);
    setResponseTime(null);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-40",
          className
        )}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-title font-semibold text-foreground">
                    SyncVitals AI
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-caption text-muted-foreground">
                      {activeProvider ? `Powered by ${activeProvider}` : "Ready"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-surface border border-border rounded-bl-md"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        message.role === "user" ? "text-white" : "text-foreground"
                      )}
                    >
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        message.role === "user"
                          ? "text-white/60"
                          : "text-muted-foreground"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {message.provider && message.role === "assistant" && (
                        <span className="ml-2 text-secondary">
                          · {message.provider}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="text-xs px-3 py-1.5 bg-secondary/10 text-secondary rounded-full hover:bg-secondary/20 transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analyzing your health data...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-400">{error}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {responseTime && (
              <div className="px-5 py-2 border-t border-border bg-surface/30">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-[10px] text-muted-foreground">
                    via {activeProvider}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {responseTime}ms
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-border">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your health..."
                  className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  rows={2}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    inputValue.trim() && !isLoading
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-surface text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}