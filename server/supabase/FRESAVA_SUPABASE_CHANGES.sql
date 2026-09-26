-- FRESAVA centralized Supabase schema changes
-- Version: 2026-09-26-order-reset-uuid-schema
--
-- Purpose:
--   Run this file manually in Supabase when app/database changes are needed.
--
-- Existing-data policy:
--   - Customer, staff, auth/session, catalog, shipping, promotion, avatar, and rate-limit data are preserved.
--   - Order workflow tables are intentionally dropped and recreated because the remote orders table was legacy-shaped.
--   - This deletes existing order, order item, order status history, fulfillment request, and feedback data.
--   - Seed rows use ON CONFLICT DO NOTHING so existing catalog/settings rows are preserved.
--   - Functions are CREATE OR REPLACE because app behavior must match the deployed code.
--   - Non-order tables, columns, indexes, triggers, storage bucket, grants, and RLS are created/enabled if missing.
--   - Fresh order workflow tables use the UUID schema expected by the current app.
--
-- Important:
--   This file intentionally resets order data. It can still fail on a database whose existing
--   non-order schema conflicts with these definitions. If it fails, stop and inspect the reported object.
begin;

create extension if not exists pgcrypto;

-- Helper used by this migration only. It prevents legacy duplicate data from
-- aborting the whole schema run while still creating unique indexes when safe.
create or replace procedure pg_temp.fresava_create_unique_index_if_clean(
  p_index_name text,
  p_duplicate_check_sql text,
  p_create_index_sql text
) language plpgsql as $$
declare duplicate_count bigint;
begin
  if exists(select 1 from pg_class where relkind='i' and relname=p_index_name) then
    return;
  end if;
  execute p_duplicate_check_sql into duplicate_count;
  if coalesce(duplicate_count,0)>0 then
    raise notice 'Skipping index % because existing duplicate data was found. Clean the duplicates, then rerun this file.', p_index_name;
    return;
  end if;
  execute p_create_index_sql;
end $$;

create table if not exists public.staff_members(
 id uuid primary key default gen_random_uuid()
);
alter table public.staff_members add column if not exists id uuid default gen_random_uuid();
alter table public.staff_members add column if not exists auth_user_id uuid;
alter table public.staff_members add column if not exists role text;
alter table public.staff_members add column if not exists employee_code text;
alter table public.staff_members add column if not exists full_name text;
alter table public.staff_members add column if not exists phone text not null default '';
alter table public.staff_members add column if not exists avatar_path text;
alter table public.staff_members add column if not exists active boolean not null default true;
alter table public.staff_members add column if not exists created_at timestamptz not null default now();
call pg_temp.fresava_create_unique_index_if_clean('staff_members_auth_user_id_unique','select count(*) from (select auth_user_id from public.staff_members where auth_user_id is not null group by auth_user_id having count(*)>1) d','create unique index staff_members_auth_user_id_unique on public.staff_members(auth_user_id) where auth_user_id is not null');
call pg_temp.fresava_create_unique_index_if_clean('staff_members_employee_code_unique','select count(*) from (select employee_code from public.staff_members where employee_code is not null group by employee_code having count(*)>1) d','create unique index staff_members_employee_code_unique on public.staff_members(employee_code) where employee_code is not null');
do $$ begin
 if not exists(select 1 from pg_constraint where conname='staff_members_role_check' and conrelid='public.staff_members'::regclass) then
  if exists(select 1 from public.staff_members where role is not null and role not in('admin','staff')) then
   raise notice 'Skipping constraint staff_members_role_check because existing rows contain non-admin/staff roles.';
  else
   alter table public.staff_members add constraint staff_members_role_check check(role in('admin','staff'));
  end if;
 end if;
 if not exists(select 1 from pg_constraint where conname='staff_members_staff_employee_code_check' and conrelid='public.staff_members'::regclass) then
  if exists(select 1 from public.staff_members where (role is not null and role not in('admin','staff')) or (role='staff' and employee_code is null)) then
   raise notice 'Skipping constraint staff_members_staff_employee_code_check because existing rows have invalid roles or staff rows without employee_code.';
  else
   alter table public.staff_members add constraint staff_members_staff_employee_code_check check((role='staff' and employee_code is not null) or role='admin' or role is null);
  end if;
 end if;
end $$;

