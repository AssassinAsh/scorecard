const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

if (!process.env.BACKEND_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[backend] BACKEND_URL is not set; falling back to http://localhost:8080"
  );
}

function buildUrl(path: string): string {
  const base = BACKEND_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function getBackendHealth() {
  const res = await fetch(buildUrl("/health"), {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Backend /health failed with status ${res.status}`);
  }

  return res.json() as Promise<{ status: string }>;
}

export interface BackendUser {
  id: string;
  email: string | null;
  full_name?: string | null;
  status?: string;
  roles?: string[];
}

export async function getBackendMe(options?: { token?: string }) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(buildUrl("/me"), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Backend /me failed with status ${res.status}`);
  }

  return res.json() as Promise<BackendUser>;
}
