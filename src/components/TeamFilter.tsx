"use client";

import { useState } from "react";
import SearchableSelect from "./SearchableSelect";

interface TeamFilterProps {
  teams: { id: string; name: string }[];
  onFilterChange: (teamId: string | null) => void;
}

export default function TeamFilter({ teams, onFilterChange }: TeamFilterProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const handleChange = (value: string) => {
    setSelectedTeam(value);
    onFilterChange(value === "" ? null : value);
  };

  const options = [
    { value: "", label: "All teams" },
    ...teams.map((team) => ({
      value: team.id,
      label: team.name,
    })),
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="team-filter" className="text-sm font-medium muted-text">
        Filter by team:
      </label>
      <SearchableSelect
        value={selectedTeam}
        onChange={handleChange}
        options={options}
        placeholder="All teams"
        className="w-64"
      />
    </div>
  );
}
