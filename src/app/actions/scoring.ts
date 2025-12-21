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

// Convenience helper to start a second innings for a match.
// Batting/bowling sides are derived from the first completed innings.
export async function startSecondInnings(matchId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get all innings for this match ordered by creation
  const { data: inningsList, error: inningsError } = await supabase
    .from("innings")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (inningsError) {
    return { error: inningsError.message };
  }

  if (!inningsList || inningsList.length === 0) {
    return { error: "No first innings found for this match" };
  }

  const firstInnings = inningsList[0];

  if (!firstInnings.is_completed) {
    return { error: "First innings is not yet completed" };
  }

  // Second innings: swap batting and bowling teams
  const battingTeam: Team = firstInnings.bowling_team;
  const bowlingTeam: Team = firstInnings.batting_team;

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

  // Mark match as live again for the chase
  await supabase.from("matches").update({ status: "Live" }).eq("id", matchId);

  revalidatePath(`/dashboard/match/${matchId}`);
  revalidatePath(`/dashboard/match/${matchId}/score`);
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

  // Fetch match_id for revalidation
  const { data: innings } = await supabase
    .from("innings")
    .select("match_id")
    .eq("id", inningsId)
    .single();

  if (innings) {
    revalidatePath(`/match/${innings.match_id}`);
    revalidatePath(`/dashboard/match/${innings.match_id}/score`);
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

  // Calculate updates for this ball
  const totalRuns = calculateBallRuns(
    ballData.runs_off_bat,
    ballData.extras_runs
  );
  const isLegal = isLegalBall(ballData.extras_type);
  const hasWicket = ballData.wicket_type !== "None" ? 1 : 0;

  // Recalculate total legal balls for the entire innings from the balls table.
  // This guarantees that wides/no-balls are never counted as legal deliveries
  // even if there was any earlier aggregation bug.
  const { count: legalBallCount } = await supabase
    .from("balls")
    .select("id, overs!inner(innings_id)", { count: "exact", head: true })
    .eq("overs.innings_id", over.innings_id)
    .in("extras_type", ["None", "Bye", "LegBye"]);

  const newBallsBowled = legalBallCount || 0;

  // Update innings aggregates
  const newTotalRuns = innings.total_runs + totalRuns;
  const newWickets = innings.wickets + hasWicket;
  let inningsCompleted = shouldEndInnings(
    newBallsBowled,
    newWickets,
    innings.matches.overs_per_innings
  );

  // Determine match result in case of second innings
  // Fetch all innings for this match to find the first innings target.
  const { data: allInnings } = await supabase
    .from("innings")
    .select("*")
    .eq("match_id", innings.match_id)
    .order("created_at", { ascending: true });

  if (allInnings && allInnings.length > 0) {
    const firstInnings = allInnings[0];

    // If current innings IS the first, handle innings break when completed
    if (firstInnings.id === innings.id) {
      if (inningsCompleted) {
        await supabase
          .from("matches")
          .update({ status: "Innings Break" })
          .eq("id", innings.match_id);

        revalidatePath(`/match/${innings.match_id}`);
        revalidatePath(`/dashboard/match/${innings.match_id}`);
      }
    } else {
      // Otherwise we're in a chase scenario (second innings)
      const target = firstInnings.total_runs + 1;

      // Chasing team has reached or passed the target
      if (newTotalRuns >= target) {
        inningsCompleted = true;

        // Mark match as completed with winner = current batting team
        await supabase
          .from("matches")
          .update({ status: "Completed", winner_team: innings.batting_team })
          .eq("id", innings.match_id);

        revalidatePath(`/match/${innings.match_id}`);
      } else if (
        // Innings naturally completed (all balls / all out) and scores level
        inningsCompleted &&
        newTotalRuns === firstInnings.total_runs
      ) {
        // Draw (tie): mark match as completed with no winner
        await supabase
          .from("matches")
          .update({ status: "Completed", winner_team: null })
          .eq("id", innings.match_id);

        revalidatePath(`/match/${innings.match_id}`);
      } else if (
        // Innings completed and chasing side fell short of the target
        inningsCompleted &&
        newTotalRuns < firstInnings.total_runs
      ) {
        // Defending side wins: first-innings batting team is the winner
        await supabase
          .from("matches")
          .update({
            status: "Completed",
            winner_team: firstInnings.batting_team,
          })
          .eq("id", innings.match_id);

        revalidatePath(`/match/${innings.match_id}`);
      }
    }
  }

  const { error: updateError } = await supabase
    .from("innings")
    .update({
      total_runs: newTotalRuns,
      wickets: newWickets,
      balls_bowled: newBallsBowled,
      is_completed: inningsCompleted,
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
    shouldEndInnings: inningsCompleted,
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

export async function getRetirementsForInnings(inningsId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("retirements")
    .select("*")
    .eq("innings_id", inningsId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching retirements:", error);
    return [];
  }

  return data || [];
}

export async function getCurrentInnings(matchId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("innings")
    .select("*")
    .eq("match_id", matchId)
    .eq("is_completed", false)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching current innings:", error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
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

// Fetch recent balls for an innings.
// "limit" is intentionally generous so that a full over (including wides/no-balls)
// is always contained within the result set. This ensures the UI can correctly
// compute legal deliveries and display the whole over.
export async function getRecentBalls(inningsId: string, limit: number = 36) {
  const supabase = await createClient();

  // Join through overs table since balls table doesn't have innings_id
  const { data, error } = await supabase
    .from("balls")
    .select(
      `
      *,
      overs!inner(
        innings_id,
        bowler_id
      )
    `
    )
    .eq("overs.innings_id", inningsId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent balls:", error);
    return [];
  }

  // Extract bowler_id from nested overs and add it to ball
  return data.map(({ overs, ...ball }) => ({
    ...ball,
    bowler_id: overs?.bowler_id || null,
  }));
}

export async function retireBatsman(
  inningsId: string,
  playerId: string,
  reason: string
) {
  const supabase = await createClient();

  if (!reason.trim()) {
    return { error: "Retire reason is required" };
  }

  const { data: existing, error: existingError } = await supabase
    .from("retirements")
    .select("id")
    .eq("innings_id", inningsId)
    .eq("player_id", playerId)
    .limit(1);

  if (existingError) {
    return { error: existingError.message };
  }

  if (existing && existing.length > 0) {
    return {
      error: "This batter is already marked as retired in this innings.",
    };
  }

  const { error } = await supabase.from("retirements").insert({
    innings_id: inningsId,
    player_id: playerId,
    reason: reason.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  const { data: innings } = await supabase
    .from("innings")
    .select("match_id")
    .eq("id", inningsId)
    .single();

  if (innings) {
    revalidatePath(`/match/${innings.match_id}`);
    revalidatePath(`/dashboard/match/${innings.match_id}/score`);
  }

  return { success: true };
}

export async function updateOverBowler(overId: string, bowlerId: string) {
  const supabase = await createClient();

  const { data: over, error: overError } = await supabase
    .from("overs")
    .select("innings_id")
    .eq("id", overId)
    .single();

  if (overError || !over) {
    return { error: overError?.message || "Over not found" };
  }

  const { error } = await supabase
    .from("overs")
    .update({ bowler_id: bowlerId })
    .eq("id", overId);

  if (error) {
    return { error: error.message };
  }

  const { data: innings } = await supabase
    .from("innings")
    .select("match_id")
    .eq("id", over.innings_id)
    .single();

  if (innings) {
    revalidatePath(`/match/${innings.match_id}`);
    revalidatePath(`/dashboard/match/${innings.match_id}/score`);
  }

  return { success: true };
}

// Delete the most recent ball for an innings and recompute aggregates & match state
export async function deleteLastBall(inningsId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Fetch all balls for this innings ordered by creation time (latest first)
  const { data: balls, error: ballsError } = await supabase
    .from("balls")
    .select(
      `
      id,
      runs_off_bat,
      extras_type,
      extras_runs,
      wicket_type,
      overs!inner(
        innings_id
      )
    `
    )
    .eq("overs.innings_id", inningsId)
    .order("created_at", { ascending: false });

  if (ballsError) {
    return { error: ballsError.message };
  }

  if (!balls || balls.length === 0) {
    return { error: "No deliveries to delete" };
  }

  const [lastBall, ...remainingBallsSnapshot] = balls as any[];

  // Delete the last ball. We select the deleted row so we can
  // verify that a row was actually removed (RLS can silently
  // prevent deletion by filtering rows out).
  const { data: deletedBalls, error: deleteError } = await supabase
    .from("balls")
    .delete()
    .eq("id", lastBall.id)
    .select("id");

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!deletedBalls || deletedBalls.length === 0) {
    return {
      error:
        "Unable to delete last delivery (no rows affected). Please check Supabase RLS policies for the balls table.",
    };
  }

  // Fetch innings with match for recalculation
  const { data: innings, error: inningsError } = await supabase
    .from("innings")
    .select("*, matches(*)")
    .eq("id", inningsId)
    .single();

  if (inningsError || !innings) {
    return { error: inningsError?.message || "Innings not found" };
  }

  // Recompute aggregates from all remaining balls in database
  const { data: remainingBalls } = await supabase
    .from("balls")
    .select(
      `
      runs_off_bat,
      extras_runs,
      extras_type,
      wicket_type,
      overs!inner(
        innings_id
      )
    `
    )
    .eq("overs.innings_id", inningsId);

  let newTotalRuns = 0;
  let newWickets = 0;
  let newBallsBowled = 0;

  if (remainingBalls && remainingBalls.length > 0) {
    for (const ball of remainingBalls) {
      newTotalRuns += calculateBallRuns(ball.runs_off_bat, ball.extras_runs);

      if (isLegalBall(ball.extras_type)) {
        newBallsBowled += 1;
      }

      if (ball.wicket_type && ball.wicket_type !== "None") {
        newWickets += 1;
      }
    }
  }

  let inningsCompleted = shouldEndInnings(
    newBallsBowled,
    newWickets,
    innings.matches.overs_per_innings
  );

  // Update innings aggregates
  const { error: updateInningsError } = await supabase
    .from("innings")
    .update({
      total_runs: newTotalRuns,
      wickets: newWickets,
      balls_bowled: newBallsBowled,
      is_completed: inningsCompleted,
    })
    .eq("id", inningsId);

  if (updateInningsError) {
    return { error: updateInningsError.message };
  }

  // Re-evaluate match status and winner based on new aggregates
  const { data: allInnings } = await supabase
    .from("innings")
    .select("*")
    .eq("match_id", innings.match_id)
    .order("created_at", { ascending: true });

  let newStatus = innings.matches.status as string;
  let newWinnerTeam = (innings.matches as any).winner_team ?? null;

  if (allInnings && allInnings.length > 0) {
    const firstInnings = allInnings[0];

    if (firstInnings.id === innings.id) {
      // First innings
      if (inningsCompleted) {
        newStatus = "Innings Break";
      } else {
        newStatus = "Live";
      }
    } else {
      // Second innings (chase)
      const target = firstInnings.total_runs + 1;

      if (inningsCompleted) {
        if (newTotalRuns >= target) {
          // Chasing side wins
          newStatus = "Completed";
          newWinnerTeam = innings.batting_team;
        } else if (newTotalRuns === firstInnings.total_runs) {
          // Tie
          newStatus = "Completed";
          newWinnerTeam = null;
        } else {
          // Defending side wins
          newStatus = "Completed";
          newWinnerTeam = firstInnings.batting_team;
        }
      } else {
        // Chase still in progress
        newStatus = "Live";
        newWinnerTeam = null;
      }
    }

    // Persist match state
    const { error: matchUpdateError } = await supabase
      .from("matches")
      .update({ status: newStatus, winner_team: newWinnerTeam })
      .eq("id", innings.match_id);

    if (matchUpdateError) {
      return { error: matchUpdateError.message };
    }
  }

  revalidatePath(`/dashboard/match/${innings.match_id}/score`);
  revalidatePath(`/dashboard/match/${innings.match_id}`);
  revalidatePath(`/match/${innings.match_id}`);

  return { success: true };
}
