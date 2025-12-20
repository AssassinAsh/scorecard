"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateMatchForm,
  TossDetailsForm,
  CreatePlayerForm,
  TeamSide,
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
      team_a_name: formData.team_a_name,
      team_b_name: formData.team_b_name,
      match_date: formData.match_date,
      overs_per_innings: formData.overs_per_innings,
      status: "Upcoming",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/tournament/${formData.tournament_id}`);
  redirect(`/dashboard/match/${data.id}/setup`);
}

export async function getMatchesByTournament(tournamentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: true });

  if (error) {
    console.error("Error fetching matches:", error);
    return [];
  }

  return data;
}

export async function getMatchById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      tournaments (*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching match:", error);
    return null;
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

  const { error } = await supabase
    .from("matches")
    .update({
      toss_winner: tossData.toss_winner,
      toss_decision: tossData.toss_decision,
    })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/match/${matchId}`);
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
    revalidatePath(`/dashboard/match/${players[0].match_id}`);
  }

  return { success: true };
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
