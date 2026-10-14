import { notFound } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

type ProfileVisit = {
  id: string;
  visited_on: string;
  rating_overall: number;
  resorts: { slug: string; name: string } | { slug: string; name: string }[] | null;
};

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  if (!publicEnv()) {
    notFound();
  }

  const { username } = await params;
  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data } = await supabase
    .from("reviews")
    .select("id, visited_on, rating_overall, resorts(slug, name)")
    .eq("user_id", profile.id)
    .order("visited_on", { ascending: false });

  const visits = (data ?? []) as unknown as ProfileVisit[];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
        <p className="text-sm text-zinc-600">@{profile.username}</p>
      </div>
      {visits.length === 0 ? (
        <p className="text-sm text-zinc-600">No visits yet.</p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {visits.map((visit) => {
          const resort = Array.isArray(visit.resorts) ? visit.resorts[0] : visit.resorts;
          if (!resort) {
            return null;
          }
          return (
            <li key={visit.id}>
              <a
                href={`/resorts/${resort.slug}`}
                className="flex items-baseline justify-between gap-4 rounded-md border border-zinc-200 px-3 py-3"
              >
                <span className="font-medium">{resort.name}</span>
                <span className="text-sm text-zinc-500">
                  {visit.visited_on} · {visit.rating_overall}/5
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
