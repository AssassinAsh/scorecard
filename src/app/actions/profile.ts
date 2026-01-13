"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UpdateProfileForm, UserProfile, TournamentAccess } from "@/types";

// Get current user's profile
export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

// Update user profile
export async function updateProfile(formData: UpdateProfileForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if profile exists
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Update existing profile
    const { error } = await supabase
      .from("user_profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new profile
    const { error } = await supabase.from("user_profiles").insert({
      user_id: user.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/onboarding");
  return { success: true };
}

// Get user's tournament access
export async function getUserTournamentAccess(): Promise<TournamentAccess[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tournament_scorers")
    .select(
      `
      tournament_id,
      granted_at,
      tournaments (
        name
      )
    `
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching tournament access:", error);
    return [];
  }

  return data.map((item: any) => ({
    tournament_id: item.tournament_id,
    tournament_name: item.tournaments?.name || "Unknown Tournament",
    granted_at: item.granted_at,
  }));
}

// Update user credits (Admin only)
export async function updateUserCredits(
  userId: string,
  amount: number,
  operation: "add" | "subtract" | "set"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if current user is Admin
  const { data: userRole } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!userRole || userRole.role !== "Admin") {
    return { error: "Only admins can update credits" };
  }

  // Get current credits
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    return { error: "User profile not found" };
  }

  let newCredits: number;
  switch (operation) {
    case "add":
      newCredits = profile.credits + amount;
      break;
    case "subtract":
      newCredits = Math.max(0, profile.credits - amount); // Don't allow negative
      break;
    case "set":
      newCredits = amount;
      break;
  }

  // Update credits
  const { error } = await supabase
    .from("user_profiles")
    .update({ credits: newCredits })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true, credits: newCredits };
}
