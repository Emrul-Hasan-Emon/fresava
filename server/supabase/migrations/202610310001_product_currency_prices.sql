-- Replaces the flat price_usd/compare_at_usd columns (added for a single
-- extra currency) with a proper per-currency pricing table, now that the
-- business wants USD, GBP, AED, SAR, CAD, AUD, SGD and QAR display pricing.
-- BDT stays on products.price/compare_at — it's still the only checkout
-- currency.
create table if not exists public.product_prices(
  product_id uuid not null references public.products(id) on delete cascade,
  currency text not null check(currency in('USD','GBP','AED','SAR','CAD','AUD','SGD','QAR')),
  price integer not null check(price>=0),
  compare_at integer check(compare_at>=price),
  primary key(product_id, currency)
);
alter table public.product_prices enable row level security;
revoke all on public.product_prices from anon, authenticated;
grant all on public.product_prices to service_role;

insert into public.product_prices(product_id, currency, price, compare_at)
select id, 'USD', price_usd, compare_at_usd from public.products where price_usd is not null
on conflict(product_id, currency) do nothing;

alter table public.products drop column if exists price_usd;
alter table public.products drop column if exists compare_at_usd;
