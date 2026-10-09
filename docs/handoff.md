# Handoff — ski diary

**Status:** App structure is in the repo. Supabase, Google sign-in, and Vercel are not connected yet. The resort catalog SQL is generated. **Date:** 2026-10-09.

Pull this repo on the other machine. This file plus [README.md](../README.md) is the source of truth. Cursor plan files under `.cursor/` are not in git.

## What this is

A public Letterboxd-style diary of ski-resort visits. People sign in with Google, pick a username, and log visits against a fixed catalog. They do not add resorts.

## Locked decisions

- Google sign-in through Supabase Auth. Free OAuth client. Do not enable Google Cloud Identity Platform.
- Free plans only, no payment method on Google Cloud, Supabase, or Vercel. Over the free quota the project is restricted or paused. It is not billed unless you upgrade and allow overage.
- One visit is one review, with a required date. The same person can log the same resort more than once.
- Scores are whole numbers from 1 to 5. Higher is always better.
- Overall is required. Optional scores: snow, value, lifts, terrain, facilities, crowds, access. Blank optional scores are skipped in the average.
- Value means the ticket was worth the price. Crowds means the mountain felt uncrowded.
- Averages live in the `resort_cards` database view, not as columns you edit.
- Reviews are public. Authors can edit or delete their own visits.
- No follows, likes, or lists.
- Profile URL: `/users/[username]`. Resort URL: `/resorts/[slug]`.
- Username is chosen once after Google sign-in: 3–20 characters, letters, numbers, hyphens.
- Catalog is seeded. Visitors cannot create resorts.

## What is already built

- Next.js app, route handlers, and a session proxy (`proxy.ts`).
- SQL migration: `supabase/migrations/20261009180000_resorts.sql` (`profiles`, `resorts`, `reviews`, `resort_cards`, row-level security).
- Seed: `supabase/seed.sql` — 37 Japanese resorts.
- Pages: `/` list, `/resorts/[slug]`, `/users/[username]`, `/login`, `/onboarding`.
- APIs: `POST /api/profile`, `POST /api/reviews`, `PATCH` and `DELETE /api/reviews/[id]`.
- Domain tests: `npm test` (scores, visit date, username).

## Catalog

Source file: `public/data/resorts.json`. The files under `public/data/resorts/` repeat the same resorts and are not imported.

Seed columns:

| JSON | Database |
| --- | --- |
| `slug` | `slug` |
| `nameEn` | `name` |
| `locationEn` | `region` (place line, e.g. Kutchan, Hokkaido) |
| `lat`, `lng` | `lat`, `lng` |
| — | `country` = Japan |

Not loaded: lifts, webcams, trail maps, tags, shops, onsens, shuttles, terrain, practical info.

If `resorts.json` changes, run `node scripts/build-resort-seed.mjs`, then re-run `supabase/seed.sql`. The seed updates existing slugs instead of duplicating them.

## Run it on the new machine

```powershell
npm install
copy .env.example .env.local
npm run dev
```

`.env.local` is not in git. Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the anon key only. Do not put the service role key in the app or in Vercel.

The home page tells you to configure Supabase until those variables exist. Google sign-in does nothing useful until the provider is enabled.

## Put it online

1. Create a free Supabase project. In the SQL editor, run the migration, then `supabase/seed.sql`.
2. Google Cloud: OAuth client, type Web. Authorized redirect URI is `https://<project-ref>.supabase.co/auth/v1/callback`. Scopes: email, profile, OpenID. Testing mode only allows listed test users. Publish the consent screen if any Google account should be able to sign in. Still free.
3. Supabase: enable the Google provider with that client id and secret. Under Authentication → URL configuration, set the site URL to the Vercel URL and allow both:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`
4. Import the repo on Vercel Hobby. Set the same two `NEXT_PUBLIC_` variables, then redeploy. Add the Vercel callback URL in Supabase if the domain was not known yet.

## Not done

- No live Supabase project, Google client, or Vercel deploy from this machine.
- Extra resort fields (elevation, website, trail counts, lifts) are not columns yet.
- Site name in the UI is the working title “Ski diary”.
- No map, search, or filters.

## Prompt to continue

Read `docs/handoff.md` and `README.md`. The ski diary app is already implemented. Help me finish Supabase, Google sign-in, and Vercel using the steps in the handoff, or extend the resort fields if I bring more of the JSON.
