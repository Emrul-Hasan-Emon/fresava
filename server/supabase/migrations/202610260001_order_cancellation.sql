-- Adds order cancellation: widens the orders.status check constraint to
-- allow 'cancelled' and adds an admin-only cancel_order RPC. Forward
-- fulfillment steps (advance_order) are unaffected — 'cancelled' is a
-- separate terminal state, not part of the forward step sequence.
do $$
declare conname text;
begin
  select pg_constraint.conname into conname
  from pg_constraint
  join pg_class on pg_class.oid = pg_constraint.conrelid
  where pg_class.relname = 'orders'
    and pg_constraint.contype = 'c'
    and pg_get_constraintdef(pg_constraint.oid) like '%order_confirmed%';
  if conname is null then
    raise exception 'Could not locate the orders.status check constraint';
  end if;
  execute format('alter table public.orders drop constraint %I', conname);
end $$;

alter table public.orders add constraint orders_status_check check (
  status in (
    'order_confirmed','ready_for_packing','packing','quality_check',
    'ready_for_dispatch','handed_to_delivery','out_for_delivery','delivered',
    'cancelled'
  )
);

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
 if o.status='cancelled' then raise exception 'Order already cancelled';end if;
 next_status:=steps[array_position(steps,o.status)+1];
 update public.orders set status=next_status,version=version+1,updated_at=now() where id=p_order;
 insert into public.order_status_history(order_id,from_status,to_status,version,staff_member_id,source) values(p_order,o.status,next_status,p_version+1,p_staff,'staff');
 insert into public.fulfillment_requests(request_id,order_id,staff_member_id,expected_version,result_version,result_status) values(p_request,p_order,p_staff,p_version,p_version+1,next_status);
 insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details) values('staff',p_staff,'order.advanced',p_order,jsonb_build_object('from',o.status,'to',next_status));
 return jsonb_build_object('status',next_status,'version',p_version+1);
end $$;

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
