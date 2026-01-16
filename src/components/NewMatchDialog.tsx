"use client";

import { useState, useEffect, useCallback } from "react";
import { createMatch } from "@/app/actions/matches";
import { getTeamsByTournament, createTeam } from "@/app/actions/teams";
import type { TeamInfo, MatchType } from "@/types";
import SearchableSelect from "./SearchableSelect";

interface NewMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  userCredits?: number;
  userRole?: string;
}

export default function NewMatchDialog({
  isOpen,
  onClose,
  tournamentId,
  userCredits = 0,
  userRole = "Viewer",
}: NewMatchDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [showTeamAModal, setShowTeamAModal] = useState(false);
  const [showTeamBModal, setShowTeamBModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamContact, setNewTeamContact] = useState("");
  const [savingNewTeam, setSavingNewTeam] = useState(false);
  const [selectedTeamA, setSelectedTeamA] = useState("");
  const [selectedTeamB, setSelectedTeamB] = useState("");

  const isScorer = userRole === "Scorer";
  const hasEnoughCredits = userCredits >= 5;

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true);
    const data = await getTeamsByTournament(tournamentId);
    setTeams(data);
    setLoadingTeams(false);
  }, [tournamentId]);

  useEffect(() => {
    if (isOpen && tournamentId) {
      loadTeams();
    }
  }, [isOpen, tournamentId, loadTeams]);

  async function handleCreateNewTeam(forTeamA: boolean) {
    if (!newTeamName.trim()) return;

    setSavingNewTeam(true);
    const result = await createTeam({
      tournament_id: tournamentId,
      name: newTeamName.trim(),
      contact_number: newTeamContact.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
      setSavingNewTeam(false);
      return;
    }

    if (result.team) {
      await loadTeams();

      if (forTeamA) {
        setSelectedTeamA(result.team.id);
        setShowTeamAModal(false);
      } else {
        setSelectedTeamB(result.team.id);
        setShowTeamBModal(false);
      }

      setNewTeamName("");
      setNewTeamContact("");
    }

    setSavingNewTeam(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createMatch({
      tournament_id: tournamentId,
      team_a_id: formData.get("team_a_id") as string,
      team_b_id: formData.get("team_b_id") as string,
      match_date: formData.get("match_date") as string,
      overs_per_innings: parseInt(formData.get("overs_per_innings") as string),
      match_type: (formData.get("match_type") as MatchType) || "Knock-Out",
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Add Team Modal - Render first with higher z-index */}
      {(showTeamAModal || showTeamBModal) && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[70]"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
          onClick={(e) => {
            // Only close when clicking on the backdrop itself
            if (e.target === e.currentTarget) {
              setShowTeamAModal(false);
              setShowTeamBModal(false);
            }
          }}
        >
          <div
            className="rounded-lg p-6 w-full max-w-md mx-4"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium mb-4">
              Add New Team {showTeamAModal ? "A" : "B"}
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="new_team_name"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Team Name *
                </label>
                <input
                  id="new_team_name"
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="Mumbai Indians"
                />
              </div>

              <div>
                <label
                  htmlFor="new_team_contact"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Contact Number
                </label>
                <input
                  id="new_team_contact"
                  type="tel"
                  value={newTeamContact}
                  onChange={(e) => setNewTeamContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCreateNewTeam(showTeamAModal)}
                  disabled={!newTeamName.trim() || savingNewTeam}
                  className="flex-1 py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {savingNewTeam ? "Saving..." : "Add Team"}
                </button>
                <button
                  onClick={() => {
                    setShowTeamAModal(false);
                    setShowTeamBModal(false);
                    setNewTeamName("");
                    setNewTeamContact("");
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Match Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
        onClick={(e) => {
          // Only close if clicking the backdrop, not the dialog
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="rounded-lg p-6 w-full max-w-md my-8"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Create New Match</h2>
            <button
              onClick={onClose}
              className="text-2xl leading-none"
              style={{ color: "var(--muted)" }}
            >
              ×
            </button>
          </div>

          {isScorer && (
            <div
              className="rounded-md p-3 text-sm mb-4"
              style={{
                background: hasEnoughCredits
                  ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                  : "color-mix(in srgb, var(--destructive) 10%, transparent)",
                border: hasEnoughCredits
                  ? "1px solid var(--accent)"
                  : "1px solid var(--destructive)",
                color: hasEnoughCredits
                  ? "var(--accent)"
                  : "var(--destructive)",
              }}
            >
              <p className="font-medium">
                Your Credits: {userCredits} | Cost: 5 credits
              </p>
              {!hasEnoughCredits && (
                <p className="text-xs mt-1">
                  Insufficient credits to create a match
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden inputs for form submission */}
            <input type="hidden" name="team_a_id" value={selectedTeamA} />
            <input type="hidden" name="team_b_id" value={selectedTeamB} />

            {/* Team A Selection */}
            <div>
              <label
                htmlFor="team_a_id"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Team A *
              </label>
              <div className="flex gap-2">
                <SearchableSelect
                  value={selectedTeamA}
                  onChange={setSelectedTeamA}
                  options={[
                    {
                      value: "",
                      label: loadingTeams ? "Loading..." : "Select Team A",
                    },
                    ...teams.map((team) => ({
                      value: team.id,
                      label: team.name,
                    })),
                  ]}
                  placeholder={loadingTeams ? "Loading..." : "Select Team A"}
                  disabled={loadingTeams}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowTeamAModal(true)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            {/* Team B Selection */}
            <div>
              <label
                htmlFor="team_b_id"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Team B *
              </label>
              <div className="flex gap-2">
                <SearchableSelect
                  value={selectedTeamB}
                  onChange={setSelectedTeamB}
                  options={[
                    {
                      value: "",
                      label: loadingTeams ? "Loading..." : "Select Team B",
                    },
                    ...teams.map((team) => ({
                      value: team.id,
                      label: team.name,
                    })),
                  ]}
                  placeholder={loadingTeams ? "Loading..." : "Select Team B"}
                  disabled={loadingTeams}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowTeamBModal(true)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white"
                  style={{ background: "var(--accent)" }}
                >
                  + New
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="match_date"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Match Date *
              </label>
              <input
                id="match_date"
                name="match_date"
                type="date"
                required
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="match_type"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Match Type *
              </label>
              <select
                id="match_type"
                name="match_type"
                required
                defaultValue="Knock-Out"
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <option value="Knock-Out">Knock-Out</option>
                <option value="Quarter Final">Quarter Final</option>
                <option value="Semi Final">Semi Final</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="overs_per_innings"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--muted)" }}
              >
                Overs Per Innings * (1-10)
              </label>
              <input
                id="overs_per_innings"
                name="overs_per_innings"
                type="number"
                min="1"
                max="10"
                required
                defaultValue="6"
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-md p-3 text-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--danger) 10%, transparent)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                }}
              >
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-md font-medium"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (isScorer && !hasEnoughCredits)}
                className="flex-1 py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
