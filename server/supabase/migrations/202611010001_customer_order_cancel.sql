-- Lets a customer (or guest) cancel their own order while it's still early
-- in the fulfillment pipeline, matching the reference app's self-service
-- cancellation window. Separate from admin's cancel_order (which can cancel
-- from any non-terminal status) since this is scoped to the order's owner.
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
