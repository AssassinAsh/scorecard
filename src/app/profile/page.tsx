import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { getProfile, getUserTournamentAccess } from "@/app/actions/profile";
import { getUserRole, isAdmin } from "@/app/actions/tournaments";
import ProfileEditor from "@/components/ProfileEditor";
import BecomeScorerButton from "@/components/BecomeScorerButton";
import RechargeCredits from "@/components/RechargeCredits";
import { ProfileSkeleton } from "@/components/Skeletons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, role, tournamentAccess, admin] = await Promise.all([
    getProfile(),
    getUserRole(),
    getUserTournamentAccess(),
    isAdmin(),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="space-y-6">
          {/* Admin Recharge Section */}
          {admin && <RechargeCredits />}

          {/* User Info */}
          <div className="cricket-card p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm" style={{ color: "var(--muted)" }}>
                  Email
                </label>
                <p className="font-medium">{profile?.email || user.email}</p>
              </div>

              <div>
                <label className="text-sm" style={{ color: "var(--muted)" }}>
                  Role
                </label>
                <p className="font-medium capitalize">
                  {profile?.role || role}
                </p>
              </div>

              <div>
                <label className="text-sm" style={{ color: "var(--muted)" }}>
                  Credits
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-medium">{profile?.credits ?? 0}</p>
                  <a
                    href="tel:+919907321792"
                    className="px-3 py-1 text-xs font-medium rounded-md transition-all hover:scale-105 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                      color: "white",
                      border: "none",
                    }}
                    title="Contact us for credit queries"
                  >
                    📞 Contact for Credits
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm" style={{ color: "var(--muted)" }}>
                  Name
                </label>
                <p className="font-medium">
                  {profile?.first_name || profile?.last_name
                    ? `${profile.first_name || ""} ${
                        profile.last_name || ""
                      }`.trim()
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Become Scorer (for Viewers only) */}
          {role === "Viewer" && (
            <div className="cricket-card p-6">
              <h2 className="text-lg font-semibold mb-4">Become a Scorer</h2>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                Upgrade to a Scorer account to create and manage your own
                tournaments and matches. You'll receive 20 credits to get
                started.
              </p>
              <div className="space-y-2 mb-4 text-sm">
                <p>
                  • Creating a tournament: <strong>10 credits</strong>
                </p>
                <p>
                  • Creating a match: <strong>1 credit</strong>
                </p>
              </div>
              <BecomeScorerButton />
            </div>
          )}

          {/* Edit Profile */}
          <ProfileEditor
            firstName={profile?.first_name || ""}
            lastName={profile?.last_name || ""}
          />

          {/* Tournament Access (for Scorers) */}
          {role === "Scorer" && (
            <div className="cricket-card p-6">
              <h2 className="text-lg font-semibold mb-4">Tournament Access</h2>

              {tournamentAccess.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>
                  No tournament access granted yet. Contact an admin to request
                  access.
                </p>
              ) : (
                <div className="space-y-2">
                  {tournamentAccess.map((access) => (
                    <Link
                      key={access.tournament_id}
                      href={`/tournament/${access.tournament_id}`}
                      className="tournament-access-link block p-3 rounded-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "var(--background)",
                      }}
                    >
                      <p className="font-medium">{access.tournament_name}</p>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Granted{" "}
                        {new Date(access.granted_at).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