create table if not exists public.customers(
 id uuid primary key default gen_random_uuid()
);
alter table public.customers add column if not exists id uuid default gen_random_uuid();
alter table public.customers add column if not exists auth_user_id uuid;
alter table public.customers add column if not exists full_name text;
alter table public.customers add column if not exists phone text not null default '';
alter table public.customers add column if not exists address text not null default '';
alter table public.customers add column if not exists city text not null default '';
alter table public.customers add column if not exists avatar_path text;
alter table public.customers add column if not exists active boolean not null default true;
alter table public.customers add column if not exists created_at timestamptz not null default now();
call pg_temp.fresava_create_unique_index_if_clean('customers_auth_user_id_unique','select count(*) from (select auth_user_id from public.customers where auth_user_id is not null group by auth_user_id having count(*)>1) d','create unique index customers_auth_user_id_unique on public.customers(auth_user_id) where auth_user_id is not null');

create table if not exists public.revoked_auth_sessions();
alter table public.revoked_auth_sessions add column if not exists session_id uuid;
alter table public.revoked_auth_sessions add column if not exists auth_user_id uuid;
alter table public.revoked_auth_sessions add column if not exists revoked_at timestamptz not null default now();
alter table public.revoked_auth_sessions add column if not exists expires_at timestamptz;
call pg_temp.fresava_create_unique_index_if_clean('revoked_auth_sessions_session_id_unique','select count(*) from (select session_id from public.revoked_auth_sessions where session_id is not null group by session_id having count(*)>1) d','create unique index revoked_auth_sessions_session_id_unique on public.revoked_auth_sessions(session_id) where session_id is not null');

create table if not exists public.products(
 id uuid primary key default gen_random_uuid()
);
alter table public.products add column if not exists id uuid default gen_random_uuid();
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists name text;
alter table public.products add column if not exists blurb text not null default '';
alter table public.products add column if not exists jars integer;
alter table public.products add column if not exists jar_weight_g integer;
alter table public.products add column if not exists price integer;
alter table public.products add column if not exists compare_at integer;
alter table public.products add column if not exists badge text;
alter table public.products add column if not exists image_path text not null default '/images/jar-hero.png';
alter table public.products add column if not exists active boolean not null default true;
call pg_temp.fresava_create_unique_index_if_clean('products_sku_unique','select count(*) from (select sku from public.products where sku is not null group by sku having count(*)>1) d','create unique index products_sku_unique on public.products(sku) where sku is not null');

create table if not exists public.shipping_zones(
 code text primary key
);
alter table public.shipping_zones add column if not exists code text;
alter table public.shipping_zones add column if not exists label text;
alter table public.shipping_zones add column if not exists fee integer;
alter table public.shipping_zones add column if not exists free_threshold integer;
alter table public.shipping_zones add column if not exists eta text;
alter table public.shipping_zones add column if not exists active boolean not null default true;

create table if not exists public.promotions(
 code text primary key
);
alter table public.promotions add column if not exists code text;
alter table public.promotions add column if not exists basis_points integer;
alter table public.promotions add column if not exists cap integer;
alter table public.promotions add column if not exists minimum integer not null default 0;
alter table public.promotions add column if not exists active boolean not null default true;
alter table public.promotions add column if not exists starts_at timestamptz;
alter table public.promotions add column if not exists ends_at timestamptz;

create table if not exists public.guest_sessions(
 id uuid primary key default gen_random_uuid()
);
alter table public.guest_sessions add column if not exists id uuid default gen_random_uuid();
alter table public.guest_sessions add column if not exists token_hash text;
alter table public.guest_sessions add column if not exists expires_at timestamptz;
alter table public.guest_sessions add column if not exists revoked_at timestamptz;
alter table public.guest_sessions add column if not exists created_at timestamptz not null default now();
call pg_temp.fresava_create_unique_index_if_clean('guest_sessions_token_hash_unique','select count(*) from (select token_hash from public.guest_sessions where token_hash is not null group by token_hash having count(*)>1) d','create unique index guest_sessions_token_hash_unique on public.guest_sessions(token_hash) where token_hash is not null');

-- Order workflow reset: authorized by owner on 2026-09-26.
-- This is the only destructive section in this central schema file.
drop table if exists public.order_feedback cascade;
drop table if exists public.fulfillment_requests cascade;
drop table if exists public.order_status_history cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop sequence if exists public.order_number_sequence cascade;
create sequence public.order_number_sequence;

