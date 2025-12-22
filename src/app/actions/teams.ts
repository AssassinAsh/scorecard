"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TeamInfo } from "@/types";

const CONTACT_REGEX = /^\d{10}$/;

export async function getTeamsByTournament(
  tournamentId: string
): Promise<TeamInfo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("name");

  if (error) {
    console.error("Error fetching teams:", error);
    return [];
  }

  return data || [];
}

export async function getTeamById(teamId: string): Promise<TeamInfo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (error) {
    console.error("Error fetching team:", error);
    return null;
  }

  return data;
}

export async function createTeam(params: {
  tournament_id: string;
  name: string;
  contact_number?: string;
}): Promise<{ error?: string; team?: TeamInfo }> {
  const supabase = await createClient();

  if (
    params.contact_number &&
    !CONTACT_REGEX.test(params.contact_number.trim())
  ) {
    return { error: "Please enter a valid 10-digit mobile number" };
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({
      tournament_id: params.tournament_id,
      name: params.name.trim(),
      contact_number: params.contact_number?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating team:", error);
    return { error: error.message };
  }

  revalidatePath(`/tournament/${params.tournament_id}`);
  return { team: data };
}

export async function updateTeam(params: {
  id: string;
  name?: string;
  contact_number?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const updateData: Record<string, any> = {};

  // Validate team name if provided
  if (params.name !== undefined) {
    const trimmedName = params.name.trim();
    if (!trimmedName) {
      return { error: "Team name cannot be empty" };
    }
    updateData.name = trimmedName;
  }

  // Validate contact number if provided
  if (params.contact_number !== undefined) {
    const trimmed = params.contact_number.trim();
    if (trimmed && !CONTACT_REGEX.test(trimmed)) {
      return { error: "Please enter a valid 10-digit mobile number" };
    }
    updateData.contact_number = trimmed || null;
  }

  const { error } = await supabase
    .from("teams")
    .update(updateData)
    .eq("id", params.id);

  if (error) {
    console.error("Error updating team:", error);
    return { error: error.message };
  }

  const team = await getTeamById(params.id);
  if (team) {
    revalidatePath(`/tournament/${team.tournament_id}`);
  }

  return {};
}

export async function deleteTeam(teamId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const team = await getTeamById(teamId);
  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) {
    console.error("Error deleting team:", error);
    return { error: error.message };
  }

  if (team) {
    revalidatePath(`/tournament/${team.tournament_id}`);
  }

  return {};
}

export async function updateTeamContacts(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const teamAId = formData.get("team_a_id") as string | null;
  const teamBId = formData.get("team_b_id") as string | null;
  const teamAContact = (formData.get("team_a_contact") as string | null) || "";
  const teamBContact = (formData.get("team_b_contact") as string | null) || "";
  const tournamentId = formData.get("tournament_id") as string | null;
  const matchId = formData.get("match_id") as string | null;

  if (teamAId) {
    await updateTeam({ id: teamAId, contact_number: teamAContact });
  }

  if (teamBId) {
    await updateTeam({ id: teamBId, contact_number: teamBContact });
  }

  if (matchId) {
    revalidatePath(`/match/${matchId}`);
    revalidatePath(`/match/${matchId}/score`);
  }

  if (tournamentId) {
    revalidatePath(`/tournament/${tournamentId}`);
  }
}
