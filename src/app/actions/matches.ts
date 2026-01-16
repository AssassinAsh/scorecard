"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, hasAccess } from "../actions/tournaments";
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

  // Check if user has access to this tournament
  const access = await hasAccess(formData.tournament_id);
  if (!access) {
    return { error: "No permission to create matches in this tournament" };
  }

  // Get user profile for credits check
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, credits")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Scorers need 5 credits to create a match
  if (profile.role === "Scorer") {
    if (profile.credits < 5) {
      return {
        error: "Insufficient credits. You need 5 credits to create a match.",
      };
    }
  }

  const { data, error } = await supabase
    .from("matches")
    .insert({
      tournament_id: formData.tournament_id,
      team_a_id: formData.team_a_id,
      team_b_id: formData.team_b_id,
      match_date: formData.match_date,
      overs_per_innings: formData.overs_per_innings,
      match_type: formData.match_type,
      status: "Upcoming",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Deduct 5 credits for Scorers (Admin and Manager don't pay)
  if (profile.role === "Scorer") {
    await supabase
      .from("user_profiles")
      .update({ credits: profile.credits - 5 })
      .eq("user_id", user.id);
  }

  // Auto-populate match players from persistent team rosters (team_players)
  try {
    const { data: roster } = await supabase
      .from("team_players")
      .select("id, team_id, name")
      .in("team_id", [formData.team_a_id, formData.team_b_id]);

    if (roster && roster.length > 0) {
      const teamAPlayers = roster
        .filter((p: any) => p.team_id === formData.team_a_id)
        .slice(0, 11);
      const teamBPlayers = roster
        .filter((p: any) => p.team_id === formData.team_b_id)
        .slice(0, 11);

      const newPlayers: {
        match_id: string;
        team: "A" | "B";
        name: string;
        batting_order: number;
      }[] = [];

      teamAPlayers.forEach((p: any, index: number) => {
        newPlayers.push({
          match_id: data.id,
          team: "A",
          name: p.name,
          batting_order: index + 1,
        });
      });

      teamBPlayers.forEach((p: any, index: number) => {
        newPlayers.push({
          match_id: data.id,
          team: "B",
          name: p.name,
          batting_order: index + 1,
        });
      });

      if (newPlayers.length > 0) {
        await supabase.from("players").insert(newPlayers);
      }
    }
  } catch (rosterError) {
    console.error(
      "Error pre-populating match players from team roster:",
      rosterError
    );
  }

  // Refresh the public tournament and match pages
  revalidatePath(`/tournament/${formData.tournament_id}`);
  revalidatePath(`/match/${data.id}`);
  redirect(`/match/${data.id}`);
}

export async function getMatchesByTournament(tournamentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      team_a:teams!matches_team_a_id_fkey(id, name, contact_number),
      team_b:teams!matches_team_b_id_fkey(id, name, contact_number)
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
    team_a_contact: match.team_a?.contact_number ?? null,
    team_b_contact: match.team_b?.contact_number ?? null,
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
      team_a:teams!matches_team_a_id_fkey(id, name, contact_number),
      team_b:teams!matches_team_b_id_fkey(id, name, contact_number)
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
      team_a_contact: data.team_a?.contact_number ?? null,
      team_b_contact: data.team_b?.contact_number ?? null,
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

export async function deleteMatch(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const admin = await isAdmin();
  if (!admin) {
    return;
  }

  const matchId = formData.get("matchId") as string | null;
  if (!matchId) {
    return;
  }

  const { data: match } = await supabase
    .from("matches")
    .select("tournament_id")
    .eq("id", matchId)
    .single();

  const tournamentId = match?.tournament_id as string | undefined;

  const { error } = await supabase.from("matches").delete().eq("id", matchId);

  if (error) {
    console.error("Error deleting match", error.message);
    return;
  }

  if (tournamentId) {
    revalidatePath(`/tournament/${tournamentId}`);
    redirect(`/tournament/${tournamentId}`);
  }

  // If no tournament ID, redirect to home
  redirect("/");
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

  // Also persist these player names to the team roster so
  // they can be reused in future matches.
  try {
    if (players.length > 0) {
      const matchId = players[0].match_id;
      const { data: match } = await supabase
        .from("matches")
        .select("team_a_id, team_b_id")
        .eq("id", matchId)
        .single();

      if (match) {
        const rosterInserts = players.map((p) => {
          const teamId =
            p.team === "A"
              ? (match as any).team_a_id
              : (match as any).team_b_id;
          return {
            team_id: teamId,
            name: p.name.trim(),
          };
        });

        await supabase.from("team_players").upsert(rosterInserts, {
          onConflict: "team_id,name",
        });
      }
    }
  } catch (rosterError) {
    console.error("Error updating team roster from addPlayers:", rosterError);
  }

  if (players.length > 0) {
    revalidatePath(`/match/${players[0].match_id}`);
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

  // Also persist this player in the team roster so their
  // name can be reused in future matches for the same team.
  try {
    const { data: match } = await supabase
      .from("matches")
      .select("team_a_id, team_b_id")
      .eq("id", matchId)
      .single();

    if (match) {
      const teamId =
        player.team === "A"
          ? (match as any).team_a_id
          : (match as any).team_b_id;

      if (teamId) {
        await supabase.from("team_players").upsert(
          {
            team_id: teamId,
            name: player.name.trim(),
          },
          { onConflict: "team_id,name" }
        );
      }
    }
  } catch (rosterError) {
    console.error("Error updating team roster from createPlayer:", rosterError);
  }

  revalidatePath(`/match/${matchId}`);
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

export async function updatePlayerName(
  matchId: string,
  playerId: string,
  newName: string
): Promise<{ data: Player | null; error?: string }> {
  const supabase = await createClient();

  const trimmed = newName.trim();
  if (!trimmed) {
    return { data: null, error: "Player name cannot be empty" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Fetch existing player to get team
  const { data: existingPlayer, error: fetchError } = await supabase
    .from("players")
    .select("id, team")
    .eq("id", playerId)
    .eq("match_id", matchId)
    .single();

  if (fetchError || !existingPlayer) {
    return { data: null, error: fetchError?.message || "Player not found" };
  }

  // Enforce unique player names per team within a match
  const { data: existing, error: existingError } = await supabase
    .from("players")
    .select("id")
    .eq("match_id", matchId)
    .eq("team", (existingPlayer as any).team)
    .eq("name", trimmed)
    .neq("id", playerId);

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
    .update({ name: trimmed })
    .eq("id", playerId)
    .eq("match_id", matchId)
    .select()
    .single();

  if (error) {
    console.error("Error updating player name:", error);
    return { data: null, error: error.message };
  }

  // Also keep team roster in sync
  try {
    const { data: match } = await supabase
      .from("matches")
      .select("team_a_id, team_b_id")
      .eq("id", matchId)
      .single();

    if (match) {
      const teamId =
        (existingPlayer as any).team === "A"
          ? (match as any).team_a_id
          : (match as any).team_b_id;

      if (teamId) {
        await supabase.from("team_players").upsert(
          {
            team_id: teamId,
            name: trimmed,
          },
          { onConflict: "team_id,name" }
        );
      }
    }
  } catch (rosterError) {
    console.error(
      "Error updating team roster from updatePlayerName:",
      rosterError
    );
  }

  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/score`);
  revalidatePath(`/match/${matchId}/display`);

  return { data: data as Player };
}
