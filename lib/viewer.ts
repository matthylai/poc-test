import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
};

export async function getViewer() {
  if (!publicEnv()) {
    return { configured: false as const, user: null, profile: null, supabase: null };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true as const, user: null, profile: null, supabase };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    configured: true as const,
    user,
    profile: (profile as Profile | null) ?? null,
    supabase,
  };
}

export async function requireProfile() {
  const viewer = await getViewer();
  if (!viewer.configured || !viewer.supabase) {
    return {
      error: NextResponse.json(
        { error: "Server is not configured" },
        { status: 503 },
      ),
    };
  }
  if (!viewer.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!viewer.profile) {
    return {
      error: NextResponse.json(
        { error: "Choose a username before logging a visit" },
        { status: 409 },
      ),
    };
  }

  return {
    supabase: viewer.supabase,
    user: viewer.user,
    profile: viewer.profile,
  };
}
