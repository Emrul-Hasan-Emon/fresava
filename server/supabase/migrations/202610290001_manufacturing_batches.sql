-- Adds manufacturing batch tracking: a retail barcode on products (for
-- scanning an existing product) and a production_batches table (for
-- scanning/printing an internal batch barcode when no retail barcode
-- applies yet), plus admin-only RPCs to create and delete batches.
alter table public.products add column if not exists barcode_value text;
create unique index if not exists products_barcode_value_unique
  on public.products(barcode_value) where barcode_value is not null;

create sequence if not exists public.production_batch_sequence;

create table if not exists public.production_batches(
  id uuid primary key default gen_random_uuid(),
  batch_number text unique not null default ('FRB'||lpad(nextval('public.production_batch_sequence')::text,8,'0')),
  barcode_value text unique,
  product_id uuid not null references public.products(id),
  planned_quantity integer not null check(planned_quantity between 1 and 1000000),
  filled_quantity integer not null default 0 check(filled_quantity>=0),
  status text not null default 'planned' check(status in('planned','filled','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists production_batches_product on public.production_batches(product_id, created_at desc);

alter table public.production_batches enable row level security;
revoke all on public.production_batches from anon, authenticated;
grant all on public.production_batches to service_role;

create function public.create_fresava_manufacturing_batch(
  p_admin uuid, p_product_id uuid, p_planned_quantity integer, p_notes text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare created public.production_batches;
begin
  if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then
    raise exception 'Not authorized';
  end if;
  if not exists(select 1 from public.products where id=p_product_id) then
    raise exception 'Product unavailable';
  end if;
  if p_planned_quantity not between 1 and 1000000 then
    raise exception 'Invalid quantity';
  end if;
  insert into public.production_batches(product_id, planned_quantity)
    values(p_product_id, p_planned_quantity)
    returning * into created;
  update public.production_batches set barcode_value=batch_number where id=created.id;
  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'batch.created',created.id,jsonb_build_object('batch_number',created.batch_number,'notes',nullif(trim(coalesce(p_notes,'')),'')));
  return jsonb_build_object('id',created.id,'batch_number',created.batch_number);
end $$;

create function public.delete_fresava_planned_batch(
  p_admin uuid, p_batch_id uuid
) returns void language plpgsql security definer set search_path='' as $$
declare b public.production_batches;
begin
  if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then
    raise exception 'Not authorized';
  end if;
  select * into b from public.production_batches where id=p_batch_id for update;
  if not found then raise exception 'Batch not found'; end if;
  if b.status<>'planned' then raise exception 'Batch already processed'; end if;
  delete from public.production_batches where id=p_batch_id;
  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'batch.deleted',p_batch_id,jsonb_build_object('batch_number',b.batch_number));
end $$;

revoke execute on function public.create_fresava_manufacturing_batch(uuid,uuid,integer,text),public.delete_fresava_planned_batch(uuid,uuid) from public,anon,authenticated;
grant execute on function public.create_fresava_manufacturing_batch(uuid,uuid,integer,text),public.delete_fresava_planned_batch(uuid,uuid) to service_role;
