import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { role } = await req.json();
  const response = NextResponse.json({ success: true });
  // Set a simple session cookie for middleware use
  response.cookies.set("session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  response.cookies.set("userRole", role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
  response.cookies.set("userRole", "", { maxAge: 0, path: "/" });
  return response;
}
