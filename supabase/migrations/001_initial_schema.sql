-- ────────────────────────────────────────────────────────────────────
-- 001_initial_schema.sql
-- ────────────────────────────────────────────────────────────────────

create table public.users (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  pin_hash   text        not null,
  is_admin   boolean     not null default false,
  created_at timestamptz not null default now()
);

comment on column public.users.pin_hash is 'bcrypt hash — never returned to clients via anon role';

create table public.restaurants (
  id              uuid             primary key default gen_random_uuid(),
  name            text             not null,
  address         text             not null,
  lat             double precision not null,
  lng             double precision not null,
  google_place_id text             unique,
  created_at      timestamptz      not null default now()
);

create table public.visits (
  id                uuid      primary key default gen_random_uuid(),
  restaurant_id     uuid      not null references public.restaurants(id) on delete cascade,
  user_id           uuid      not null references public.users(id) on delete cascade,
  visit_date        date      not null default current_date,
  meat_types        text[]    not null default '{}',
  value_rating      smallint  not null check (value_rating      between 1 and 5),
  quantity_rating   smallint  not null check (quantity_rating   between 1 and 5),
  atmosphere_rating smallint  not null check (atmosphere_rating between 1 and 5),
  staff_rating      smallint  not null check (staff_rating      between 1 and 5),
  overall_rating    smallint  not null check (overall_rating    between 1 and 5),
  comments          text,
  created_at        timestamptz not null default now()
);

create table public.sides (
  id       uuid     primary key default gen_random_uuid(),
  visit_id uuid     not null references public.visits(id) on delete cascade,
  name     text     not null,
  rating   smallint not null check (rating between 1 and 5)
);

create table public.sauces (
  id                uuid     primary key default gen_random_uuid(),
  visit_id          uuid     not null references public.visits(id) on delete cascade,
  name              text     not null,
  flavor_descriptor text,
  rating            smallint not null check (rating    between 1 and 5),
  spiciness         smallint not null check (spiciness between 1 and 5)
);

create type public.photo_label as enum ('Full Meal', 'Exterior', 'Interior');

create table public.photos (
  id         uuid               primary key default gen_random_uuid(),
  visit_id   uuid               not null references public.visits(id) on delete cascade,
  label      public.photo_label not null,
  r2_key     text               not null,
  r2_url     text               not null,
  created_at timestamptz        not null default now()
);

-- Indexes
create index visits_restaurant_id_idx on public.visits(restaurant_id);
create index visits_user_id_idx       on public.visits(user_id);
create index visits_visit_date_idx    on public.visits(visit_date desc);
create index sides_visit_id_idx       on public.sides(visit_id);
create index sauces_visit_id_idx      on public.sauces(visit_id);
create index photos_visit_id_idx      on public.photos(visit_id);
create index restaurants_place_id_idx on public.restaurants(google_place_id)
  where google_place_id is not null;
