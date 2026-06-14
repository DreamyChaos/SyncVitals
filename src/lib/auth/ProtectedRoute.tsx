"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (!isSupabaseConfigured()) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <AuthLoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function AuthLoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function AuthRoute({
  children,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.push(redirectTo);
      return;
    }

    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (isLoading) {
    return <AuthLoadingState />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}