"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CreateTournamentForm, UserRole } from "@/types";

// Get current user's role
export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Viewer";

  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return (data?.role as UserRole) || "Viewer";
}

// Check if user is Admin
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "Admin";
}

// Check if user is Manager or Admin
export async function isManager(): Promise<boolean> {
  const role = await getUserRole();
  return role === "Admin" || role === "Manager";
}

// Check if user can create tournaments (Admin, Manager, or Scorer with credits)
export async function canCreateTournament(): Promise<boolean> {
  const role = await getUserRole();

  // Admin and Manager can always create
  if (role === "Admin" || role === "Manager") {
    return true;
  }

  // Scorers can create if they have credits
  if (role === "Scorer") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    return profile ? profile.credits >= 10 : false;
  }

  return false;
}

export async function createTournament(formData: CreateTournamentForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get user profile with role and credits
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, credits")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found. Please create a profile first." };
  }

  const role = profile.role as UserRole;

  // Check permissions - Admin, Manager, or Scorer can create
  if (role !== "Admin" && role !== "Manager" && role !== "Scorer") {
    return { error: "You need to be a Scorer to create tournaments" };
  }

  // Scorers need 10 credits to create a tournament
  if (role === "Scorer") {
    if (profile.credits < 10) {
      return {
        error:
          "Insufficient credits. You need 10 credits to create a tournament.",
      };
    }
  }

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name: formData.name,
      start_date: formData.start_date,
      location: formData.location,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Deduct 10 credits for Scorers (Admin and Manager don't pay)
  if (role === "Scorer") {
    await supabase
      .from("user_profiles")
      .update({ credits: profile.credits - 10 })
      .eq("user_id", user.id);
  }

  // Grant tournament access to the creator (for Scorers)
  if (role === "Scorer") {
    await supabase.from("tournament_scorers").insert({
      tournament_id: data.id,
      user_id: user.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/profile");
  redirect(`/tournament/${data.id}`);
}

export async function hasAccess(tournamentId: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const role = await getUserRole();

  // Admin and Manager have access to all tournaments
  if (role === "Admin" || role === "Manager") {
    return true;
  }

  // Scorers need explicit tournament access
  if (role === "Scorer") {
    // All scorers have access to the Test Tournament
    const TEST_TOURNAMENT_ID = "b2fd782e-0266-4d38-85b9-bbe873ccd8ff";
    if (tournamentId === TEST_TOURNAMENT_ID) {
      return true;
    }

    // Check if scorer created this tournament
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("created_by")
      .eq("id", tournamentId)
      .single();

    if (tournament?.created_by === user.id) {
      return true;
    }

    // Check if scorer has explicit access via tournament_scorers
    const { data } = await supabase
      .from("tournament_scorers")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id)
      .single();

    return !!data;
  }

  // Viewers have no access
  return false;
}

export async function getTournaments() {
  const supabase = await createClient();

  // Show all tournaments to everyone
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }

  return data;
}

export async function getTournamentById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching tournament:", error);
    return null;
  }

  return data;
}

export async function deleteTournament(tournamentId: string) {
  const supabase = await createClient();

  // Check if user is admin
  const admin = await isAdmin();
  if (!admin) {
    return { error: "Only admins can delete tournaments" };
  }

  // Delete tournament (CASCADE will handle related records)
  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", tournamentId);

  if (error) {
    console.error("Error deleting tournament:", error);
    return { error: "Failed to delete tournament" };
  }

  revalidatePath("/");
  redirect("/");
}
