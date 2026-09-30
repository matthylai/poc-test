# Street photography site — planning handoff

**Status:** Product direction and technical defaults locked. Next work is written schema notes, an auth matrix, and six request flows — then the migration. **No application code yet.**  
**Date:** 2026-09-30  
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
| Images | Client-side resize to WebP, max edge ~1600px, then a **private** bucket. Public pages only get URLs for photos on published collections |
| Stack | Next.js (App Router) + TypeScript, Supabase Postgres/Auth/Storage, Vercel Hobby. Cloudflare is a later option, not v1 |
| API | Route Handlers under `app/api/...` plus a domain module. UI calls HTTP |
| Admin | One email in `ADMIN_EMAIL`. No roles table |
| Public URLs | Unique `slug` on collections; gallery pages at `/collections/[slug]` |
| Gallery v1 | Contact sheet in `sort_order` |
| Map filters | After the map lists every published collection |

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

## Skills this should prove

Auth and authorization (admin vs public), relational modeling, file uploads, RLS or equivalent, maps, filtering, pagination, empty/error states, tests on domain logic, CI, README with architecture and demo URL.

**Skip:** Kubernetes, microservices, Redis, a separate admin SPA, multi-tenant marketplace.

---

## Ideas considered and not chosen

1. **Powder Day Journal** (snow + photos as one “session”) — coherent if you log ride days; you preferred photography-first.
2. **Resort Daybook** (snow, text-only) — cheapest, weaker visual portfolio.

---

## Decide before coding

Locked on 2026-09-30. You do **not** need wireframes or a site name before the first migration.

| Topic | Locked choice | Why |
| --- | --- | --- |
| Stack | Next.js (App Router) + Supabase Postgres/Auth/Storage on Vercel Hobby | Real SQL, migrations, and row-level security. Cloudflare Workers + D1 is a later rewrite, not v1. |
| API shape | Route Handlers (`app/api/...`) plus a small domain module. UI calls HTTP. | One request path: auth → rules → SQL → status code. |
| Who is admin | One email in `ADMIN_EMAIL`. Session email must match. No roles table. | Single-author CMS. |
| Public URLs | `slug` on `collections`, unique. Gallery page is `/collections/[slug]`. | Plural resource name, same noun as the API `GET /api/collections/:slug`. |
| Image bytes | Browser resizes to WebP, then uploads to a **private** bucket. Public pages only receive URLs for photos whose collection is published. | Publish rule applies to files, not only rows. |
| Gallery | Contact sheet in `sort_order` | Matches street sequences; no schema change. |
| Map filters | After the map lists every published collection | Query on columns you already store. |
| Visual design | `/` map + list, `/collections/[slug]` gallery, `/admin` forms. Plain layout. | Layout is not the architecture. |
| Per-photo pins | Out of MVP | Already decided. |

**Still open, does not block the migration:** site title.

---

## Architecture practice (do this while building)

Goal: leave the repo with a schema you can defend, and request flows you can draw. Not a second framework.

Work in this order. Each step has a written artifact in `docs/` before the matching code.

### 1. Schema with invariants (database design)

Expand the draft tables before writing UI. Write one SQL migration by hand.

Add:

- `collections.slug` text unique not null
- `photos.sort_order` int not null, unique `(collection_id, sort_order)`
- `cover_photo_id` nullable, FK to `photos`. Create the collection first, insert photos, then set the cover. `ON DELETE SET NULL` so deleting the cover photo does not delete the collection.
- Check: if `published` then `lat` and `lng` are not null. Publishing without a pin is a data bug, not a UI nicety.
- Index for the public list: `(published, shot_on desc)` or partial index `where published`.

**Judgment to write down (short note in the migration comment or `docs/schema-notes.md`):**

- “At least one photo before publish” stays in the **domain layer**, not a SQL trigger. Triggers are harder to test and you only have one writer.
- Numeric `lat`/`lng` is enough for hundreds of neighborhood pins. PostGIS is for radius/polygon queries you do not have.
- Do not store `city` as a separate table until you have many collections per city and you need shared city metadata. A text column is the right normalization for v1.

Practice: draw the ERD, then try to break it (delete cover photo, two photos with the same sort order, publish with null coordinates). The constraints should reject those.

