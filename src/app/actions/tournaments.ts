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

// Check if user can create tournaments (Admin or Manager)
export async function canCreateTournament(): Promise<boolean> {
  return await isManager();
}

export async function createTournament(formData: CreateTournamentForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Only Admin and Manager can create tournaments
  const canCreate = await canCreateTournament();
  if (!canCreate) {
    return { error: "Only Admin and Manager can create tournaments" };
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

  revalidatePath("/");
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
