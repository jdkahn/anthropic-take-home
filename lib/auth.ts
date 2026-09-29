import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Shared login (D48, D78). Stateless: the cookie carries its own proof (D55).
//   cookie value = "<expiryMs>.<HMAC-SHA256(SESSION_SECRET, expiryMs)>"
// Only the server knows SESSION_SECRET, so only the server can mint a valid cookie.

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", env("SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
}

// timingSafeEqual throws on length mismatch, and a plain === leaks timing.
function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionValue(now = Date.now()): string {
  const expiry = String(now + SESSION_MAX_AGE_S * 1000);
  return `${expiry}.${sign(expiry)}`;
}

export function isValidSession(value: string | undefined, now = Date.now()): boolean {
  if (!value) return false;
  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;
  if (!safeEqual(Buffer.from(signature), Buffer.from(sign(expiry)))) return false;
  return Number(expiry) > now;
}

// APP_PASSWORD_HASH format: "scrypt:<saltHex>:<hashHex>" (make one with scripts/hash-password.mjs).
// ":" not "$" because Next's .env loader expands $VARS.
export async function checkCredentials(username: string, password: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = env("APP_PASSWORD_HASH").split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) throw new Error("Malformed APP_PASSWORD_HASH");

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  // Hash first, then compare both, so a wrong username takes as long as a wrong password.
  const userOk = safeEqual(Buffer.from(username), Buffer.from(env("APP_USERNAME")));
  const passOk = safeEqual(actual, expected);
  return userOk && passOk;
}
