"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response: any) => {
          setLoading(true);
          setError(null);

          try {
            const { credential } = response;
            const supabase = createClient();

            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: credential,
            });

            if (error) {
              setError(`Sign in failed: ${error.message}`);
              setLoading(false);
            } else if (data.session) {
              // Ensure email is saved in profile
              const { data: profile } = await supabase
                .from("user_profiles")
                .select("email, first_name, last_name")
                .eq("user_id", data.user.id)
                .single();

              // Update email if not set or different
              if (!profile?.email || profile.email !== data.user.email) {
                await supabase
                  .from("user_profiles")
                  .update({ email: data.user.email || "" })
                  .eq("user_id", data.user.id);
              }

              if (!profile || !profile.first_name || !profile.last_name) {
                router.push("/onboarding");
              } else {
                router.push("/");
              }
              router.refresh();
            }
          } catch (err: any) {
            setError(err.message || "Sign in failed");
            setLoading(false);
          }
        },
      });

      window.google?.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "400",
          text: "continue_with",
        }
      );
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [router]);

  return (
    <div className="w-full">
      {error && (
        <div
          className="rounded-md p-3 text-sm mb-4"
          style={{
            background: "color-mix(in srgb, var(--danger) 10%, transparent)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center mb-4">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Signing you in...
          </p>
        </div>
      )}

      <div
        id="google-signin-button"
        className="flex justify-center"
        style={{ minHeight: "44px" }}
      />

      <p className="mt-4 text-center text-xs" style={{ color: "var(--muted)" }}>
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
