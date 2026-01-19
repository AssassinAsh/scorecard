"use client";

import { useState } from "react";
import {
  approveTournamentAccess,
  denyTournamentAccess,
  revokeTournamentAccess,
} from "@/app/actions/access";
import type { TournamentScorer } from "@/types";
import ConfirmationModal from "./ConfirmationModal";

interface AccessManagementTableProps {
  requests: TournamentScorer[];
  type: "pending" | "approved" | "revoked";
  tournamentId: string;
}

type ModalState = {
  type: "approve" | "deny" | "revoke" | null;
  requestId: string | null;
  userName: string | null | undefined;
};

export default function AccessManagementTable({
  requests,
  type,
  tournamentId,
}: AccessManagementTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    requestId: null,
    userName: null,
  });

  const handleApprove = async (notes?: string) => {
    if (!modalState.requestId) return;

    setLoadingId(modalState.requestId);
    setError(null);

    const result = await approveTournamentAccess(modalState.requestId, notes);

    if (result.error) {
      setError(result.error);
      setLoadingId(null);
    } else {
      setLoadingId(null);
      setModalState({ type: null, requestId: null, userName: null });
    }
  };

  const handleDeny = async () => {
    if (!modalState.requestId) return;

    setLoadingId(modalState.requestId);
    setError(null);

    const result = await denyTournamentAccess(modalState.requestId);

    if (result.error) {
      setError(result.error);
      setLoadingId(null);
    } else {
      setLoadingId(null);
      setModalState({ type: null, requestId: null, userName: null });
    }
  };

  const handleRevoke = async (notes?: string) => {
    if (!modalState.requestId) return;

    setLoadingId(modalState.requestId);
    setError(null);

    const result = await revokeTournamentAccess(modalState.requestId, notes);

    if (result.error) {
      setError(result.error);
      setLoadingId(null);
    } else {
      setLoadingId(null);
      setModalState({ type: null, requestId: null, userName: null });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                {type === "pending"
                  ? "Requested"
                  : type === "approved"
                    ? "Approved"
                    : "Revoked"}
              </th>
              {(type === "approved" || type === "revoked") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  {type === "approved" ? "Approved By" : "Revoked By"}
                </th>
              )}
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-sm">
                  {request.user_name || "Unknown User"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {request.user_email}
                </td>
                <td
                  className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400"
                  suppressHydrationWarning
                >
                  {type === "pending" && formatDate(request.requested_at)}
                  {type === "approved" &&
                    request.approved_at &&
                    formatDate(request.approved_at)}
                  {type === "revoked" &&
                    request.revoked_at &&
                    formatDate(request.revoked_at)}
                </td>
                {(type === "approved" || type === "revoked") && (
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {type === "approved"
                      ? request.approver_email || "System"
                      : request.approver_email || "System"}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {type === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "approve",
                              requestId: request.id,
                              userName: request.user_name,
                            })
                          }
                          disabled={loadingId === request.id}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {loadingId === request.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "deny",
                              requestId: request.id,
                              userName: request.user_name,
                            })
                          }
                          disabled={loadingId === request.id}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {loadingId === request.id ? "..." : "Deny"}
                        </button>
                      </>
                    )}
                    {type === "approved" && (
                      <button
                        onClick={() =>
                          setModalState({
                            type: "revoke",
                            requestId: request.id,
                            userName: request.user_name,
                          })
                        }
                        disabled={loadingId === request.id}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingId === request.id ? "..." : "Revoke"}
                      </button>
                    )}
                    {type === "revoked" && (
                      <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                        No actions
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-sm muted-text">No records to display</p>
        </div>
      )}

      {/* Approve Modal */}
      <ConfirmationModal
        isOpen={modalState.type === "approve"}
        onClose={() =>
          setModalState({ type: null, requestId: null, userName: null })
        }
        onConfirm={handleApprove}
        title="Approve Access Request"
        message={`Are you sure you want to approve access for ${modalState.userName || "this user"}? They will be able to score matches for this tournament.`}
        confirmText="Approve"
        confirmStyle="success"
        showNotesInput={true}
        notesLabel="Approval notes (optional)"
        notesPlaceholder="Add any notes about this approval..."
        isLoading={!!loadingId}
      />

      {/* Deny Modal */}
      <ConfirmationModal
        isOpen={modalState.type === "deny"}
        onClose={() =>
          setModalState({ type: null, requestId: null, userName: null })
        }
        onConfirm={handleDeny}
        title="Deny Access Request"
        message={`Are you sure you want to deny the access request from ${modalState.userName || "this user"}? This will permanently delete the request.`}
        confirmText="Deny"
        confirmStyle="danger"
        showNotesInput={false}
        isLoading={!!loadingId}
      />

      {/* Revoke Modal */}
      <ConfirmationModal
        isOpen={modalState.type === "revoke"}
        onClose={() =>
          setModalState({ type: null, requestId: null, userName: null })
        }
        onConfirm={handleRevoke}
        title="Revoke Access"
        message={`Are you sure you want to revoke access for ${modalState.userName || "this user"}? They will no longer be able to score matches for this tournament.`}
        confirmText="Revoke"
        confirmStyle="danger"
        showNotesInput={true}
        notesLabel="Revocation reason (optional)"
        notesPlaceholder="Reason for revoking access..."
        isLoading={!!loadingId}
      />
    </div>
  );
}
