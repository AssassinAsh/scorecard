"use client";

import { useState } from "react";
import NewTournamentDialog from "./NewTournamentDialog";

export default function NewTournamentButton() {
  const [isOpen, setIsOpen] = useState(false);

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
