-- Adds the descriptive catalog fields the admin Product Catalog needs
-- (category, full description, ingredients, claims). All nullable/optional
-- so existing rows remain valid without a backfill.
alter table public.products add column if not exists category text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists ingredients text[];
alter table public.products add column if not exists claims text[];
