import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/ratings";
import { getViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer.configured || !viewer.supabase) {
    return NextResponse.json(
      { error: "Server is not configured" },
      { status: 503 },
    );
  }
  if (!viewer.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (viewer.profile) {
    return NextResponse.json(
      { error: "Username is already set" },
      { status: 409 },
    );
  }

  let payload: { username?: unknown; display_name?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }

  let username: string;
  try {
    username = normalizeUsername(String(payload.username ?? ""));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid username";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const displayName =
    typeof payload.display_name === "string" && payload.display_name.trim()
      ? payload.display_name.trim()
      : username;

  const { error } = await viewer.supabase.from("profiles").insert({
    id: viewer.user.id,
    username,
    display_name: displayName,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That username is taken" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Could not save the username" },
      { status: 500 },
    );
  }

  return NextResponse.json({ username }, { status: 201 });
}
