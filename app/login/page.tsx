"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

// M0: functional only. Wireframe styling (Login.dc.html) lands in M3.
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    setPending(false);
    if (res.ok) router.replace("/");
    else setError(true);
  }

  return (
    <main className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-600">
        This is a private prototype. Use the username and password you were sent.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Username
          <input name="username" type="text" autoComplete="username" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input name="password" type="password" autoComplete="current-password" required className="rounded-md border px-3 py-2" />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            That username and password don’t match. Check the details you were sent.
          </p>
        )}
        <button type="submit" disabled={pending} className="mt-2 rounded-md bg-black px-3 py-2 text-white disabled:opacity-50">
          Sign in
        </button>
      </form>
      <p className="mt-6 text-xs text-neutral-500">Access is limited to invited reviewers.</p>
    </main>
  );
}
