import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/events", "/settings"];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies or localStorage (Next.js middleware only has access to cookies)
  const token =
    request.cookies.get("stageflow_token")?.value ||
    request.cookies.get("token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // If accessing protected route without token, redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/register with a token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
