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

  console.log("=== updateProfile: Start ===");
  console.log("updateProfile: User:", user?.id, user?.email);

  if (!user) {
    console.error("updateProfile: No user found");
    return { error: "Unauthorized" };
  }

  // Check if profile exists
  console.log("updateProfile: Checking if profile exists");
  const { data: existing, error: checkError } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  console.log("updateProfile: Check result:", {
    exists: !!existing,
    error: checkError?.code,
  });

  if (existing) {
    // Update existing profile
    console.log("updateProfile: Updating existing profile");
    const { error } = await supabase
      .from("user_profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("updateProfile: Update error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return { error: `Database error: ${error.message}` };
    }
    console.log("updateProfile: Update successful");
  } else {
    // Create new profile
    console.log("updateProfile: Creating new profile");
    console.log("updateProfile: Insert data:", {
      user_id: user.id,
      email: user.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    const { error } = await supabase.from("user_profiles").insert({
      user_id: user.id,
      email: user.email!,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    if (error) {
      console.error("updateProfile: Insert error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { error: `Database error saving new user: ${error.message}` };
    }
    console.log("updateProfile: Insert successful");
  }

  console.log("=== updateProfile: Success ===");
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

  const accessList: TournamentAccess[] = [];

  // Get tournaments from tournament_scorers table
  const { data: scorerAccess, error } = await supabase
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
  } else if (scorerAccess) {
    scorerAccess.forEach((item: any) => {
      accessList.push({
        tournament_id: item.tournament_id,
        tournament_name: item.tournaments?.name || "Unknown Tournament",
        granted_at: item.granted_at,
      });
    });
  }

  // Get tournaments created by the user
  const { data: createdTournaments } = await supabase
    .from("tournaments")
    .select("id, name, created_at")
    .eq("created_by", user.id);

  if (createdTournaments) {
    createdTournaments.forEach((tournament) => {
      // Check if not already in the list
      if (!accessList.find((a) => a.tournament_id === tournament.id)) {
        accessList.push({
          tournament_id: tournament.id,
          tournament_name: `${tournament.name} (Creator)`,
          granted_at: tournament.created_at,
        });
      }
    });
  }

  // Add Test Tournament for all scorers
  const TEST_TOURNAMENT_ID = "b2fd782e-0266-4d38-85b9-bbe873ccd8ff";
  if (!accessList.find((a) => a.tournament_id === TEST_TOURNAMENT_ID)) {
    const { data: testTournament } = await supabase
      .from("tournaments")
      .select("name, created_at")
      .eq("id", TEST_TOURNAMENT_ID)
      .single();

    if (testTournament) {
      accessList.push({
        tournament_id: TEST_TOURNAMENT_ID,
        tournament_name: `${testTournament.name} (All Scorers)`,
        granted_at: testTournament.created_at,
      });
    }
  }

  // Sort by granted_at descending
  return accessList.sort(
    (a, b) =>
      new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime()
  );
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

// Upgrade user to Scorer role with initial credits
export async function becomeScorer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, credits")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    // Create profile if it doesn't exist
    const { error } = await supabase.from("user_profiles").insert({
      user_id: user.id,
      email: user.email!,
      role: "Scorer",
      credits: 20,
    });

    if (error) {
      return { error: error.message };
    }
  } else if (profile.role !== "Viewer") {
    return { error: "You are already a Scorer or have a higher role" };
  } else {
    // Upgrade to Scorer with initial credits
    const { error } = await supabase
      .from("user_profiles")
      .update({
        role: "Scorer",
        credits: 20,
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}
