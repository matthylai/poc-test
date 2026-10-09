import { NextResponse } from "next/server";
import { parseVisitDate, parseVisitScores } from "@/lib/ratings";
import { requireProfile } from "@/lib/viewer";

function readBody(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export async function POST(request: Request) {
  const auth = await requireProfile();
  if ("error" in auth && auth.error) {
    return auth.error;
  }
  if (!("supabase" in auth) || !auth.supabase || !auth.profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }

  if (typeof payload.resort_id !== "string" || payload.resort_id === "") {
    return NextResponse.json({ error: "Resort is required" }, { status: 400 });
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
    .insert({
      user_id: auth.profile.id,
      resort_id: payload.resort_id,
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
    })
    .select("id")
    .single();

  if (error) {
    const status = error.code === "23514" || error.code === "23503" ? 400 : 500;
    return NextResponse.json(
      { error: status === 400 ? "That visit could not be saved" : "Could not save the visit" },
      { status },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
