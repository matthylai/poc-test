-- Resorts, profiles, visit reviews, and calculated score averages.
-- Catalog rows are inserted with SQL (or a later JSON import), not by visitors.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(username) between 3 and 20
  )
);

create table public.resorts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country text not null default '',
  region text not null default '',
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  constraint resorts_lat_range check (
    lat is null or (lat >= -90 and lat <= 90)
  ),
  constraint resorts_lng_range check (
    lng is null or (lng >= -180 and lng <= 180)
  )
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resort_id uuid not null references public.resorts (id) on delete cascade,
  visited_on date not null,
  body text not null default '',
  rating_overall smallint not null,
  rating_snow smallint,
  rating_value smallint,
  rating_lifts smallint,
  rating_terrain smallint,
  rating_facilities smallint,
  rating_crowds smallint,
  rating_access smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_visited_on_not_future check (visited_on <= current_date + 1),
  constraint reviews_overall_range check (rating_overall between 1 and 5),
  constraint reviews_snow_range check (rating_snow is null or rating_snow between 1 and 5),
  constraint reviews_value_range check (rating_value is null or rating_value between 1 and 5),
  constraint reviews_lifts_range check (rating_lifts is null or rating_lifts between 1 and 5),
  constraint reviews_terrain_range check (rating_terrain is null or rating_terrain between 1 and 5),
  constraint reviews_facilities_range check (rating_facilities is null or rating_facilities between 1 and 5),
  constraint reviews_crowds_range check (rating_crowds is null or rating_crowds between 1 and 5),
  constraint reviews_access_range check (rating_access is null or rating_access between 1 and 5)
);

create index reviews_resort_id_idx on public.reviews (resort_id);
create index reviews_user_id_idx on public.reviews (user_id);

-- One row per resort, including resorts that have no visits yet.
-- avg() ignores null optional scores. review_count counts every visit.
create view public.resort_cards
with (security_invoker = true) as
select
  r.id,
  r.slug,
  r.name,
  r.country,
  r.region,
  r.lat,
  r.lng,
  count(v.id)::int as review_count,
  round(avg(v.rating_overall)::numeric, 2) as overall,
  round(avg(v.rating_snow)::numeric, 2) as snow,
  round(avg(v.rating_value)::numeric, 2) as value,
  round(avg(v.rating_lifts)::numeric, 2) as lifts,
  round(avg(v.rating_terrain)::numeric, 2) as terrain,
  round(avg(v.rating_facilities)::numeric, 2) as facilities,
  round(avg(v.rating_crowds)::numeric, 2) as crowds,
  round(avg(v.rating_access)::numeric, 2) as access
from public.resorts r
left join public.reviews v on v.resort_id = r.id
group by r.id;

alter table public.profiles enable row level security;
alter table public.resorts enable row level security;
alter table public.reviews enable row level security;

create policy profiles_public_read
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy resorts_public_read
  on public.resorts
  for select
  to anon, authenticated
  using (true);

create policy reviews_public_read
  on public.reviews
  for select
  to anon, authenticated
  using (true);

create policy reviews_insert_own
  on public.reviews
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy reviews_update_own
  on public.reviews
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy reviews_delete_own
  on public.reviews
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.resorts to anon, authenticated;
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.resort_cards to anon, authenticated;
