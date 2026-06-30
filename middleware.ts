import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-based route mapping
const roleRoutes: Record<string, string> = {
  citizen: "/citizen/dashboard",
  officer: "/officer/dashboard",
  supervisor: "/supervisor/dashboard",
  admin: "/admin/dashboard",
};

// Protected route prefixes
const protectedPrefixes = ["/citizen", "/officer", "/supervisor", "/admin"];

// Auth-only routes (redirect to dashboard if already logged in)
const authRoutes = ["/auth/login", "/auth/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;
  const roleFromCookie = request.cookies.get("userRole")?.value;

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without session → redirect to login
  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear any stale cookies
    response.cookies.delete("session");
    response.cookies.delete("userRole");
    return response;
  }

  // If already logged in and trying to access auth routes → redirect to dashboard
  if (isAuthRoute && sessionCookie && roleFromCookie) {
    const dashboardUrl = roleRoutes[roleFromCookie] || "/citizen/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/citizen/:path*",
    "/officer/:path*",
    "/supervisor/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
