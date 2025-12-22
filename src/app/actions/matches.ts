"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateMatchForm,
  TossDetailsForm,
  CreatePlayerForm,
  TeamSide,
  Player,
  MatchStatus,
} from "@/types";

export async function createMatch(formData: CreateMatchForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("matches")
    .insert({
      tournament_id: formData.tournament_id,
      team_a_id: formData.team_a_id,
      team_b_id: formData.team_b_id,
      match_date: formData.match_date,
      overs_per_innings: formData.overs_per_innings,
      status: "Upcoming",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Refresh the public tournament and match pages
  revalidatePath(`/tournament/${formData.tournament_id}`);
  revalidatePath(`/match/${data.id}`);
  redirect(`/match/${data.id}/setup`);
}

export async function getMatchesByTournament(tournamentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      team_a:teams!matches_team_a_id_fkey(id, name),
      team_b:teams!matches_team_b_id_fkey(id, name)
    `
    )
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: true });

  if (error) {
    console.error("Error fetching matches:", error);
    return [];
  }

  // Flatten team data for compatibility, falling back to legacy columns
  return (data || []).map((match: any) => ({
    ...match,
    team_a_name: match.team_a?.name || match.team_a_name || "",
    team_b_name: match.team_b?.name || match.team_b_name || "",
  }));
}

export async function getMatchById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      tournaments (*),
      team_a:teams!matches_team_a_id_fkey(id, name),
      team_b:teams!matches_team_b_id_fkey(id, name)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching match:", error);
    return null;
  }

  // Flatten team data for compatibility, falling back to legacy columns
  if (data) {
    return {
      ...data,
      team_a_name: data.team_a?.name || (data as any).team_a_name || "",
      team_b_name: data.team_b?.name || (data as any).team_b_name || "",
    };
  }

  return data;
}

export async function updateToss(matchId: string, tossData: TossDetailsForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: match } = await supabase
    .from("matches")
    .select("status, tournament_id")
    .eq("id", matchId)
    .single();

  const newStatus: MatchStatus =
    match && match.status === "Upcoming"
      ? "Starting Soon"
      : match?.status || "Upcoming";

  const { error } = await supabase
    .from("matches")
    .update({
      toss_winner: tossData.toss_winner,
      toss_decision: tossData.toss_decision,
      status: newStatus,
    })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  // Refresh public match + related tournament pages
  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/score`);
  if (match?.tournament_id) {
    revalidatePath(`/tournament/${match.tournament_id}`);
  }
  return { success: true };
}

export async function updateMatchWinner(matchId: string, winner: TeamSide) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("matches")
    .update({
      status: "Completed",
      winner_team: winner,
    })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/match/${matchId}`);
  return { success: true };
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/score`);
  return { success: true };
}

export async function addPlayers(players: CreatePlayerForm[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("players").insert(players);

  if (error) {
    return { error: error.message };
  }

  if (players.length > 0) {
    revalidatePath(`/match/${players[0].match_id}`);
    revalidatePath(`/match/${players[0].match_id}/setup`);
  }

  return { success: true };
}

export async function createPlayer(
  matchId: string,
  player: Omit<CreatePlayerForm, "match_id">
): Promise<{ data: Player | null; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }
  // Enforce unique player names per team within a match
  const { data: existing, error: existingError } = await supabase
    .from("players")
    .select("id")
    .eq("match_id", matchId)
    .eq("team", player.team)
    .eq("name", player.name.trim());

  if (existingError) {
    console.error("Error checking existing players:", existingError);
    return { data: null, error: "Unable to validate player name" };
  }

  if (existing && existing.length > 0) {
    return {
      data: null,
      error: "This team already has a player with that name.",
    };
  }

  const { data, error } = await supabase
    .from("players")
    .insert({
      ...player,
      match_id: matchId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    return { data: null, error: error.message };
  }

  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/setup`);
  return { data };
}

export async function getPlayersByMatch(matchId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("match_id", matchId)
    .order("team", { ascending: true })
    .order("batting_order", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }

  return data;
}
