"use client";

import { useState } from "react";
import { requestTournamentAccess } from "@/app/actions/access";
import type { AccessStatus } from "@/types";

interface RequestAccessButtonProps {
  tournamentId: string;
  currentStatus?: AccessStatus | null;
}

export default function RequestAccessButton({
  tournamentId,
  currentStatus,
}: RequestAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AccessStatus | null>(
    currentStatus || null,
  );

  const handleRequestAccess = async () => {
    setIsLoading(true);
    setError(null);

    const result = await requestTournamentAccess(tournamentId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setStatus("pending");
      setIsLoading(false);
    }
  };

  // Show pending status
  if (status === "pending") {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 text-blue-800 dark:text-blue-200 rounded-r">
        <p className="font-medium">⏳ Access Request Pending</p>
        <p className="text-sm mt-1">
          Your request to score for this tournament is pending approval from the
          tournament admin.
        </p>
      </div>
    );
  }

  // Show revoked status
  if (status === "revoked") {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-800 dark:text-red-200 rounded-r">
        <p className="font-medium">🚫 Access Revoked</p>
        <p className="text-sm mt-1">
          Your access to score for this tournament has been revoked. Please
          contact the tournament admin if you believe this is an error.
        </p>
      </div>
    );
  }

  // Show request access button (no status or null)
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            👀 Spectator Mode
          </p>
          <p className="text-sm mt-1 text-yellow-800 dark:text-yellow-200">
            You can view this tournament but cannot make changes. Request access
            to become a scorer.
          </p>
        </div>
        <button
          onClick={handleRequestAccess}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap transition-colors"
        >
          {isLoading ? "Requesting..." : "Request Access"}
        </button>
      </div>
      {error && (
        <p className="text-sm mt-2 text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
