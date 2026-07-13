-- ────────────────────────────────────────────────────────────────────
-- 002_rls_policies.sql
-- ────────────────────────────────────────────────────────────────────

-- Admin helper — security definer prevents privilege escalation
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.users where id = auth.uid()),
    false
  );
$$;

-- Enable RLS
alter table public.users       enable row level security;
alter table public.restaurants enable row level security;
alter table public.visits      enable row level security;
alter table public.sides       enable row level security;
alter table public.sauces      enable row level security;
alter table public.photos      enable row level security;

-- ════════════════════════════════════════════════════════════════════
-- USERS
-- Column-level: anon may only see id and name (pin_hash never exposed)
-- ════════════════════════════════════════════════════════════════════
grant select (id, name) on public.users to anon;
grant select             on public.users to authenticated;

create policy "users_anon_select" on public.users
  for select to anon using (true);

create policy "users_auth_select" on public.users
  for select to authenticated using (true);

create policy "users_admin_insert" on public.users
  for insert to authenticated with check (public.is_admin());

create policy "users_admin_update" on public.users
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "users_admin_delete" on public.users
  for delete to authenticated using (public.is_admin());

-- ════════════════════════════════════════════════════════════════════
-- RESTAURANTS
-- Any authenticated user can read or add restaurants
-- ════════════════════════════════════════════════════════════════════
grant select, insert on public.restaurants to authenticated;

create policy "restaurants_auth_select" on public.restaurants
  for select to authenticated using (true);

create policy "restaurants_auth_insert" on public.restaurants
  for insert to authenticated with check (true);

-- ════════════════════════════════════════════════════════════════════
-- VISITS
-- All group members can read; own-row-only writes
-- ════════════════════════════════════════════════════════════════════
grant select, insert, update, delete on public.visits to authenticated;

create policy "visits_auth_select" on public.visits
  for select to authenticated using (true);

create policy "visits_auth_insert" on public.visits
  for insert to authenticated with check (user_id = auth.uid());

create policy "visits_auth_update" on public.visits
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "visits_auth_delete" on public.visits
  for delete to authenticated using (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════════
-- SIDES
-- ════════════════════════════════════════════════════════════════════
grant select, insert, update, delete on public.sides to authenticated;

create policy "sides_auth_select" on public.sides
  for select to authenticated using (true);

create policy "sides_auth_insert" on public.sides
  for insert to authenticated
  with check (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

create policy "sides_auth_update" on public.sides
  for update to authenticated
  using (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

create policy "sides_auth_delete" on public.sides
  for delete to authenticated
  using (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

-- ════════════════════════════════════════════════════════════════════
-- SAUCES
-- ════════════════════════════════════════════════════════════════════
grant select, insert, update, delete on public.sauces to authenticated;

create policy "sauces_auth_select" on public.sauces
  for select to authenticated using (true);

create policy "sauces_auth_insert" on public.sauces
  for insert to authenticated
  with check (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

create policy "sauces_auth_update" on public.sauces
  for update to authenticated
  using (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

create policy "sauces_auth_delete" on public.sauces
  for delete to authenticated
  using (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

-- ════════════════════════════════════════════════════════════════════
-- PHOTOS
-- ════════════════════════════════════════════════════════════════════
grant select, insert, update, delete on public.photos to authenticated;

create policy "photos_auth_select" on public.photos
  for select to authenticated using (true);

create policy "photos_auth_insert" on public.photos
  for insert to authenticated
  with check (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

create policy "photos_auth_update" on public.photos
  for update to authenticated
  using (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );

create policy "photos_auth_delete" on public.photos
  for delete to authenticated
  using (
    exists (select 1 from public.visits where id = visit_id and user_id = auth.uid())
  );
