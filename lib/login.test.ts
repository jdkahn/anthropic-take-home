import { describe, expect, it } from "vitest";
import { loginErrorMessage } from "./login";

describe("loginErrorMessage", () => {
  it("keeps the wireframe copy for a wrong password and gives rate limiting its own", () => {
    expect(loginErrorMessage(401)).toBe("That username and password don’t match. Check the details you were sent.");
    expect(loginErrorMessage(429)).toMatch(/Too many sign-in attempts/);
    expect(loginErrorMessage(429)).not.toMatch(/don’t match/);
    expect(loginErrorMessage(500)).toMatch(/Something went wrong/);
    expect(loginErrorMessage("network")).toMatch(/Something went wrong/);
  });
});