create table public.orders(
 id uuid primary key default gen_random_uuid(),
 order_number text not null default ('FRV'||lpad(nextval('public.order_number_sequence')::text,8,'0')),
 tracking_code text not null default ('FRT'||upper(encode(gen_random_bytes(8),'hex'))),
 customer_id uuid,
 guest_session_id uuid,
 customer_name text not null,
 phone text not null,
 email text,
 address text not null,
 city text not null,
 notes text,
 zone text not null,
 eta text not null,
 currency text not null default 'BDT',
 subtotal integer not null check(subtotal>=0),
 discount integer not null default 0 check(discount>=0),
 shipping integer not null default 0 check(shipping>=0),
 total integer not null check(total=subtotal-discount+shipping and total>=0),
 promo text,
 payment_method text not null default 'cod' check(payment_method='cod'),
 payment_status text not null default 'unpaid' check(payment_status in('unpaid','collected')),
 status text not null default 'order_confirmed' check(status in('order_confirmed','ready_for_packing','packing','quality_check','ready_for_dispatch','handed_to_delivery','out_for_delivery','delivered')),
 version integer not null default 0 check(version>=0),
 idempotency_key uuid not null,
 request_hash text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(num_nonnulls(customer_id,guest_session_id)=1)
);
create unique index orders_order_number_unique on public.orders(order_number);
create unique index orders_tracking_code_unique on public.orders(tracking_code);
create unique index orders_idempotency on public.orders(coalesce(customer_id,guest_session_id),idempotency_key);
create index orders_customer on public.orders(customer_id,created_at desc);
create index orders_guest on public.orders(guest_session_id,created_at desc);
create index orders_status on public.orders(status,created_at desc);

create table public.order_items(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid,
 sku text not null,
 product_name text not null,
 jars integer not null check(jars>0),
 jar_weight_g integer not null check(jar_weight_g>0),
 quantity integer not null check(quantity between 1 and 99),
 unit_price integer not null check(unit_price>=0),
 subtotal integer not null check(subtotal=unit_price*quantity)
);
create index order_items_order on public.order_items(order_id);

create table public.order_status_history(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 from_status text,
 to_status text not null,
 version integer not null,
 staff_member_id uuid,
 source text not null check(source in('admin','staff','system')),
 reason text,
 created_at timestamptz not null default now(),
 unique(order_id,version),
 check((source='system' and staff_member_id is null) or (source in('admin','staff') and staff_member_id is not null))
);
create index order_history_order on public.order_status_history(order_id,created_at);

create table public.fulfillment_requests(
 request_id uuid primary key,
 order_id uuid not null references public.orders(id) on delete cascade,
 staff_member_id uuid not null,
 expected_version integer not null,
 result_version integer not null,
 result_status text not null,
 created_at timestamptz not null default now()
);

create table public.order_feedback(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null unique references public.orders(id) on delete cascade,
 rating integer not null check(rating between 1 and 5),
 feedback text not null check(length(trim(feedback)) between 1 and 500),
 created_at timestamptz not null default now()
);
create index feedback_created on public.order_feedback(created_at desc);
create table if not exists public.audit_log(
 id uuid primary key default gen_random_uuid()
);
alter table public.audit_log add column if not exists id uuid default gen_random_uuid();
alter table public.audit_log add column if not exists actor_type text;
alter table public.audit_log add column if not exists staff_member_id uuid;
alter table public.audit_log add column if not exists customer_id uuid;
alter table public.audit_log add column if not exists action text;
alter table public.audit_log add column if not exists entity_id uuid;
alter table public.audit_log add column if not exists details jsonb not null default '{}';
alter table public.audit_log add column if not exists created_at timestamptz not null default now();

create table if not exists public.rate_limits(
 key text primary key,
 count integer not null,
 window_start timestamptz not null
);
alter table public.rate_limits add column if not exists key text;
alter table public.rate_limits add column if not exists count integer not null default 0;
alter table public.rate_limits add column if not exists window_start timestamptz not null default now();

create or replace function public.ensure_one_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from auth.users where id=new.auth_user_id for update;
 if exists(select 1 from public.staff_members where auth_user_id=new.auth_user_id and (tg_table_name<>'staff_members' or id<>new.id)) or exists(select 1 from public.customers where auth_user_id=new.auth_user_id and (tg_table_name<>'customers' or id<>new.id)) then raise exception 'Identity already assigned';end if;
 return new;
end $$;

