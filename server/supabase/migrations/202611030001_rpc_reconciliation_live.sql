-- The hosted Supabase project was found to already run a newer, independently
-- built backend (full QC/receiving/inventory pipeline) whose admin RPCs use
-- an auth.uid()-based identity check instead of this repo's explicit
-- p_admin/p_staff parameter convention, and under different names/arities
-- for order cancellation and manufacturing batches. Rather than touching any
-- of that already-deployed, in-use logic, this adds new functions/overloads
-- matching exactly what this repo's server code already calls, using the
-- same explicit-identity convention as every other function here
-- (advance_order, collect_payment, place_order, quote_order, submit_feedback
-- already matched the live DB as-is). Purely additive: no existing function,
-- table or constraint is replaced or dropped.

create sequence if not exists public.fresava_batch_number_seq;

create function public.cancel_order(
  p_order uuid, p_admin uuid, p_expected_version integer, p_reason text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;
begin
  if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then
    raise exception 'Not authorized';
  end if;
  if length(trim(p_reason)) not between 1 and 500 then
    raise exception 'Invalid reason';
  end if;
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if o.version<>p_expected_version then raise exception 'Order changed; scan again'; end if;
  if o.status='delivered' then raise exception 'Order already delivered'; end if;
  if o.status='cancelled' then raise exception 'Order already cancelled'; end if;
  update public.orders set status='cancelled', version=version+1, updated_at=now() where id=p_order;
  insert into public.order_status_history(order_id,from_status,to_status,version,staff_member_id,source,reason)
    values(p_order,o.status,'cancelled',p_expected_version+1,p_admin,'admin',trim(p_reason));
  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'order.cancelled',p_order,jsonb_build_object('from',o.status,'reason',trim(p_reason)));
  return jsonb_build_object('status','cancelled','version',p_expected_version+1);
end $$;

revoke execute on function public.cancel_order(uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.cancel_order(uuid,uuid,integer,text) to service_role;

create function public.cancel_order_by_customer(
  p_order uuid, p_customer uuid, p_guest uuid, p_expected_version integer, p_reason text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;
begin
  if num_nonnulls(p_customer,p_guest)<>1 then raise exception 'Not authorized'; end if;
  if length(trim(p_reason)) not between 1 and 500 then raise exception 'Invalid reason'; end if;
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if p_customer is not null and o.customer_id is distinct from p_customer then raise exception 'Not authorized'; end if;
  if p_guest is not null and o.guest_session_id is distinct from p_guest then raise exception 'Not authorized'; end if;
  if o.version<>p_expected_version then raise exception 'Order changed; scan again'; end if;
  if o.status not in ('order_confirmed','ready_for_packing') then raise exception 'Order can no longer be cancelled'; end if;
  update public.orders set status='cancelled', version=version+1, updated_at=now() where id=p_order;
  insert into public.order_status_history(order_id,from_status,to_status,version,source,reason)
    values(p_order,o.status,'cancelled',p_expected_version+1,'system',trim(p_reason));
  if p_customer is not null then
    insert into public.audit_log(actor_type,customer_id,action,entity_id,details)
      values('customer',p_customer,'order.cancelled',p_order,jsonb_build_object('from',o.status,'reason',trim(p_reason)));
  else
    insert into public.audit_log(actor_type,action,entity_id,details)
      values('system','order.cancelled',p_order,jsonb_build_object('from',o.status,'reason',trim(p_reason),'guest_session_id',p_guest));
  end if;
  return jsonb_build_object('status','cancelled','version',p_expected_version+1);
end $$;

revoke execute on function public.cancel_order_by_customer(uuid,uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.cancel_order_by_customer(uuid,uuid,uuid,integer,text) to service_role;

create function public.create_fresava_manufacturing_batch(
  p_admin uuid, p_product_id uuid, p_planned_quantity integer, p_notes text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare created public.production_batches; seq bigint; number text;
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
  seq:=nextval('public.fresava_batch_number_seq');
  number:='FRV-B-'||to_char((now() at time zone 'Asia/Dhaka')::date,'YYYYMMDD')||'-'||lpad(seq::text,6,'0');
  insert into public.production_batches(product_id,batch_number,barcode_value,planned_quantity,filled_quantity,status,notes)
    values(p_product_id,number,number,p_planned_quantity,0,'planned',nullif(trim(coalesce(p_notes,'')),''))
    returning * into created;
  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'batch.created',created.id,jsonb_build_object('batch_number',created.batch_number,'notes',created.notes));
  return jsonb_build_object('id',created.id,'batch_number',created.batch_number);
end $$;

revoke execute on function public.create_fresava_manufacturing_batch(uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.create_fresava_manufacturing_batch(uuid,uuid,integer,text) to service_role;

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

revoke execute on function public.delete_fresava_planned_batch(uuid,uuid) from public,anon,authenticated;
grant execute on function public.delete_fresava_planned_batch(uuid,uuid) to service_role;
