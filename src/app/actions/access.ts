"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TournamentScorer } from "@/types";

/**
 * Request access to a tournament (creates pending request)
 */
export async function requestTournamentAccess(tournamentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if already has a request or access
  const { data: existing } = await supabase
    .from("tournament_scorers")
    .select("id, status")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.status === "pending") {
      return { error: "Access request already pending" };
    } else if (existing.status === "approved") {
      return { error: "Already have access to this tournament" };
    } else if (existing.status === "revoked") {
      return { error: "Access was revoked. Please contact tournament admin." };
    }
  }

  // Create pending access request
  const { error } = await supabase.from("tournament_scorers").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    status: "pending",
    requested_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tournament/${tournamentId}`);
  return { success: true };
}

/**
 * Get all access requests for a tournament (pending, approved, revoked)
 * Only accessible by tournament creator, Admin, or Manager
 */
export async function getTournamentAccessRequests(
  tournamentId: string,
  statusFilter?: "pending" | "approved" | "revoked",
): Promise<TournamentScorer[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tournament_scorers")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("requested_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tournament access requests:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get user profiles for all user_ids and approver ids
  const userIds = [
    ...data.map((r) => r.user_id),
    ...data.map((r) => r.approved_by).filter(Boolean),
    ...data.map((r) => r.revoked_by).filter(Boolean),
  ].filter((id, index, self) => id && self.indexOf(id) === index);

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, email, first_name, last_name")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

  // Transform the data to match TournamentScorer interface
  return data.map((record: any) => {
    const userProfile = profileMap.get(record.user_id);
    const approverProfile = record.approved_by
      ? profileMap.get(record.approved_by)
      : null;

    const userName = userProfile
      ? `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() ||
        "Unknown User"
      : "Unknown User";

    const approverName = approverProfile
      ? `${approverProfile.first_name || ""} ${approverProfile.last_name || ""}`.trim()
      : undefined;

    return {
      id: record.id,
      tournament_id: record.tournament_id,
      user_id: record.user_id,
      status: record.status,
      requested_at: record.requested_at,
      approved_at: record.approved_at,
      approved_by: record.approved_by,
      revoked_at: record.revoked_at,
      revoked_by: record.revoked_by,
      notes: record.notes,
      user_email: userProfile?.email || "Unknown",
      user_name: userName,
      approver_email: approverProfile?.email,
    };
  });
}

/**
 * Get list of approved users for a tournament
 */
export async function getApprovedTournamentUsers(
  tournamentId: string,
): Promise<TournamentScorer[]> {
  return getTournamentAccessRequests(tournamentId, "approved");
}

/**
 * Approve a pending access request
 * Only accessible by tournament creator, Admin, or Manager
 */
export async function approveTournamentAccess(
  requestId: string,
  notes?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the request details to check status and get tournament_id
  const { data: request, error: fetchError } = await supabase
    .from("tournament_scorers")
    .select("id, status, tournament_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Access request not found" };
  }

  if (request.status !== "pending") {
    return { error: "Can only approve pending requests" };
  }

  // Update to approved status
  const { error } = await supabase
    .from("tournament_scorers")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      notes: notes || null,
    })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tournament/${request.tournament_id}`);
  revalidatePath(`/tournament/${request.tournament_id}/access`);
  return { success: true };
}

/**
 * Deny a pending access request (deletes the request)
 * Only accessible by tournament creator, Admin, or Manager
 */
export async function denyTournamentAccess(requestId: string) {
  const supabase = await createClient();

  // Get the request details to get tournament_id
  const { data: request, error: fetchError } = await supabase
    .from("tournament_scorers")
    .select("id, status, tournament_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Access request not found" };
  }

  if (request.status !== "pending") {
    return { error: "Can only deny pending requests" };
  }

  // Delete the pending request
  const { error } = await supabase
    .from("tournament_scorers")
    .delete()
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tournament/${request.tournament_id}`);
  revalidatePath(`/tournament/${request.tournament_id}/access`);
  return { success: true };
}

/**
 * Revoke access from an approved user
 * Only accessible by tournament creator, Admin, or Manager
 */
export async function revokeTournamentAccess(
  requestId: string,
  notes?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the request details to check status and get tournament_id
  const { data: request, error: fetchError } = await supabase
    .from("tournament_scorers")
    .select("id, status, tournament_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Access record not found" };
  }

  if (request.status !== "approved") {
    return { error: "Can only revoke approved access" };
  }

  // Update to revoked status
  const { error } = await supabase
    .from("tournament_scorers")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
      notes: notes || null,
    })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tournament/${request.tournament_id}`);
  revalidatePath(`/tournament/${request.tournament_id}/access`);
  return { success: true };
}

/**
 * Check if current user can manage tournament access
 * (Admin, Manager, or tournament creator)
 */
export async function canManageTournamentAccess(
  tournamentId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Get user role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return false;
  }

  // Admin and Manager can manage all tournaments
  if (profile.role === "Admin" || profile.role === "Manager") {
    return true;
  }

  // Check if user is the tournament creator
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("created_by")
    .eq("id", tournamentId)
    .single();

  return tournament?.created_by === user.id;
}
