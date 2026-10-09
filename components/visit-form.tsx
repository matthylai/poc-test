"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const FIELDS = [
  { key: "overall", label: "Overall", required: true },
  { key: "snow", label: "Snow", required: false },
  { key: "value", label: "Value", required: false },
  { key: "lifts", label: "Lifts", required: false },
  { key: "terrain", label: "Terrain", required: false },
  { key: "facilities", label: "Facilities", required: false },
  { key: "crowds", label: "Crowds", required: false },
  { key: "access", label: "Access", required: false },
] as const;

type ScoreKey = (typeof FIELDS)[number]["key"];

export type VisitDefaults = {
  id?: string;
  visited_on: string;
  body: string;
  overall: number | null;
  snow: number | null;
  value: number | null;
  lifts: number | null;
  terrain: number | null;
  facilities: number | null;
  crowds: number | null;
  access: number | null;
};

export function VisitForm({
  resortId,
  visit,
}: {
  resortId: string;
  visit?: VisitDefaults;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {
      resort_id: resortId,
      visited_on: String(form.get("visited_on") ?? ""),
      body: String(form.get("body") ?? ""),
    };

    for (const field of FIELDS) {
      const raw = String(form.get(field.key) ?? "");
      payload[field.key] = raw === "" ? null : Number(raw);
    }

    const response = await fetch(visit?.id ? `/api/reviews/${visit.id}` : "/api/reviews", {
      method: visit?.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!response.ok) {
      setError(json?.error ?? "Could not save the visit");
      return;
    }
    router.refresh();
    if (!visit?.id) {
      event.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Date
        <input
          required
          type="date"
          name="visited_on"
          defaultValue={visit?.visited_on ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1 text-sm">
            {field.label}
            <select
              name={field.key}
              required={field.required}
              defaultValue={scoreDefault(visit, field.key)}
              className="rounded-md border border-zinc-300 px-2 py-2"
            >
              {field.required ? null : <option value="">—</option>}
              {[1, 2, 3, 4, 5].map((score) => (
                <option key={score} value={score}>
                  {score}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea
          name="body"
          defaultValue={visit?.body ?? ""}
          className="min-h-24 rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Saving" : visit?.id ? "Save visit" : "Log visit"}
      </button>
    </form>
  );
}

function scoreDefault(visit: VisitDefaults | undefined, key: ScoreKey) {
  const value = visit?.[key];
  return value === null || value === undefined ? "" : String(value);
}
