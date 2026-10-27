-- Adds a real, admin-set USD price per product for the US display market.
-- Nullable: a product with no USD price simply isn't shown/orderable there.
-- Checkout itself stays BDT-only (see Phase 8 plan) — this only feeds display.
alter table public.products add column if not exists price_usd integer check(price_usd>=0);
alter table public.products add column if not exists compare_at_usd integer check(compare_at_usd>=price_usd);
