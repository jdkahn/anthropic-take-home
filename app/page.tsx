"use client";

import { useRouter } from "next/navigation";

// M0 placeholder: proves the guard works. Slice 3 adds the streaming reply here.
export default function Home() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <main className="mx-auto mt-24 max-w-2xl px-4">
      <p>Signed in. The chat goes here.</p>
      <button onClick={logout} className="mt-4 text-sm underline">
        Sign out
      </button>
    </main>
  );
}
