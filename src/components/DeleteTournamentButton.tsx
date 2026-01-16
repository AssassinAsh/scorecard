"use client";

import { useState } from "react";
import { deleteTournament } from "@/app/actions/tournaments";

export default function DeleteTournamentButton({
  tournamentId,
  tournamentName,
}: {
  tournamentId: string;
  tournamentName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTournament(tournamentId);

    // If there's an error, show it
    if (result?.error) {
      alert(result.error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
    // Otherwise, redirect() will handle navigation
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400 transition-colors"
        title="Delete Tournament"
      >
        🗑️ Delete Tournament
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-red-600 dark:text-red-400 font-medium">
        Delete &quot;{tournamentName}&quot;?
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isDeleting ? "Deleting..." : "Confirm"}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
