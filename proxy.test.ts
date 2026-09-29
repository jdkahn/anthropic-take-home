import { NextRequest } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionValue } from "@/lib/auth";
import { proxy } from "./proxy";

function visit(path: string, session?: string) {
  const headers = session ? { cookie: `session=${session}` } : undefined;
  return proxy(new NextRequest(`http://localhost${path}`, { headers }));
}

// NextResponse.next() marks "continue to the route" with this header.
const passesThrough = (res: Response) => res.headers.get("x-middleware-next") === "1";

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
});

describe("proxy guard", () => {
  it("redirects pages to /login without a session", () => {
    expect(getRedirectUrl(visit("/"))).toBe("http://localhost/login");
  });

  it("returns 401 (not a redirect) for API routes without a session", () => {
    const res = visit("/api/round", "yes");
    expect(res.status).toBe(401);
    expect(getRedirectUrl(res)).toBeNull();
  });

  it("lets /login and /api/login through without a session", () => {
    expect(passesThrough(visit("/login"))).toBe(true);
    expect(passesThrough(visit("/api/login"))).toBe(true);
  });

  it("lets pages and APIs through with a valid session", () => {
    const session = createSessionValue();
    expect(passesThrough(visit("/", session))).toBe(true);
    expect(passesThrough(visit("/api/round", session))).toBe(true);
  });
});
