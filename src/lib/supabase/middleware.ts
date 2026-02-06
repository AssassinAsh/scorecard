import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth checks for static assets, API routes, and other non-protected paths
  // This significantly reduces Edge Function invocations
  const skipAuthPaths = [
    /^\/_next\//, // Next.js internal routes
    /^\/api\//, // API routes (if any)
    /\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/, // Static files
    /^\/favicon/, // Favicon requests
    /^\/images\//, // Public images
  ];

  if (skipAuthPaths.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Protected routes - check if this is a route that needs auth
  const protectedPaths = [/^\/match\/[^\/]+\/(setup|score)$/];
  const isProtectedRoute = protectedPaths.some((pattern) =>
    pattern.test(pathname),
  );

  // Check if user has auth cookies before making expensive getUser() call
  const hasAuthCookie =
    request.cookies.has("sb-access-token") ||
    request.cookies.has("sb-refresh-token") ||
    // New Supabase cookie format
    Array.from(request.cookies.getAll()).some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"),
    );

  // For non-protected routes without auth cookies, skip entirely
  if (!isProtectedRoute && pathname !== "/login" && !hasAuthCookie) {
    return NextResponse.next();
  }

  // Only create Supabase client if we actually need to check auth
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Only call getUser() if needed (protected route or login page or has auth cookies)
  let user = null;
  if (isProtectedRoute || pathname === "/login" || hasAuthCookie) {
    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const response = await supabase.auth.getUser();
    user = response.data.user;
  }

  // Protected routes - redirect to login if not authenticated
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to home if already logged in and trying to access login
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
