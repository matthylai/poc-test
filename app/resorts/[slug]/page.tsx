import Link from "next/link";
import { notFound } from "next/navigation";
import { OwnVisit } from "@/components/own-visit";
import { VisitForm } from "@/components/visit-form";
import { publicEnv } from "@/lib/env";
import { formatAverage, placeLabel, type ResortCard, type ReviewRow } from "@/lib/resort";
import { createServerSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

const AVERAGE_ROWS = [
  ["overall", "Overall"],
  ["snow", "Snow"],
  ["value", "Value"],
  ["lifts", "Lifts"],
  ["terrain", "Terrain"],
  ["facilities", "Facilities"],
  ["crowds", "Crowds"],
  ["access", "Access"],
] as const;

export default async function ResortPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!publicEnv()) {
    notFound();
  }

  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("resort_cards")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const resort = data as ResortCard;
  const { data: reviewRows } = await supabase
    .from("reviews")
    .select(
      "id, user_id, resort_id, visited_on, body, rating_overall, rating_snow, rating_value, rating_lifts, rating_terrain, rating_facilities, rating_crowds, rating_access, profiles(username, display_name)",
    )
    .eq("resort_id", resort.id)
    .order("visited_on", { ascending: false });

  const reviews = (reviewRows ?? []) as unknown as ReviewRow[];
  const viewer = await getViewer();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{resort.name}</h1>
        <p className="text-sm text-zinc-600">
          {placeLabel(resort) || "Location not set"}
          {resort.review_count > 0 ? ` · ${resort.review_count} visits` : ""}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AVERAGE_ROWS.map(([key, label]) => (
          <div key={key} className="rounded-md border border-zinc-200 px-3 py-2">
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="text-lg">{formatAverage(resort[key])}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Log a visit</h2>
        {viewer.profile ? (
          <VisitForm resortId={resort.id} />
        ) : viewer.user ? (
          <Link href="/onboarding" className="text-sm underline">
            Choose a username to log a visit
          </Link>
        ) : (
          <Link href="/login" className="text-sm underline">
            Sign in to log a visit
          </Link>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Visits</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-600">No visits yet.</p>
        ) : null}
        <ul className="flex flex-col gap-6">
          {reviews.map((review) => {
            const profile = Array.isArray(review.profiles)
              ? review.profiles[0]
              : review.profiles;
            return (
              <li key={review.id} className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  {profile ? (
                    <Link href={`/users/${profile.username}`} className="font-medium underline">
                      {profile.display_name}
                    </Link>
                  ) : (
                    <span className="font-medium">Someone</span>
                  )}
                  <span className="text-sm text-zinc-500">
                    {review.visited_on} · {review.rating_overall}/5
                  </span>
                </div>
                {review.body ? <p className="text-sm">{review.body}</p> : null}
                <p className="text-xs text-zinc-500">
                  {detailScores(review)}
                </p>
                {viewer.profile?.id === review.user_id ? (
                  <OwnVisit
                    resortId={resort.id}
                    visit={{
                      id: review.id,
                      visited_on: review.visited_on,
                      body: review.body,
                      overall: review.rating_overall,
                      snow: review.rating_snow,
                      value: review.rating_value,
                      lifts: review.rating_lifts,
                      terrain: review.rating_terrain,
                      facilities: review.rating_facilities,
                      crowds: review.rating_crowds,
                      access: review.rating_access,
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function detailScores(review: ReviewRow) {
  const parts = [
    ["Snow", review.rating_snow],
    ["Value", review.rating_value],
    ["Lifts", review.rating_lifts],
    ["Terrain", review.rating_terrain],
    ["Facilities", review.rating_facilities],
    ["Crowds", review.rating_crowds],
    ["Access", review.rating_access],
  ].filter((entry): entry is [string, number] => typeof entry[1] === "number");

  return parts.length > 0 ? parts.map(([label, score]) => `${label} ${score}`).join(" · ") : "Overall only";
}
