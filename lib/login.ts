// Login page copy by response (M0 backlog: a 429 used to read as a wrong password).
// 429 comes from the WAF rule on POST /api/* (D82), not from the app.
export function loginErrorMessage(status: number | "network"): string {
  if (status === 401) return "That username and password don’t match. Check the details you were sent.";
  if (status === 429) return "Too many sign-in attempts. Wait a minute, then try again.";
  return "Something went wrong signing in. Try again.";
}