### 2. Authorization matrix (before RLS policies)

Write a table and implement it twice: in Postgres RLS and in the route handler. They must match.

| Actor | Draft collection | Published collection | Photo bytes |
| --- | --- | --- | --- |
| Anonymous | no read, no write | read row + photos | read only if parent collection is published |
| Admin session | read/write | read/write | write; read drafts |

Rules:

- Browser uses the anon key (public pages) or the user JWT (admin). Never put the Supabase **service role** key in client code.
- Public photo reads go through a policy of the form “photo visible if its collection is published”, not a public bucket that also holds drafts.

### 3. Backend flows (write these before the handlers)

One short sequence per use case. For each: who calls it, preconditions, DB writes, storage writes, success status, failure status.

1. **Create draft** — `POST /api/collections`. Auth. Insert row, `published = false`, slug from title + date. `201` with id and slug. `401` if not admin. `409` if slug collides (retry with a suffix in the domain function).
2. **Upload photo** — three steps, because bytes and rows are different systems:
   - `POST /api/collections/:id/photos` creates a pending row and a storage path (admin only, collection must exist).
   - Client `PUT`s the WebP to that path.
   - `POST .../photos/:id/complete` checks the object exists, sets width/height, assigns `sort_order`.
   - If the byte upload never completes, a cleanup path deletes stale pending rows and objects. That orphan case is the architecture lesson; do not pretend upload is one transaction.
3. **Publish** — `POST /api/collections/:id/publish`. Domain function checks location, at least one completed photo, and a cover (default cover = lowest `sort_order` if unset). Returns a typed error (`MissingLocation`, `NoPhotos`). The route maps that to `409`. The UI does not re-implement the rules.
4. **Public map/list** — `GET /api/collections`. No auth. SQL `where published`. Response has slug, title, date, place, lat, lng, cover URL. No draft rows, no storage keys for drafts.
5. **Public gallery** — page `/collections/[slug]`, data from `GET /api/collections/:slug`. `404` if missing or not published (same response, so drafts are not enumerable).
6. **Delete photo** — remove row, clear cover if it pointed here, delete the object. If storage delete fails, record it; do not leave the row pointing at a key you already removed without a defined order. Pick an order and document it: **delete the row in a transaction only after storage delete succeeds**, or **mark deleted then sweep**. Choose one and stick to it.

Keep handlers thin:

- `app/api/...` parses input and maps errors to HTTP
- `lib/auth.ts` answers “is this the admin?”
- `lib/collections.ts` holds publish rules and slug rules (unit-test these with no HTTP)
- `lib/db` is SQL only
- `lib/storage` is the bucket only

That split is the backend-flow practice. Skip extra services, queues, and Redis.

### 4. Tests that prove the design

- Domain: publish rejected without coordinates; slug suffix on collision; cover falls back to first photo.
- Authorization: anonymous `GET` by slug of a draft is `404`; admin can `GET` the draft.
- Upload: pending photo never appears on the public gallery.

### 5. What not to practice on this project

Microservices, event buses, Kubernetes, a generic repository framework, and a second admin frontend. Those add boxes without a new constraint. The constraints worth learning here are **two stores (SQL + objects)**, **two actors (anon + admin)**, and **invariants the database cannot fully express**.

---

## Implementation order (when coding starts)

Do the written artifacts in “Architecture practice” first (schema notes, auth matrix, six flows). Then:

1. SQL migration + RLS + admin auth + create/edit collection **without** photos.
2. Photo upload pipeline (including the incomplete-upload case) + admin gallery + public collection page.
3. Public map (published collections only).
4. Publish-rule polish, year/city filters, empty/error states, CI, README + live URL.

**Not started.** Do not skip to a map demo before auth and `published` exist, or drafts will leak.

---

## How to continue

1. This file is the source of truth. Commit it if it is not on the remote yet.
2. Defaults in “Decide before coding” are locked. Site title can wait.
3. Next session starts with schema notes, the auth matrix, and the six flows — then the migration. Not with a map component.
4. Prompt starter: *“Read `docs/street-photography-planning.md`. Write schema notes, the auth matrix, and the six backend flows, then implement step 1 (migration, RLS, create collection).”*
