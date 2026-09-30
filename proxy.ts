import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

// Next 16 renamed middleware.ts → proxy.ts (Node runtime by default).
// First line of defense only: API routes that spend money re-check the session themselves.
const PUBLIC_PATHS = ["/login", "/api/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = isValidSession(request.cookies.get(SESSION_COOKIE)?.value);

  // A signed-in visitor has nothing to do on the login page.
  if (pathname === "/login" && signedIn) return NextResponse.redirect(new URL("/", request.url));
  if (PUBLIC_PATHS.includes(pathname) || signedIn) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Skip static assets so the login page can load its CSS/JS.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
