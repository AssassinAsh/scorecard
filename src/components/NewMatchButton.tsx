"use client";

import { useState } from "react";
import NewMatchDialog from "./NewMatchDialog";

interface NewMatchButtonProps {
  tournamentId: string;
}

export default function NewMatchButton({ tournamentId }: NewMatchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-sm rounded-lg font-medium"
        style={{ background: "var(--accent)", color: "white" }}
      >
        + New Match
      </button>
      <NewMatchDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tournamentId={tournamentId}
      />
    </>
  );
}