do $$ begin
 if not exists(select 1 from pg_trigger where tgname='staff_members_identity' and tgrelid='public.staff_members'::regclass) then
  create trigger staff_members_identity before insert or update on public.staff_members for each row execute function public.ensure_one_account();
 end if;
 if not exists(select 1 from pg_trigger where tgname='customers_identity' and tgrelid='public.customers'::regclass) then
  create trigger customers_identity before insert or update on public.customers for each row execute function public.ensure_one_account();
 end if;
end $$;

create or replace function public.provision_identity() returns trigger language plpgsql security definer set search_path='' as $$
declare kind text:=coalesce(new.raw_app_meta_data->>'account_type','customer'); staff_role text:=new.raw_app_meta_data->>'role'; name text:=left(coalesce(new.raw_user_meta_data->>'full_name',''),120);
begin
 if kind='staff_member' then
  if staff_role is null or staff_role not in('admin','staff') then raise exception 'Invalid staff role';end if;
  insert into public.staff_members(auth_user_id,role,full_name,employee_code)
  values(new.id,staff_role,nullif(name,''),case when staff_role='staff' then coalesce(new.raw_app_meta_data->>'employee_code',new.id::text) else null end)
  on conflict do nothing;
 elsif kind='customer' then
  insert into public.customers(auth_user_id,full_name) values(new.id,nullif(name,'')) on conflict do nothing;
 else raise exception 'Invalid account type';end if;return new;
end $$;

do $$ begin
 if not exists(select 1 from pg_trigger where tgname='fresava_identity' and tgrelid='auth.users'::regclass) then
  create trigger fresava_identity after insert on auth.users for each row execute function public.provision_identity();
 end if;
end $$;

