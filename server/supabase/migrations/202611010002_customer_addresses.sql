-- Lets a customer save multiple labeled delivery addresses, matching the
-- reference app's Account > Addresses section (current repo only had a
-- single flat address/city pair on the customers row).
create table if not exists public.customer_addresses(
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists customer_addresses_customer on public.customer_addresses(customer_id, created_at desc);
alter table public.customer_addresses enable row level security;
revoke all on public.customer_addresses from anon, authenticated;
grant all on public.customer_addresses to service_role;
