import { randomBytes, scryptSync } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function login(body: unknown) {
  return POST(
    new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  const salt = randomBytes(16);
  vi.stubEnv("SESSION_SECRET", "test-secret");
  vi.stubEnv("APP_USERNAME", "reviewer");
  vi.stubEnv(
    "APP_PASSWORD_HASH",
    `scrypt:${salt.toString("hex")}:${scryptSync("pw", salt, 64).toString("hex")}`,
  );
});

describe("POST /api/login", () => {
  it("sets an httpOnly, SameSite=Lax session cookie on success", async () => {
    const res = await login({ username: "reviewer", password: "pw" });
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^session=\d+\.[\w-]+;/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
  });

  it("marks the cookie Secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await login({ username: "reviewer", password: "pw" });
    expect(res.headers.get("set-cookie")).toMatch(/Secure/i);
  });

  it("returns 401 and no cookie on bad credentials", async () => {
    const res = await login({ username: "reviewer", password: "nope" });
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("returns 401 on a malformed body instead of crashing", async () => {
    expect((await login("not json")).status).toBe(401);
    expect((await login({ username: 1, password: null })).status).toBe(401);
  });
});