create or replace function public.custom_access_token_hook(event jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare claims jsonb:=coalesce(event->'claims','{}'::jsonb); entity uuid; account_kind text; staff_role text;
begin
 select id,'staff_member',role into entity,account_kind,staff_role from public.staff_members where auth_user_id=(event->>'user_id')::uuid and active;
 if entity is null then select id,'customer',null into entity,account_kind,staff_role from public.customers where auth_user_id=(event->>'user_id')::uuid and active;end if;
 if entity is null then raise exception 'Account is inactive or missing';end if;
 claims:=jsonb_set(jsonb_set(claims,'{account_type}',to_jsonb(account_kind)),'{entity_id}',to_jsonb(entity::text));
 if staff_role is not null then claims:=jsonb_set(claims,'{role}',to_jsonb(staff_role));end if;
 return jsonb_set(event,'{claims}',claims);
end $$;

create or replace function public.consume_rate_limit(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare result integer;
begin
 insert into public.rate_limits as r values(p_key,1,now()) on conflict(key) do update set count=case when r.window_start<now()-make_interval(secs=>p_seconds) then 1 else r.count+1 end,window_start=case when r.window_start<now()-make_interval(secs=>p_seconds) then now() else r.window_start end returning count into result;
 return result<=p_limit;
end $$;

create or replace function public.quote_order(p_quote jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare line jsonb; p public.products; z public.shipping_zones; promo public.promotions; qty integer; sub integer:=0; disc integer:=0; ship integer; items jsonb:='[]'; seen text[]:='{}'; promo_code text:=upper(trim(coalesce(p_quote->>'promo','')));
begin
 if jsonb_typeof(p_quote->'lines')<>'array' or jsonb_array_length(p_quote->'lines') not between 1 and 20 then raise exception 'Invalid cart';end if;
 for line in select value from jsonb_array_elements(p_quote->'lines') loop
 if (line->>'quantity') !~ '^[0-9]+$' then raise exception 'Invalid cart';end if;
 qty:=(line->>'quantity')::integer;
 if qty not between 1 and 99 or line->>'sku'=any(seen) then raise exception 'Invalid cart';end if;
 seen:=array_append(seen,line->>'sku');
 select * into p from public.products where sku=line->>'sku' and active for share;
 if not found then raise exception 'Product unavailable';end if;
 sub:=sub+p.price*qty;
 items:=items||jsonb_build_array(jsonb_build_object('product_id',p.id,'sku',p.sku,'name',p.name,'quantity',qty,'unit_price',p.price,'subtotal',p.price*qty,'jars',p.jars,'jar_weight_g',p.jar_weight_g));
 end loop;
 select * into z from public.shipping_zones where code=p_quote->>'zone' and active for share;if not found then raise exception 'Invalid zone';end if;
 if promo_code<>'' then
 select * into promo from public.promotions where promotions.code=promo_code and active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()) for share;
 if not found or sub<promo.minimum then raise exception 'Invalid promo';end if;
 disc:=least(round(sub::numeric*promo.basis_points/10000)::integer,promo.cap);
 end if;
 ship:=case when sub-disc>=z.free_threshold then 0 else z.fee end;
 return jsonb_build_object('subtotal',sub,'discount',disc,'shipping',ship,'total',sub-disc+ship,'eta',z.eta,'currency','BDT','lines',items);
end $$;

create or replace function public.place_order(p_customer uuid,p_guest uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare q jsonb; existing public.orders; created public.orders; line jsonb; owner uuid:=coalesce(p_customer,p_guest); key uuid:=(p_input->>'idempotency_key')::uuid; hash text:=md5(p_input::text); c jsonb:=p_input->'customer';
begin
 if num_nonnulls(p_customer,p_guest)<>1 then raise exception 'Not authorized';end if;
 if p_customer is not null and not exists(select 1 from public.customers where id=p_customer and active) then raise exception 'Not authorized';end if;
 if p_guest is not null and not exists(select 1 from public.guest_sessions where id=p_guest and revoked_at is null and expires_at>now()) then raise exception 'Not authorized';end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text||key::text,0));
 select * into existing from public.orders where coalesce(customer_id,guest_session_id)=owner and idempotency_key=key;
 if found then if existing.request_hash<>hash then raise exception 'Idempotency key conflict';end if;return to_jsonb(existing);end if;
 if length(trim(c->>'name')) not between 1 and 120 or length(trim(c->>'address')) not between 1 and 400 or length(trim(c->>'city')) not between 1 and 100 or (c->>'phone') !~ '^\+?[0-9 -]{8,20}$' then raise exception 'Invalid cart';end if;
 q:=public.quote_order(p_input->'quote');
 insert into public.orders(customer_id,guest_session_id,customer_name,phone,email,address,city,notes,zone,eta,subtotal,discount,shipping,total,promo,idempotency_key,request_hash)
 values(p_customer,p_guest,c->>'name',c->>'phone',nullif(c->>'email',''),c->>'address',c->>'city',c->>'notes',p_input->'quote'->>'zone',q->>'eta',(q->>'subtotal')::integer,(q->>'discount')::integer,(q->>'shipping')::integer,(q->>'total')::integer,upper(p_input->'quote'->>'promo'),key,hash) returning * into created;
 for line in select value from jsonb_array_elements(q->'lines') loop
 insert into public.order_items(order_id,product_id,sku,product_name,jars,jar_weight_g,quantity,unit_price,subtotal) values(created.id,(line->>'product_id')::uuid,line->>'sku',line->>'name',(line->>'jars')::integer,(line->>'jar_weight_g')::integer,(line->>'quantity')::integer,(line->>'unit_price')::integer,(line->>'subtotal')::integer);
 end loop;
 insert into public.order_status_history(order_id,to_status,version,source) values(created.id,'order_confirmed',0,'system');
 return to_jsonb(created);
end $$;

create or replace function public.advance_order(p_order uuid,p_staff uuid,p_version integer,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders; previous public.fulfillment_requests; steps text[]:=array['order_confirmed','ready_for_packing','packing','quality_check','ready_for_dispatch','handed_to_delivery','out_for_delivery','delivered']; next_status text;
begin
 if not exists(select 1 from public.staff_members where id=p_staff and role='staff' and active) then raise exception 'Not authorized';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request::text,1));
 select * into previous from public.fulfillment_requests where request_id=p_request;
 if found then
 if previous.order_id<>p_order or previous.staff_member_id<>p_staff or previous.expected_version<>p_version then raise exception 'Idempotency key conflict';end if;
 return jsonb_build_object('status',previous.result_status,'version',previous.result_version);
 end if;
 select * into o from public.orders where id=p_order for update;if not found then raise exception 'Order not found';end if;
 if o.version<>p_version then raise exception 'Order changed; scan again';end if;
 if o.status='delivered' then raise exception 'Order already delivered';end if;
 if array_position(steps,o.status) is null then raise exception 'Invalid order status';end if;
 next_status:=steps[array_position(steps,o.status)+1];
 update public.orders set status=next_status,version=version+1,updated_at=now() where id=p_order;
 insert into public.order_status_history(order_id,from_status,to_status,version,staff_member_id,source) values(p_order,o.status,next_status,p_version+1,p_staff,'staff');
 insert into public.fulfillment_requests(request_id,order_id,staff_member_id,expected_version,result_version,result_status) values(p_request,p_order,p_staff,p_version,p_version+1,next_status);
 insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details) values('staff',p_staff,'order.advanced',p_order,jsonb_build_object('from',o.status,'to',next_status));
 return jsonb_build_object('status',next_status,'version',p_version+1);
