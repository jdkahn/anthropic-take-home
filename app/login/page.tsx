"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Brand } from "../_components/brand";
import { AlertCircleIcon } from "../_components/icons";
import { loginErrorMessage } from "@/lib/login";

// Login.dc.html. Shared credentials, signed httpOnly cookie set by /api/login (D48, D78).
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      if (res.ok) return router.replace("/");
      setError(loginErrorMessage(res.status));
    } catch {
      setError(loginErrorMessage("network"));
    } finally {
      setPending(false);
    }
  }

  const input = "h-11 rounded-[10px] border border-line-strong bg-surface px-3 text-[15px]";
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Brand size="lg" />
      <form
        onSubmit={onSubmit}
        aria-labelledby="signin-title"
        className="flex w-full max-w-[400px] flex-col gap-[18px] rounded-2xl border border-line bg-surface p-6 sm:p-8"
      >
        <div className="flex flex-col gap-1.5">
          <h1 id="signin-title" className="m-0 font-serif text-[28px] font-semibold">
            Sign in
          </h1>
          <p className="m-0 text-sm leading-normal text-ink-muted">
            This is a private prototype. Use the username and password you were sent.
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Username</span>
          <input name="username" type="text" autoComplete="username" required className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Password</span>
          <input name="password" type="password" autoComplete="current-password" required className={input} />
        </label>
        {error && (
          <p role="alert" className="m-0 flex items-center gap-2 rounded-[10px] border border-miss-line bg-miss-bg px-3 py-2.5 text-[13px] text-miss-ink">
            <AlertCircleIcon /> {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-[10px] bg-accent text-[15px] font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="m-0 text-[13px] text-ink-muted">Access is limited to invited reviewers.</p>
    </main>
  );
}
