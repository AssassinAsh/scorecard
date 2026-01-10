"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBackendMe, type BackendUser } from "@/lib/backend/client";

// Legacy login (no longer used by UI, kept for reference)
export async function login(formData: FormData) {
  console.warn("login(server action) is deprecated in this branch.");
  redirect("/");
}

// Dialog-friendly login with inline error state
export async function loginFromDialog(
  _prevState: { error: string | null },
  formData: FormData
) {
  console.warn("loginFromDialog(server action) is deprecated in this branch.");
  return { error: "Legacy login is disabled on this branch." };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_token");
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase_token")?.value;

  if (!token) return null;

  try {
    const user = await getBackendMe({ token });
    return user as BackendUser;
  } catch (error) {
    console.error("Error fetching user from backend:", error);
    return null;
  }
}
