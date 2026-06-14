"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      console.log("[AUTH] session user id:", session?.user?.id, "email:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          console.log("[AUTH] onAuthStateChange user id:", session?.user?.id, "email:", session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    } catch {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      console.log("[AuthContext] signIn() START - email:", email);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("[AuthContext] signIn() COMPLETE - user id:", data?.user?.id, "email:", data?.user?.email, "error:", error);
        return { error: error?.message ?? null };
      } catch (err) {
        console.error("[AuthContext] signIn() EXCEPTION:", err);
        return { error: "Failed to sign in" };
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        return { error: error?.message ?? null, needsConfirmation: !error };
      } catch {
        return { error: "Failed to sign up" };
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        });
        return { error: error?.message ?? null };
      } catch {
        return { error: "Failed to send reset email" };
      }
    },
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: string | null }> => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error: error?.message ?? null };
      } catch {
        return { error: "Failed to update password" };
      }
    },
    []
  );

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}