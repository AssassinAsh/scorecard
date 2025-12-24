"use client";

import { useState } from "react";

interface TeamFilterProps {
  teams: { id: string; name: string }[];
  onFilterChange: (teamId: string | null) => void;
}

export default function TeamFilter({ teams, onFilterChange }: TeamFilterProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTeam(value);
    onFilterChange(value === "" ? null : value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="team-filter" className="text-sm font-medium muted-text">
        Filter by team:
      </label>
      <select
        id="team-filter"
        value={selectedTeam}
        onChange={handleChange}
        className="px-3 py-1.5 rounded-md text-sm border"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <option value="">All teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}
