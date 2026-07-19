-- ────────────────────────────────────────────────────────────────────
-- 004_visit_fields_and_decimal_ratings.sql
-- Apply to the Neon project after 003_neon_schema.sql.
-- Adds sandwich/plate item tracking, total bill cost, a regular-sauce
-- rating, and widens all star-rating columns from integer (1-5) to
-- decimal (0.1-5.0) to support tenth-of-a-star precision.
-- ────────────────────────────────────────────────────────────────────

create type public.visit_item_type as enum ('Sandwich', 'Plate');

alter table public.visits
  add column item_type           public.visit_item_type,
  add column item_name           text,
  add column total_cost          numeric(10,2) check (total_cost >= 0),
  add column regular_sauce_rating numeric(3,1) check (regular_sauce_rating between 0.1 and 5.0);

-- Widen rating columns to decimal (0.1-5.0 in tenths)
alter table public.visits alter column value_rating      type numeric(3,1) using value_rating::numeric(3,1);
alter table public.visits alter column quantity_rating   type numeric(3,1) using quantity_rating::numeric(3,1);
alter table public.visits alter column atmosphere_rating type numeric(3,1) using atmosphere_rating::numeric(3,1);
alter table public.visits alter column staff_rating      type numeric(3,1) using staff_rating::numeric(3,1);
alter table public.visits alter column overall_rating    type numeric(3,1) using overall_rating::numeric(3,1);

alter table public.visits drop constraint if exists visits_value_rating_check;
alter table public.visits drop constraint if exists visits_quantity_rating_check;
alter table public.visits drop constraint if exists visits_atmosphere_rating_check;
alter table public.visits drop constraint if exists visits_staff_rating_check;
alter table public.visits drop constraint if exists visits_overall_rating_check;

alter table public.visits add constraint visits_value_rating_check      check (value_rating      between 0.1 and 5.0);
alter table public.visits add constraint visits_quantity_rating_check   check (quantity_rating   between 0.1 and 5.0);
alter table public.visits add constraint visits_atmosphere_rating_check check (atmosphere_rating between 0.1 and 5.0);
alter table public.visits add constraint visits_staff_rating_check      check (staff_rating      between 0.1 and 5.0);
alter table public.visits add constraint visits_overall_rating_check    check (overall_rating    between 0.1 and 5.0);

alter table public.sides alter column rating type numeric(3,1) using rating::numeric(3,1);
alter table public.sides drop constraint if exists sides_rating_check;
alter table public.sides add constraint sides_rating_check check (rating between 0.1 and 5.0);

alter table public.sauces alter column rating type numeric(3,1) using rating::numeric(3,1);
alter table public.sauces drop constraint if exists sauces_rating_check;
alter table public.sauces add constraint sauces_rating_check check (rating between 0.1 and 5.0);

-- spiciness stays an integer 1-5 chili scale, not a star rating -- unchanged
