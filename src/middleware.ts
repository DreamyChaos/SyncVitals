import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicRoutes = ["/login", "/signup", "/auth/callback", "/auth/reset-password", "/api/supabase-env-check", "/api/chat", "/api/deep-analysis", "/api/quick-chat", "/api/env-check"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[MIDDLEWARE] pathname:", pathname);
  console.log("[MIDDLEWARE] cookies found:", request.cookies.getAll().map(c => c.name));

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log("[MIDDLEWARE] public route, passing through");
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  console.log("[MIDDLEWARE] getUser() result - user id:", user?.id, "email:", user?.email, "error:", error);

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (user && isAuthRoute) {
    console.log("[MIDDLEWARE] redirect target: / (authenticated user on auth page)");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && !publicRoutes.some(route => pathname.startsWith(route))) {
    if (!pathname.startsWith("/api/")) {
      console.log("[MIDDLEWARE] redirect target: /login (no user on protected page)");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};