end $$;

create or replace function public.submit_feedback(p_order uuid,p_customer uuid,p_guest uuid,p_rating integer,p_feedback text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;
begin
 select * into o from public.orders where id=p_order for update;
 if not found or not ((p_customer is not null and o.customer_id=p_customer and exists(select 1 from public.customers where id=p_customer and active)) or (p_guest is not null and o.guest_session_id=p_guest and exists(select 1 from public.guest_sessions where id=p_guest and expires_at>now() and revoked_at is null))) then raise exception 'Not authorized';end if;
 if o.status<>'delivered' then raise exception 'Feedback requires delivery';end if;
 if p_rating not between 1 and 5 or length(trim(coalesce(p_feedback,''))) not between 1 and 500 then raise exception 'Invalid feedback';end if;
 if exists(select 1 from public.order_feedback where order_id=p_order) then raise exception 'Feedback already submitted';end if;
 insert into public.order_feedback(order_id,rating,feedback) values(p_order,p_rating,trim(p_feedback));
end $$;

create or replace function public.collect_payment(p_order uuid,p_admin uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then raise exception 'Not authorized';end if;
 perform 1 from public.orders where id=p_order for update;if not found then raise exception 'Order not found';end if;
 update public.orders set payment_status='collected',updated_at=now() where id=p_order and payment_status='unpaid';
 if found then insert into public.audit_log(actor_type,staff_member_id,action,entity_id) values('admin',p_admin,'payment.collected',p_order);end if;
end $$;

create or replace function public.dashboard() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('order_count',count(*),'placed_value',coalesce(sum(total),0),'collected_revenue',coalesce(sum(total) filter(where payment_status='collected'),0),'pending',count(*) filter(where status<>'delivered'),'delivered',count(*) filter(where status='delivered'),'customers',count(distinct phone),
 'months',(select coalesce(jsonb_agg(x order by x.month),'[]') from (select to_char(m,'YYYY-MM') as month,coalesce(sum(o.total),0) value from generate_series(date_trunc('month',now())-interval '5 months',date_trunc('month',now()),interval '1 month') m left join public.orders o on date_trunc('month',o.created_at)=m group by m) x),
 'top_products',(select coalesce(jsonb_agg(x),'[]') from (select product_name name,sum(quantity) quantity,sum(subtotal) sales from public.order_items group by product_name order by sum(quantity) desc limit 4) x)) from public.orders;
$$;

do $$ declare t text;begin
 foreach t in array array['staff_members','customers','revoked_auth_sessions','products','shipping_zones','promotions','guest_sessions','orders','order_items','order_status_history','fulfillment_requests','order_feedback','audit_log','rate_limits'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;

do $$
begin
 if exists(select 1 from pg_roles where rolname='service_role') then
  grant usage,select on sequence public.order_number_sequence to service_role;
  grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
  grant execute on function public.quote_order(jsonb),public.place_order(uuid,uuid,jsonb),public.advance_order(uuid,uuid,integer,uuid),public.submit_feedback(uuid,uuid,uuid,integer,text),public.collect_payment(uuid,uuid),public.dashboard() to service_role;
 end if;
 if exists(select 1 from pg_roles where rolname='anon') and exists(select 1 from pg_roles where rolname='authenticated') then
  revoke execute on function public.ensure_one_account(),public.provision_identity(),public.custom_access_token_hook(jsonb),public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
  revoke execute on function public.quote_order(jsonb),public.place_order(uuid,uuid,jsonb),public.advance_order(uuid,uuid,integer,uuid),public.submit_feedback(uuid,uuid,uuid,integer,text),public.collect_payment(uuid,uuid),public.dashboard() from public,anon,authenticated;
 else
  revoke execute on function public.ensure_one_account(),public.provision_identity(),public.custom_access_token_hook(jsonb),public.consume_rate_limit(text,integer,integer) from public;
  revoke execute on function public.quote_order(jsonb),public.place_order(uuid,uuid,jsonb),public.advance_order(uuid,uuid,integer,uuid),public.submit_feedback(uuid,uuid,uuid,integer,text),public.collect_payment(uuid,uuid),public.dashboard() from public;
 end if;
 if exists(select 1 from pg_roles where rolname='supabase_auth_admin') then
  grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
 end if;
end $$;

do $$
begin
 if to_regclass('storage.buckets') is null then
  raise notice 'Skipping avatar bucket creation because storage.buckets is not available in this database.';
 else
  insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp'])
  on conflict(id) do nothing;
 end if;
end $$;

with seed_products(sku,name,blurb,jars,jar_weight_g,price,compare_at,badge) as (
 values
  ('single','Signature Jar','Simple mornings, made sweeter with every spoonful.',1,340,49500,null::integer,null::text),
  ('duo','The Pair','Share the sweetness, or keep it all to yourself.',2,340,94000,99000,'Most loved'),
  ('family','Family Box','Breakfast, brunch, dessert, and everything in between.',4,340,179000,198000,'Best value')
)
insert into public.products(sku,name,blurb,jars,jar_weight_g,price,compare_at,badge)
select sku,name,blurb,jars,jar_weight_g,price,compare_at,badge from seed_products sp
where not exists(select 1 from public.products p where p.sku=sp.sku);

with seed_products(sku,name,blurb,jars,jar_weight_g,price,compare_at,badge) as (
 values
  ('single','Signature Jar','Simple mornings, made sweeter with every spoonful.',1,340,49500,null::integer,null::text),
  ('duo','The Pair','Share the sweetness, or keep it all to yourself.',2,340,94000,99000,'Most loved'),
  ('family','Family Box','Breakfast, brunch, dessert, and everything in between.',4,340,179000,198000,'Best value')
)
update public.products p set
 name=coalesce(p.name,sp.name),
 blurb=case when p.blurb is null or p.blurb='' then sp.blurb else p.blurb end,
 jars=coalesce(p.jars,sp.jars),
 jar_weight_g=coalesce(p.jar_weight_g,sp.jar_weight_g),
 price=coalesce(p.price,sp.price),
 compare_at=coalesce(p.compare_at,sp.compare_at),
 badge=coalesce(p.badge,sp.badge),
 image_path=coalesce(nullif(p.image_path,''),'/images/jar-hero.png'),
 active=coalesce(p.active,true)
from seed_products sp where p.sku=sp.sku;

with seed_zones(code,label,fee,free_threshold,eta,active) as (
 values
  ('dhaka','Inside Dhaka',7000,150000,'24-48 hours',true),
  ('outside','Outside Dhaka',13000,150000,'3-5 working days',true)
)
insert into public.shipping_zones(code,label,fee,free_threshold,eta,active)
select code,label,fee,free_threshold,eta,active from seed_zones sz
where not exists(select 1 from public.shipping_zones z where z.code=sz.code);

with seed_zones(code,label,fee,free_threshold,eta,active) as (
 values
  ('dhaka','Inside Dhaka',7000,150000,'24-48 hours',true),
  ('outside','Outside Dhaka',13000,150000,'3-5 working days',true)
)
update public.shipping_zones z set
 label=coalesce(z.label,sz.label),
 fee=coalesce(z.fee,sz.fee),
 free_threshold=coalesce(z.free_threshold,sz.free_threshold),
 eta=coalesce(z.eta,sz.eta),
 active=coalesce(z.active,sz.active)
from seed_zones sz where z.code=sz.code;

with seed_promotions(code,basis_points,cap,minimum,active) as (
 values ('FRESAVA10',1000,25000,0,true)
)
insert into public.promotions(code,basis_points,cap,minimum,active)
select code,basis_points,cap,minimum,active from seed_promotions sp
where not exists(select 1 from public.promotions p where p.code=sp.code);

with seed_promotions(code,basis_points,cap,minimum,active) as (
 values ('FRESAVA10',1000,25000,0,true)
)
update public.promotions p set
 basis_points=coalesce(p.basis_points,sp.basis_points),
 cap=coalesce(p.cap,sp.cap),
 minimum=coalesce(p.minimum,sp.minimum),
 active=coalesce(p.active,sp.active)
from seed_promotions sp where p.code=sp.code;

commit;



