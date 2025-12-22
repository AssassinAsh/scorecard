"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TeamInfo } from "@/types";

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
  if (params.name) updateData.name = params.name.trim();
  if (params.contact_number !== undefined)
    updateData.contact_number = params.contact_number.trim() || null;

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
