"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function UserAvatarMenu() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setIsOpen(false);
    router.push("/login");
    router.refresh();
  };

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const initials = user.user_metadata?.name
    ? (user.user_metadata.name as string)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all",
          "hover:bg-surface",
          isOpen && "bg-surface"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.name || "User"}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-white">{initials}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 origin-top-right"
          >
            <div className="glass-card rounded-xl p-2 shadow-xl border border-border/50">
              <div className="px-3 py-2 border-b border-border mb-2">
                <p className="text-sm font-medium text-foreground">
                  {user.user_metadata?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-risk hover:bg-risk/10 transition-colors w-full"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AuthStatusBadge() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isSupabaseConfigured()) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
        Demo Mode
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-surface text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading
      </span>
    );
  }

  if (isAuthenticated) {
    return (
      <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-medication/10 text-medication border border-medication/20">
        <CheckCircle2 className="w-3 h-3" />
        Signed In
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-surface text-muted-foreground">
      <Shield className="w-3 h-3" />
      Not Signed In
    </span>
  );
}