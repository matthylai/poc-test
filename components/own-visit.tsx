"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VisitForm, type VisitDefaults } from "@/components/visit-form";

export function OwnVisit({
  resortId,
  visit,
}: {
  resortId: string;
  visit: VisitDefaults & { id: string };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    const response = await fetch(`/api/reviews/${visit.id}`, { method: "DELETE" });
    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Could not delete the visit");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 text-sm">
        <button type="button" className="underline" onClick={() => setEditing((value) => !value)}>
          {editing ? "Close" : "Edit"}
        </button>
        <button type="button" className="underline" onClick={remove}>
          Delete
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {editing ? <VisitForm resortId={resortId} visit={visit} /> : null}
    </div>
  );
}
