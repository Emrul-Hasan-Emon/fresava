-- Fresh-development schema. Existing installations require the documented mapping rehearsal.
create extension if not exists pgcrypto;

create table public.staff_members(
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid not null unique references auth.users(id) on delete restrict,
 role text not null check(role in('admin','staff')),
 employee_code text unique,
 full_name text not null,
 phone text not null default '',
 avatar_path text,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 check((role='staff' and employee_code is not null) or role='admin')
);
create table public.customers(id uuid primary key default gen_random_uuid(),auth_user_id uuid not null unique references auth.users(id) on delete restrict,full_name text not null,phone text not null default '',address text not null default '',city text not null default '',avatar_path text,active boolean not null default true,created_at timestamptz not null default now());

create function public.ensure_one_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from auth.users where id=new.auth_user_id for update;
 if exists(select 1 from public.staff_members where auth_user_id=new.auth_user_id and (tg_table_name<>'staff_members' or id<>new.id)) or exists(select 1 from public.customers where auth_user_id=new.auth_user_id and (tg_table_name<>'customers' or id<>new.id)) then raise exception 'Identity already assigned';end if;
 return new;
end $$;
create trigger staff_members_identity before insert or update on public.staff_members for each row execute function public.ensure_one_account();
create trigger customers_identity before insert or update on public.customers for each row execute function public.ensure_one_account();

-- app_metadata is writable only through trusted Auth admin operations, not signup metadata.
create function public.provision_identity() returns trigger language plpgsql security definer set search_path='' as $$
declare kind text:=coalesce(new.raw_app_meta_data->>'account_type','customer'); staff_role text:=new.raw_app_meta_data->>'role'; name text:=left(coalesce(new.raw_user_meta_data->>'full_name',''),120);
begin
 if kind='staff_member' then
  if staff_role not in('admin','staff') then raise exception 'Invalid staff role';end if;
  insert into public.staff_members(auth_user_id,role,full_name,employee_code) values(new.id,staff_role,name,case when staff_role='staff' then coalesce(new.raw_app_meta_data->>'employee_code',new.id::text) else null end);
 elsif kind='customer' then insert into public.customers(auth_user_id,full_name) values(new.id,name);
 else raise exception 'Invalid account type';end if;return new;
end $$;
create trigger fresava_identity after insert on auth.users for each row execute function public.provision_identity();

