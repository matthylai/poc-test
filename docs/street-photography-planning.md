# Street photography site — planning handoff

**Status:** Product direction agreed. Screens/schema not fully locked. **No application code yet.**  
**Date:** 2026-09-25  
**Repo:** `poc-test` (greenfield)

Use this file to continue on another device. Cursor plan files under `.cursor/` may not travel with git.

---

## Goal

A fullstack portfolio project you will actually use, hosted **free or cheap**. Showcase production habits (auth, APIs, data model, uploads, maps, public vs private), not a social network.

**Theme decided:** street photography (not the snowboard journal). Combining snow + photos was rejected unless the product was “a day on the mountain”; you preferred a photography-first product.

---

## Decisions (locked)

| Topic | Decision |
| --- | --- |
| Product | Single-author CMS: only you upload; anyone can browse |
| Unit of work | **Collection** (a walk / a set), not one pin per photo |
| Labels | Date, location (place name + map pin), notes |
| Map | **Public** map of published collections |
| Location source | **Manual:** click the map (or type a place name). EXIF GPS optional later, never required |
| Privacy rule | Pin **neighborhood/city**, not a doorway. Pin = where you worked, not a subject’s address |
| Hosting | Stay on free/cheap tiers; never store camera originals / RAW in v1 |
| Images | Client-side resize to WebP, max edge ~1600px, then object storage |

---

## Product: Street photography Field Binder

Backend for creating collections (date, location, labels) and uploading photos. Frontend map shows collections; click through to a gallery.

This matches street practice: work is remembered as walks and neighborhoods, and GPS is often off.

### Public (no account)

- Map of **published** collections (one marker each).
- Marker → title, date, place name, cover → collection gallery.
- List/index of collections as well (SEO, fallback if the map fails).
- Filters by year and city when those fields exist.

### Admin (you only)

- Create collection: title, date, notes, location name, click-map for lat/lng.
- Upload multiple photos; cover, captions, sort order.
- Toggle `published` (drafts stay off the public map).

### MVP cutoff

- No per-photo map pins.
- No RAW / full-res originals in cloud storage.
- No comments, likes, other users, messaging.
- No Google Maps Platform. Click-to-set coordinates; MapLibre + OSM tiles.
- No face detection, AI captions, print shop, video.

### Follow-ons (same data model, not v1)

- Contact-sheet / sequence grid (shoot order).
- **Projects** grouping many collections (e.g. “Night markets 2026”).
- Map filters: year, city, tags (night, rain, B&W).
- Time-of-day / light tags.
- Camera / film / lens on the collection (one field).
- Optional EXIF: “use this file’s GPS as the collection pin.”
- Shuffle / single photo on the homepage.
- Per-photo pins later if you still want them after collection pins ship.

---

## Why this is viable (and what would break it)

**Viable because**

- Clear fullstack split: anonymous read vs authenticated write.
- Collection-level pins = fewer markers, no EXIF pipeline in MVP, cheap geocoding (none).
- Visually strong for a hiring demo (map + photography).

**Would weaken it:** Instagram-style social features (cost, moderation, not how you use it).

**Would make it expensive:** uploading uncompressed JPEGs/RAWs. Cap size and count; one display size, not an image pyramid.

---

## Architecture (target)

```text
Visitor  →  Public map + galleries  →  Postgres (published rows) + object storage
You      →  Admin upload / labels   →  Postgres + object storage (auth required)
```

**Suggested stack**

- App: Next.js (App Router) + TypeScript, deploy **Vercel** Hobby
- DB + auth: **Supabase** (Postgres, Auth — one admin user)
- Photos: **Supabase Storage** in v1; move to **Cloudflare R2** if volume/egress grows
- Maps: **MapLibre** + OpenStreetMap (no Mapbox bill)

**Cost controls**

- Resize to WebP in the browser before upload
- Upload caps (count + bytes)
- No video in v1

If you want a stronger “edge/infra” story later: same UI on Cloudflare Pages + Workers + D1 + R2.

---

## Data model (draft)

### `collections`

- `id`
- `title`
- `shot_on` (date)
- `notes`
- `place_name` (e.g. neighborhood)
- `city`
- `lat`, `lng` (from map click; neighborhood-level)
- `published` (boolean)
- `cover_photo_id` (nullable FK)

### `photos`

- `id`
- `collection_id`
- `storage_key`
- `caption`
- `sort_order`
- `width`, `height`

### Optional later

- `tags` + `collection_tags`
- `projects` + `project_collections`

**Authorization**

- Public: `SELECT` where `published = true`
- Writes: authenticated admin session only
- Storage: public read for published objects, or signed URLs; writes authenticated

---

## Implementation order (when coding starts)

1. Schema + admin auth + create/edit collection **without** photos.
2. Photo upload pipeline + admin gallery + public collection page.
3. Public map (published collections only).
4. Publish flag polish, year/city filters, empty/error states, CI, README + live URL.

**Not started.** Do not skip to a map demo before auth and `published` exist, or drafts will leak.

---

## Skills this should prove

Auth and authorization (admin vs public), relational modeling, file uploads, RLS or equivalent, maps, filtering, pagination, empty/error states, tests on domain logic, CI, README with architecture and demo URL.

**Skip:** Kubernetes, microservices, Redis, a separate admin SPA, multi-tenant marketplace.

---

## Ideas considered and not chosen

1. **Powder Day Journal** (snow + photos as one “session”) — coherent if you log ride days; you preferred photography-first.
2. **Resort Daybook** (snow, text-only) — cheapest, weaker visual portfolio.

---

## Open points (resolve before or during first implementation)

- Exact UI for admin vs public (wireframes not done).
- Confirm Next.js + Supabase vs Cloudflare-first.
- Whether year/city filters are in the first public map or immediately after.

Per-photo map pins: **not MVP**; add only after collection pins work.

---

## How to continue on another device

1. Clone this repo; this file is the source of truth.
2. Commit this doc if it is not on the remote yet.
3. Next session: lock screens (admin form, map, gallery) then scaffold. Do not invent social features.
4. Prompt starter: *“Read `docs/street-photography-planning.md` and continue: lock schema and scaffold Next.js + Supabase admin + public map per the MVP.”*
