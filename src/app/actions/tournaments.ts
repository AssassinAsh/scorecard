"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CreateTournamentForm } from "@/types";

export async function createTournament(formData: CreateTournamentForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Only admin can create tournaments
  const admin = await isAdmin();
  if (!admin) {
    return { error: "Only admin can create tournaments" };
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

  revalidatePath("/dashboard");
  redirect(`/dashboard/tournament/${data.id}`);
}

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_roles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  return data?.is_admin || false;
}

export async function hasAccess(tournamentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Admins have access to everything
  const admin = await isAdmin();
  if (admin) return true;

  // Otherwise check tournament_scorers table
  const { data } = await supabase
    .from("tournament_scorers")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .single();

  return !!data;
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