create function public.custom_access_token_hook(event jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare claims jsonb:=event->'claims'; entity uuid; account_kind text; staff_role text;
begin
 select id,'staff_member',role into entity,account_kind,staff_role from public.staff_members where auth_user_id=(event->>'user_id')::uuid and active;
 if entity is null then select id,'customer',null into entity,account_kind,staff_role from public.customers where auth_user_id=(event->>'user_id')::uuid and active;end if;
 if entity is null then raise exception 'Account is inactive or missing';end if;
 claims:=jsonb_set(jsonb_set(claims,'{account_type}',to_jsonb(account_kind)),'{entity_id}',to_jsonb(entity::text));
 if staff_role is not null then claims:=jsonb_set(claims,'{role}',to_jsonb(staff_role));end if;
 return jsonb_set(event,'{claims}',claims);
end $$;

create table public.revoked_auth_sessions(session_id uuid primary key,auth_user_id uuid not null references auth.users(id),revoked_at timestamptz not null default now(),expires_at timestamptz not null);
create table public.products(id uuid primary key default gen_random_uuid(),sku text unique not null,name text not null,blurb text not null default '',jars integer not null check(jars>0),jar_weight_g integer not null check(jar_weight_g>0),price integer not null check(price>=0),compare_at integer check(compare_at>=price),badge text,image_path text not null default '/images/jar-hero.png',active boolean not null default true);
create table public.shipping_zones(code text primary key,label text not null,fee integer not null check(fee>=0),free_threshold integer not null check(free_threshold>=0),eta text not null,active boolean not null default true);
create table public.promotions(code text primary key check(code=upper(code)),basis_points integer not null check(basis_points between 1 and 10000),cap integer not null check(cap>=0),minimum integer not null default 0 check(minimum>=0),active boolean not null default true,starts_at timestamptz,ends_at timestamptz);
create table public.guest_sessions(id uuid primary key default gen_random_uuid(),token_hash text not null unique,expires_at timestamptz not null,revoked_at timestamptz,created_at timestamptz not null default now());
create sequence public.order_number_sequence;
create table public.orders(
 id uuid primary key default gen_random_uuid(),order_number text unique not null default ('FRV'||lpad(nextval('public.order_number_sequence')::text,8,'0')),tracking_code text unique not null default ('FRT'||upper(encode(gen_random_bytes(8),'hex'))),
 customer_id uuid references public.customers(id),guest_session_id uuid references public.guest_sessions(id),customer_name text not null,phone text not null,email text,address text not null,city text not null,notes text,
 zone text not null references public.shipping_zones(code),eta text not null,currency text not null default 'BDT' check(currency='BDT'),subtotal integer not null check(subtotal>=0),discount integer not null check(discount>=0 and discount<=subtotal),shipping integer not null check(shipping>=0),total integer not null check(total=subtotal-discount+shipping),promo text,
 payment_method text not null default 'cod' check(payment_method='cod'),payment_status text not null default 'unpaid' check(payment_status in ('unpaid','collected')),
 status text not null default 'order_confirmed' check(status in ('order_confirmed','ready_for_packing','packing','quality_check','ready_for_dispatch','handed_to_delivery','out_for_delivery','delivered')),version integer not null default 0 check(version>=0),
 idempotency_key uuid not null,request_hash text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(num_nonnulls(customer_id,guest_session_id)=1)
);
create unique index orders_idempotency on public.orders(coalesce(customer_id,guest_session_id),idempotency_key);
create index orders_customer on public.orders(customer_id,created_at desc);
create index orders_guest on public.orders(guest_session_id,created_at desc);
create index orders_status on public.orders(status,created_at desc);
create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),product_id uuid not null references public.products(id),sku text not null,product_name text not null,jars integer not null check(jars>0),jar_weight_g integer not null check(jar_weight_g>0),quantity integer not null check(quantity between 1 and 99),unit_price integer not null check(unit_price>=0),subtotal integer not null check(subtotal=unit_price*quantity));
create index order_items_order on public.order_items(order_id);
create table public.order_status_history(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),from_status text,to_status text not null,version integer not null,staff_member_id uuid references public.staff_members(id),source text not null check(source in('admin','staff','system')),reason text,created_at timestamptz not null default now(),unique(order_id,version),check((source='system' and staff_member_id is null) or (source in('admin','staff') and staff_member_id is not null)));
create index order_history_order on public.order_status_history(order_id,created_at);
create table public.fulfillment_requests(request_id uuid primary key,order_id uuid not null references public.orders(id),staff_member_id uuid not null references public.staff_members(id),expected_version integer not null,result_version integer not null,result_status text not null,created_at timestamptz not null default now());
create table public.order_feedback(id uuid primary key default gen_random_uuid(),order_id uuid not null unique references public.orders(id),rating integer not null check(rating between 1 and 5),feedback text not null check(length(trim(feedback)) between 1 and 500),created_at timestamptz not null default now());
create index feedback_created on public.order_feedback(created_at desc);
create table public.audit_log(id uuid primary key default gen_random_uuid(),actor_type text not null check(actor_type in('admin','staff','customer','system')),staff_member_id uuid references public.staff_members(id),customer_id uuid references public.customers(id),action text not null,entity_id uuid,details jsonb not null default '{}',created_at timestamptz not null default now(),check((actor_type='system' and num_nonnulls(staff_member_id,customer_id)=0) or (actor_type in('admin','staff') and staff_member_id is not null and customer_id is null) or (actor_type='customer' and customer_id is not null and staff_member_id is null)));
create table public.rate_limits(key text primary key,count integer not null,window_start timestamptz not null);
create function public.consume_rate_limit(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare result integer;
begin
 insert into public.rate_limits as r values(p_key,1,now()) on conflict(key) do update set count=case when r.window_start<now()-make_interval(secs=>p_seconds) then 1 else r.count+1 end,window_start=case when r.window_start<now()-make_interval(secs=>p_seconds) then now() else r.window_start end returning count into result;
 return result<=p_limit;
end $$;

-- No browser table access: HTTP backend is the authority, including revocation checks.
do $$ declare t text;begin
 foreach t in array array['staff_members','customers','revoked_auth_sessions','products','shipping_zones','promotions','guest_sessions','orders','order_items','order_status_history','fulfillment_requests','order_feedback','audit_log','rate_limits'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant usage,select on sequence public.order_number_sequence to service_role;
revoke execute on function public.ensure_one_account(),public.provision_identity(),public.custom_access_token_hook(jsonb),public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
-- Storage is proxied through the backend; no public upload/read policy is created.
