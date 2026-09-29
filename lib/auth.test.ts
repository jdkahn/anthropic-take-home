import { randomBytes, scryptSync } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SESSION_MAX_AGE_S,
  checkCredentials,
  createSessionValue,
  isValidSession,
} from "./auth";

// Same format as scripts/hash-password.mjs
function hashFor(password: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const NOW = 1_800_000_000_000;

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
  vi.stubEnv("APP_USERNAME", "reviewer");
  vi.stubEnv("APP_PASSWORD_HASH", hashFor("correct horse"));
});

describe("session cookie", () => {
  it("accepts a value the server minted", () => {
    expect(isValidSession(createSessionValue(NOW), NOW)).toBe(true);
  });

  it("rejects missing or hand-typed values", () => {
    for (const v of [undefined, "", "yes", "123", ".", "123.", ".sig"]) {
      expect(isValidSession(v, NOW)).toBe(false);
    }
  });

  it("rejects once expired", () => {
    const value = createSessionValue(NOW);
    expect(isValidSession(value, NOW + SESSION_MAX_AGE_S * 1000 - 1)).toBe(true);
    expect(isValidSession(value, NOW + SESSION_MAX_AGE_S * 1000)).toBe(false);
  });

  it("rejects an extended expiry (signature no longer matches)", () => {
    const [expiry, sig] = createSessionValue(NOW).split(".");
    expect(isValidSession(`${Number(expiry) + 1}.${sig}`, NOW)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const [expiry, sig] = createSessionValue(NOW).split(".");
    const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
    expect(isValidSession(`${expiry}.${flipped}`, NOW)).toBe(false);
  });

  it("rotating SESSION_SECRET invalidates existing sessions", () => {
    const value = createSessionValue(NOW);
    vi.stubEnv("SESSION_SECRET", "rotated");
    expect(isValidSession(value, NOW)).toBe(false);
  });
});

describe("checkCredentials", () => {
  it("accepts the right username and password", async () => {
    expect(await checkCredentials("reviewer", "correct horse")).toBe(true);
  });

  it("rejects a wrong password, wrong username, or empty input", async () => {
    expect(await checkCredentials("reviewer", "wrong")).toBe(false);
    expect(await checkCredentials("someone", "correct horse")).toBe(false);
    expect(await checkCredentials("", "")).toBe(false);
  });

  it("fails loudly on a malformed hash (misconfigured env)", async () => {
    vi.stubEnv("APP_PASSWORD_HASH", "plaintext-password");
    await expect(checkCredentials("reviewer", "x")).rejects.toThrow(/Malformed/);
  });

  it("fails loudly when an env var is missing", async () => {
    vi.stubEnv("APP_USERNAME", "");
    await expect(checkCredentials("reviewer", "correct horse")).rejects.toThrow(/APP_USERNAME/);
  });
});
