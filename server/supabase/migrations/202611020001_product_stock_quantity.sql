-- Adds finished-goods stock quantity to products, matching the read-only
-- stock column the reference admin catalog displayed per product.
alter table public.products add column if not exists stock_quantity integer not null default 0 check(stock_quantity>=0);
