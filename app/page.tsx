import Link from "next/link";
import { formatAverage, placeLabel, type ResortCard } from "@/lib/resort";
import { publicEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!publicEnv()) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-16">
        <h1 className="text-2xl font-semibold">Ski diary</h1>
        <p className="text-sm text-zinc-600">
          Copy .env.example to .env.local and add the Supabase URL and anon key.
          Then run the SQL migration. Resort data is imported after that.
        </p>
      </main>
    );
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("resort_cards")
    .select("id, slug, name, country, region, review_count, overall")
    .order("name");

  const resorts = (data ?? []) as Pick<
    ResortCard,
    "id" | "slug" | "name" | "country" | "region" | "review_count" | "overall"
  >[];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Resorts</h1>
        <p className="text-sm text-zinc-600">
          Average scores come from every logged visit. Higher is better.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-700">
          Could not load resorts. Apply the migration, then supabase/seed.sql, in the SQL editor.
        </p>
      ) : null}
      {!error && resorts.length === 0 ? (
        <p className="text-sm text-zinc-600">
          No resorts yet. Run supabase/seed.sql after the migration.
        </p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {resorts.map((resort) => (
          <li key={resort.id}>
            <Link
              href={`/resorts/${resort.slug}`}
              className="flex items-baseline justify-between gap-4 rounded-md border border-zinc-200 px-3 py-3"
            >
              <span>
                <span className="font-medium">{resort.name}</span>
                <span className="mt-1 block text-sm text-zinc-500">
                  {placeLabel(resort) || "Location not set"}
                </span>
              </span>
              <span className="text-sm text-zinc-600">
                {resort.review_count > 0
                  ? `${formatAverage(resort.overall)} · ${resort.review_count}`
                  : "No visits"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
