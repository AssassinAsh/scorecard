"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CreateBallForm, Team } from "@/types";
import {
  isLegalBall,
  calculateBallRuns,
  shouldRotateStrike,
  calculateOvers,
  shouldEndInnings,
} from "@/lib/cricket/scoring";

export async function startInnings(
  matchId: string,
  battingTeam: Team,
  bowlingTeam: Team
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("innings")
    .insert({
      match_id: matchId,
      batting_team: battingTeam,
      bowling_team: bowlingTeam,
      total_runs: 0,
      wickets: 0,
      balls_bowled: 0,
      is_completed: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/match/${matchId}`);
  return { data };
}

export async function startNewOver(
  inningsId: string,
  overNumber: number,
  bowlerId: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("overs")
    .insert({
      innings_id: inningsId,
      over_number: overNumber,
      bowler_id: bowlerId,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function recordBall(ballData: CreateBallForm) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Insert the ball record
  const { data: ball, error: ballError } = await supabase
    .from("balls")
    .insert(ballData)
    .select()
    .single();

  if (ballError) {
    return { error: ballError.message };
  }

  // Get the over to find innings_id
  const { data: over } = await supabase
    .from("overs")
    .select("innings_id")
    .eq("id", ballData.over_id)
    .single();

  if (!over) {
    return { error: "Over not found" };
  }

  // Get current innings data
  const { data: innings } = await supabase
    .from("innings")
    .select("*, matches(*)")
    .eq("id", over.innings_id)
    .single();

  if (!innings) {
    return { error: "Innings not found" };
  }

  // Calculate updates
  const totalRuns = calculateBallRuns(
    ballData.runs_off_bat,
    ballData.extras_runs
  );
  const isLegal = isLegalBall(ballData.extras_type);
  const hasWicket = ballData.wicket_type !== "None" ? 1 : 0;

  // Count legal balls in this innings
  const { count: legalBallCount } = await supabase
    .from("balls")
    .select("*", { count: "exact", head: true })
    .eq("over_id", ballData.over_id)
    .in("extras_type", ["None", "Bye", "LegBye"]);

  const totalLegalBalls = (legalBallCount || 0) + (isLegal ? 1 : 0);

  // Update innings aggregates
  const newTotalRuns = innings.total_runs + totalRuns;
  const newWickets = innings.wickets + hasWicket;
  const newBallsBowled = innings.balls_bowled + (isLegal ? 1 : 0);

  const shouldEnd = shouldEndInnings(
    newBallsBowled,
    newWickets,
    innings.matches.overs_per_innings
  );

  const { error: updateError } = await supabase
    .from("innings")
    .update({
      total_runs: newTotalRuns,
      wickets: newWickets,
      balls_bowled: newBallsBowled,
      is_completed: shouldEnd,
    })
    .eq("id", over.innings_id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Determine if strike should rotate
  const rotateStrike = shouldRotateStrike(
    ballData.runs_off_bat,
    ballData.extras_type,
    ballData.extras_runs
  );

  revalidatePath(`/dashboard/match/${innings.match_id}/score`);

  return {
    data: ball,
    rotateStrike,
    shouldEndInnings: shouldEnd,
    isLegalBall: isLegal,
  };
}

export async function getInningsWithBalls(inningsId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("innings")
    .select(
      `
      *,
      overs (
        *,
        balls (*)
      )
    `
    )
    .eq("id", inningsId)
    .single();

  if (error) {
    console.error("Error fetching innings:", error);
    return null;
  }

  return data;
}

export async function getCurrentInnings(matchId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("innings")
    .select("*")
    .eq("match_id", matchId)
    .eq("is_completed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching current innings:", error);
    return null;
  }

  return data;
}

export async function getAllInnings(matchId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("innings")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching innings:", error);
    return [];
  }

  return data;
}
