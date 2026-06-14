"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sun, Moon, Monitor, Bell, Droplets, ClipboardCheck, Shield, ChevronRight, Pill, X, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    medication: true,
    hydration: true,
    checkin: true,
  });
  const [showInfoModal, setShowInfoModal] = useState<{ title: string; content: string } | null>(null);

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDataExport = () => {
    const data = localStorage.getItem("syncvitals-data");
    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `syncvitals-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      setShowInfoModal({
        title: "No Data",
        content: "No health data found to export. Start tracking your health to create exportable data.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">Customize your experience</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
              <p className="text-xs text-muted-foreground">Choose your theme</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <motion.button
                  key={t.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(t.value as "light" | "dark" | "system")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-surface-hover"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                    {t.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">Manage your reminders</p>
            </div>
          </div>

          <div className="space-y-3">
            <ToggleRow
              icon={Pill}
              label="Medication Reminders"
              description="Get reminded when it's time to take your medication"
              enabled={notifications.medication}
              onToggle={() => toggleNotification("medication")}
            />
            <ToggleRow
              icon={Droplets}
              label="Hydration Reminders"
              description="Gentle nudges to stay hydrated throughout the day"
              enabled={notifications.hydration}
              onToggle={() => toggleNotification("hydration")}
            />
            <ToggleRow
              icon={ClipboardCheck}
              label="Daily Check-In Reminders"
              description="Morning and evening reminders to complete your check-in"
              enabled={notifications.checkin}
              onToggle={() => toggleNotification("checkin")}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Privacy & Data</h3>
              <p className="text-xs text-muted-foreground">Your information is safe</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowInfoModal({ title: "Privacy Policy", content: "SyncVitals takes your privacy seriously. All your health data is stored locally on your device and is never shared with third parties. We do not collect, transmit, or store any of your personal health information on external servers. Your data remains under your control at all times." })}
              className="w-full flex items-center justify-between p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-foreground">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowInfoModal({ title: "Terms of Service", content: "SyncVitals is a health tracking and insights application. It is not a medical device and should not be used for medical diagnosis or treatment. Always consult with healthcare professionals for medical advice. By using SyncVitals, you agree to use the app responsibly." })}
              className="w-full flex items-center justify-between p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-foreground">Terms of Service</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={handleDataExport}
              className="w-full flex items-center justify-between p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-foreground">Data Export</span>
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              All your health data is stored locally on your device. We never collect or share your personal information.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">SyncVitals v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Built with care for your health</p>
        </div>
      </main>

      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{showInfoModal.title}</h2>
              <button
                onClick={() => setShowInfoModal(null)}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{showInfoModal.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          enabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
        )}
      >
        <motion.div
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}