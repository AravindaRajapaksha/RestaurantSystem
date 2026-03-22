alter table public.foods
  add column if not exists offer_title text,
  add column if not exists offer_description text,
  add column if not exists discount_percent numeric(5,2),
  add column if not exists is_featured_offer boolean not null default false;
