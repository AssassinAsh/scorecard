import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  getTournamentById,
  isAdmin,
  getUserRole,
} from "@/app/actions/tournaments";
import {
  getTournamentAccessRequests,
  canManageTournamentAccess,
} from "@/app/actions/access";
import { createClient } from "@/lib/supabase/server";
import AccessManagementTable from "@/components/AccessManagementTable";

export default function TournamentAccessPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="muted-text">Loading access management...</p>
        </div>
      }
    >
      <TournamentAccessPageContent {...props} />
    </Suspense>
  );
}

async function TournamentAccessPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tournament = await getTournamentById(id);

  if (!tournament) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <p className="muted-text">Tournament not found.</p>
      </div>
    );
  }

  // Check if user can manage access
  const canManage = await canManageTournamentAccess(id);

  if (!canManage) {
    redirect(`/tournament/${id}`);
  }

  const admin = await isAdmin();
  const role = await getUserRole();

  // Fetch all access requests (pending, approved)
  const pendingRequests = await getTournamentAccessRequests(id, "pending");
  const approvedUsers = await getTournamentAccessRequests(id, "approved");
  const revokedUsers = await getTournamentAccessRequests(id, "revoked");

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-medium team-name">
            Access Management
          </h1>
          <p className="text-sm mt-1 muted-text">{tournament.name}</p>
        </div>

        {/* Pending Requests Section */}
        <div className="mb-8">
          <h2 className="text-base font-medium px-2 mb-3">
            Pending Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="muted-text">No pending access requests</p>
            </div>
          ) : (
            <AccessManagementTable
              requests={pendingRequests}
              type="pending"
              tournamentId={id}
            />
          )}
        </div>

        {/* Approved Users Section */}
        <div className="mb-8">
          <h2 className="text-base font-medium px-2 mb-3">
            Approved Scorers ({approvedUsers.length})
          </h2>
          {approvedUsers.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="muted-text">No approved scorers</p>
            </div>
          ) : (
            <AccessManagementTable
              requests={approvedUsers}
              type="approved"
              tournamentId={id}
            />
          )}
        </div>

        {/* Revoked Users Section */}
        {revokedUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-medium px-2 mb-3">
              Revoked Access ({revokedUsers.length})
            </h2>
            <AccessManagementTable
              requests={revokedUsers}
              type="revoked"
              tournamentId={id}
            />
          </div>
        )}
      </main>
    </div>
  );
}
