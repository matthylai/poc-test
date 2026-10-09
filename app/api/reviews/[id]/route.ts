import { NextResponse } from "next/server";
import { parseVisitDate, parseVisitScores } from "@/lib/ratings";
import { requireProfile } from "@/lib/viewer";

function readBody(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireProfile();
  if ("error" in auth && auth.error) {
    return auth.error;
  }
  if (!("supabase" in auth) || !auth.supabase || !auth.profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }

  let scores;
  let visitedOn: string;
  try {
    scores = parseVisitScores(payload);
    visitedOn = parseVisitDate(payload.visited_on, new Date());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid visit";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("reviews")
    .update({
      visited_on: visitedOn,
      body: readBody(payload.body),
      rating_overall: scores.overall,
      rating_snow: scores.snow,
      rating_value: scores.value,
      rating_lifts: scores.lifts,
      rating_terrain: scores.terrain,
      rating_facilities: scores.facilities,
      rating_crowds: scores.crowds,
      rating_access: scores.access,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.profile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    const status = error.code === "23514" ? 400 : 500;
    return NextResponse.json(
      { error: status === 400 ? "That visit could not be saved" : "Could not update the visit" },
      { status },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireProfile();
  if ("error" in auth && auth.error) {
    return auth.error;
  }
  if (!("supabase" in auth) || !auth.supabase || !auth.profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { data, error } = await auth.supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.profile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not delete the visit" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
