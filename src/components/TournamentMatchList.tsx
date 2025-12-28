"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardMatchCard from "@/components/DashboardMatchCard";
import TeamFilter from "@/components/TeamFilter";
import type { Match } from "@/types";

interface TournamentMatchListProps {
  matches: Array<{ match: Match; winnerText: string | null }>;
  user: any;
  isAdmin: boolean;
  hasScorerAccess: boolean;
}

export default function TournamentMatchList({
  matches,
  user,
  isAdmin,
  hasScorerAccess,
}: TournamentMatchListProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Extract unique teams from all matches
  const teamsMap = new Map<string, string>();
  matches.forEach(({ match }) => {
    teamsMap.set(match.team_a_id, match.team_a_name);
    teamsMap.set(match.team_b_id, match.team_b_name);
  });
  const teams = Array.from(teamsMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  // Filter matches by selected team
  const filteredMatches = selectedTeamId
    ? matches.filter(
        ({ match }) =>
          match.team_a_id === selectedTeamId ||
          match.team_b_id === selectedTeamId
      )
    : matches;

  return (
    <>
      {/* Team Filter */}
      {teams.length > 0 && (
        <div className="mb-4 px-2">
          <TeamFilter teams={teams} onFilterChange={setSelectedTeamId} />
        </div>
      )}

      {/* Match List */}
      {filteredMatches.length === 0 ? (
        <div
          className="cricket-card rounded-lg p-6 text-center"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="muted-text">
            {selectedTeamId
              ? "No matches found for selected team"
              : "No matches scheduled yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map(({ match, winnerText }) =>
            user && (hasScorerAccess || isAdmin) ? (
              <DashboardMatchCard
                key={match.id}
                match={match}
                isAdmin={isAdmin}
                winnerText={winnerText}
              />
            ) : (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="cricket-card block rounded-lg p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium team-name truncate">
                      {match.team_a_name} vs {match.team_b_name}
                    </h3>
                    <p className="text-sm muted-text mt-1">
                      {new Date(match.match_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {match.overs_per_innings} overs
                    </p>
                    {winnerText && (
                      <p
                        className="text-sm mt-2 font-medium"
                        style={{ color: "var(--success)" }}
                      >
                        {winnerText}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap inline-block"
                      style={{
                        background:
                          match.status === "Live"
                            ? "rgba(234, 67, 53, 0.1)"
                            : match.status === "Completed"
                            ? "rgba(52, 168, 83, 0.1)"
                            : "rgba(128, 134, 139, 0.1)",
                        color:
                          match.status === "Live"
                            ? "var(--danger)"
                            : match.status === "Completed"
                            ? "var(--success)"
                            : "var(--muted)",
                      }}
                    >
                      {match.status}
                    </span>
                    {match.match_type && (
                      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide muted-text">
                        {match.match_type}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </>
  );
}
