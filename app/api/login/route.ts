import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  checkCredentials,
  createSessionValue,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await checkCredentials(username, password))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true, // page JS can't read it, so an XSS bug can't steal it
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod; localhost is http
    sameSite: "lax", // not sent on cross-site POSTs (basic CSRF guard)
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  return response;
}
