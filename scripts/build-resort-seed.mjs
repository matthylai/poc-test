import { readFileSync, writeFileSync } from "node:fs";

const resorts = JSON.parse(
  readFileSync(new URL("../public/data/resorts.json", import.meta.url), "utf8"),
);

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const rows = resorts.map((resort) => {
  const lat = Number(resort.lat);
  const lng = Number(resort.lng);
  if (!resort.slug || !resort.nameEn || Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error(`Resort is missing a required field: ${resort.slug ?? resort.nameEn}`);
  }
  return `  (${sqlText(resort.slug)}, ${sqlText(resort.nameEn)}, 'Japan', ${sqlText(resort.locationEn)}, ${lat}, ${lng})`;
});

const sql = `-- Generated from public/data/resorts.json.
-- Fields used: slug, nameEn, locationEn, lat, lng. Country is Japan.
-- Run this after the migration. Re-running updates names and coordinates.

insert into public.resorts (slug, name, country, region, lat, lng)
values
${rows.join(",\n")}
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  lat = excluded.lat,
  lng = excluded.lng;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`Wrote ${rows.length} resorts`);
