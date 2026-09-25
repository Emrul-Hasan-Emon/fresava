create function public.quote_order(p_quote jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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

create function public.place_order(p_customer uuid,p_guest uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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

create function public.advance_order(p_order uuid,p_staff uuid,p_version integer,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
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
 next_status:=steps[array_position(steps,o.status)+1];
 update public.orders set status=next_status,version=version+1,updated_at=now() where id=p_order;
 insert into public.order_status_history(order_id,from_status,to_status,version,staff_member_id,source) values(p_order,o.status,next_status,p_version+1,p_staff,'staff');
 insert into public.fulfillment_requests(request_id,order_id,staff_member_id,expected_version,result_version,result_status) values(p_request,p_order,p_staff,p_version,p_version+1,next_status);
 insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details) values('staff',p_staff,'order.advanced',p_order,jsonb_build_object('from',o.status,'to',next_status));
 return jsonb_build_object('status',next_status,'version',p_version+1);
end $$;

create function public.submit_feedback(p_order uuid,p_customer uuid,p_guest uuid,p_rating integer,p_feedback text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;
begin
 select * into o from public.orders where id=p_order for update;
 if not found or not ((p_customer is not null and o.customer_id=p_customer and exists(select 1 from public.customers where id=p_customer and active)) or (p_guest is not null and o.guest_session_id=p_guest and exists(select 1 from public.guest_sessions where id=p_guest and expires_at>now() and revoked_at is null))) then raise exception 'Not authorized';end if;
 if o.status<>'delivered' then raise exception 'Feedback requires delivery';end if;
 if exists(select 1 from public.order_feedback where order_id=p_order) then raise exception 'Feedback already submitted';end if;
 insert into public.order_feedback(order_id,rating,feedback) values(p_order,p_rating,trim(p_feedback));
end $$;

create function public.collect_payment(p_order uuid,p_admin uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then raise exception 'Not authorized';end if;
 perform 1 from public.orders where id=p_order for update;if not found then raise exception 'Order not found';end if;
 update public.orders set payment_status='collected',updated_at=now() where id=p_order and payment_status='unpaid';
 if found then insert into public.audit_log(actor_type,staff_member_id,action,entity_id) values('admin',p_admin,'payment.collected',p_order);end if;
end $$;

create function public.dashboard() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('order_count',count(*),'placed_value',coalesce(sum(total),0),'collected_revenue',coalesce(sum(total) filter(where payment_status='collected'),0),'pending',count(*) filter(where status<>'delivered'),'delivered',count(*) filter(where status='delivered'),'customers',count(distinct phone),
 'months',(select coalesce(jsonb_agg(x order by x.month),'[]') from (select to_char(m,'YYYY-MM') as month,coalesce(sum(o.total),0) value from generate_series(date_trunc('month',now())-interval '5 months',date_trunc('month',now()),interval '1 month') m left join public.orders o on date_trunc('month',o.created_at)=m group by m) x),
 'top_products',(select coalesce(jsonb_agg(x),'[]') from (select product_name name,sum(quantity) quantity,sum(subtotal) sales from public.order_items group by product_name order by sum(quantity) desc limit 4) x)) from public.orders;
$$;
revoke execute on function public.quote_order(jsonb),public.place_order(uuid,uuid,jsonb),public.advance_order(uuid,uuid,integer,uuid),public.submit_feedback(uuid,uuid,uuid,integer,text),public.collect_payment(uuid,uuid),public.dashboard() from public,anon,authenticated;
grant execute on function public.quote_order(jsonb),public.place_order(uuid,uuid,jsonb),public.advance_order(uuid,uuid,integer,uuid),public.submit_feedback(uuid,uuid,uuid,integer,text),public.collect_payment(uuid,uuid),public.dashboard() to service_role;

