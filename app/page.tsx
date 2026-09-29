"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

// M0 walking skeleton: send one message, watch Claude's reply stream in. The real round UI is M3.
export default function Home() {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "streaming" | "error">("idle");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = new FormData(event.currentTarget).get("message");
    setReply("");
    setStatus("waiting");

    const res = await fetch("/api/round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok || !res.body) return setStatus("error");

    // D76: plain fetch + ReadableStream reader. M3 swaps setReply for the partial-JSON parser.
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    setStatus("streaming");
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        setReply((prev) => prev + value);
      }
      setStatus("idle");
    } catch {
      setStatus("error"); // stream broke mid-way; keep what arrived
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <main className="mx-auto mt-16 max-w-2xl px-4">
      <form onSubmit={send} className="flex flex-col gap-3">
        <textarea
          name="message"
          required
          rows={3}
          defaultValue="In two sentences: what is a cloze exercise?"
          className="rounded-md border px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "waiting" || status === "streaming"}
          className="self-start rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {status === "waiting" && <p className="mt-6 text-sm text-neutral-500">Claude is thinking…</p>}
      {status === "error" && <p className="mt-6 text-sm text-red-700">Something went wrong. Try again.</p>}
      <p className="mt-6 whitespace-pre-wrap">{reply}</p>

      <button onClick={logout} className="mt-10 text-sm underline">
        Sign out
      </button>
    </main>
  );
}
