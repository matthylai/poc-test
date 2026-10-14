"use client";

import { useState } from "react";
import { publicEnv } from "@/lib/env";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function LoginButton({ nextPath = "/" }: { nextPath?: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function signIn() {
    if (!publicEnv()) {
      setMessage("Add the Supabase URL and anon key before signing in.");
      return;
    }
    const destination =
      nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    document.cookie = `auth_next=${encodeURIComponent(destination)}; Path=/; Max-Age=600; SameSite=Lax`;
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={signIn}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
      >
        Sign in with Google
      </button>
      {message ? <p className="text-sm text-red-700">{message}</p> : null}
    </div>
  );
}
