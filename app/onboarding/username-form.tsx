"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function UsernameForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: String(form.get("username") ?? ""),
        display_name: String(form.get("display_name") ?? ""),
      }),
    });
    const json = (await response.json().catch(() => null)) as
      | { username?: string; error?: string }
      | null;
    setPending(false);
    if (!response.ok || !json?.username) {
      setError(json?.error ?? "Could not save the username");
      return;
    }
    router.push(`/users/${json.username}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Username
        <input
          required
          name="username"
          autoCapitalize="none"
          className="rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Display name
        <input name="display_name" className="rounded-md border border-zinc-300 px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Saving" : "Continue"}
      </button>
    </form>
  );
}
