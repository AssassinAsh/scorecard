import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { getProfile } from "@/app/actions/profile";
import OnboardingForm from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

async function OnboardingContent() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  // If profile is complete, redirect to home
  if (profile?.first_name && profile?.last_name) {
    redirect("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to CrickSnap! 🏏</h1>
          <p style={{ color: "var(--muted)" }}>
            Let&apos;s set up your profile to get started
          </p>
        </div>

        <OnboardingForm
          initialFirstName={profile?.first_name || ""}
          initialLastName={profile?.last_name || ""}
          userEmail={user.email || ""}
        />
      </div>
    </div>
  );
}
