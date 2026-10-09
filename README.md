# Ski diary

A public diary of ski-resort visits. Sign in with Google, pick a username, and log a visit against a resort that is already in the catalog.

Each visit has a required overall score from 1 to 5 and a required date. Optional scores, also 1 to 5, are snow, value, lifts, terrain, facilities, crowds, and access. Higher is always better. Blank optional scores are left out of the resort average. Averages are a database view (`resort_cards`), not fields you edit on the resort.

The same person can log the same resort more than once. People can edit or delete their own visits. Reviews are public. Visitors cannot add resorts. There are no follows, likes, or lists in this version.

Resort pages are `/resorts/[slug]`. Profiles are `/users/[username]`.

To continue on another machine, read [docs/handoff.md](docs/handoff.md).

## Setup

1. Create a free Supabase project. Do not add a payment method, and do not enable Google Cloud Identity Platform.
2. Run [supabase/migrations/20261009180000_resorts.sql](supabase/migrations/20261009180000_resorts.sql) in the SQL editor, then [supabase/seed.sql](supabase/seed.sql).
3. In Google Cloud, create an OAuth web client. Set the authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`. Publish the consent screen, or keep it in Testing and add the Google accounts that should be able to sign in. Scopes are email, profile, and OpenID.
4. In Supabase, enable the Google provider and allow `http://localhost:3000/auth/callback`.
5. Copy [.env.example](.env.example) to `.env.local` and set the Supabase URL and anon key.

```powershell
npm install
npm run dev
```

The catalog is the 37 resorts in `public/data/resorts.json`. The seed uses slug, English name, `locationEn` as the place line, latitude, and longitude. Country is Japan. Lifts, webcams, shops, and the other JSON files are not loaded. Rebuild the seed with `node scripts/build-resort-seed.mjs` if that file changes.

## Scripts

- `npm run dev` — local app
- `npm test` — score, date, and username rules
- `npm run lint` — ESLint
