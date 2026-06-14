import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" });

    if (error) {
      console.error("Error upserting profile:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch {
    return { error: "Failed to save profile" };
  }
}