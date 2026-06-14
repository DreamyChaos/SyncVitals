"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Droplets, Pill, ClipboardCheck, TrendingUp, Sparkles, Check, X, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-context";

const notificationIcons = {
  hydration: Droplets,
  medication: Pill,
  checkin: ClipboardCheck,
  healthscore: TrendingUp,
  insight: Sparkles,
};

const notificationColors = {
  hydration: { icon: "text-hydration", bg: "bg-hydration-muted" },
  medication: { icon: "text-medication", bg: "bg-medication-muted" },
  checkin: { icon: "text-emerald-400", bg: "bg-emerald-500/10" },
  healthscore: { icon: "text-secondary", bg: "bg-secondary-muted" },
  insight: { icon: "text-stress", bg: "bg-stress-muted" },
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markNotificationRead, clearNotifications } = useAppState();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-surface transition-colors"
      >
        <Bell className={cn(
          "w-5 h-5 transition-colors",
          unreadCount > 0 ? "text-secondary" : "text-muted-foreground"
        )} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-risk text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-2xl shadow-xl z-50 border border-border"
          >
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-secondary" />
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs font-medium text-secondary hover:text-secondary/80 transition-colors px-2 py-1 rounded-lg hover:bg-secondary/10"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-border/30">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const colors = notificationColors[notification.type];

                  return (
                    <div
                      key={notification.id}
                      onClick={() => markNotificationRead(notification.id)}
                      className={cn(
                        "p-4 hover:bg-surface-elevated/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border", colors.bg, "border-transparent")}>
                          <Icon className={cn("w-4 h-4", colors.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}