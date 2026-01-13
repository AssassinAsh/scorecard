"use client";

import { useState } from "react";
import NewTournamentDialog from "./NewTournamentDialog";

interface NewTournamentButtonProps {
  canCreate: boolean;
}

export default function NewTournamentButton({
  canCreate,
}: NewTournamentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only render if user can create tournaments (Admin or Manager)
  if (!canCreate) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
        style={{ background: "var(--accent)" }}
      >
        + New
      </button>
      <NewTournamentDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
