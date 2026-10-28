-- Wires this repo's admin UI to the live DB's already-built manufacturing
-- QC/receiving pipeline (production_batches extended fields, batch_qc_checks,
-- stock_receipts, inventory_lots, inventory_movements) by adding explicit
-- p_admin-param overloads of the live auth.uid()-based functions, matching
-- the convention already used by every other function in this repo and by
-- the prior reconciliation migration (202611030001). Purely additive: the
-- live auth.uid()-based versions are untouched.

create function public.confirm_fresava_batch_manufacturing(
  p_admin uuid, p_batch_id uuid, p_filled_quantity integer, p_rejected_quantity integer,
  p_held_quantity integer, p_manufacturing_date date, p_expiry_date date, p_notes text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_batch public.production_batches; v_eligible integer;
begin
  if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then
    raise exception 'Active admin authorization required';
  end if;

  select * into v_batch from public.production_batches where id=p_batch_id for update;
  if not found then raise exception 'Manufacturing batch not found'; end if;

  if v_batch.status not in ('planned','in_production') then
    raise exception 'Manufacturing already confirmed or batch locked';
  end if;

  if p_filled_quantity is null or p_rejected_quantity is null or p_held_quantity is null
     or p_filled_quantity<0 or p_rejected_quantity<0 or p_held_quantity<0
     or p_rejected_quantity+p_held_quantity>p_filled_quantity then
    raise exception 'Invalid manufacturing quantities';
  end if;

  if p_filled_quantity>v_batch.planned_quantity then
    raise exception 'Filled quantity exceeds planned batch size';
  end if;

  if p_manufacturing_date is null or p_manufacturing_date>current_date
     or p_expiry_date is null or p_expiry_date<=p_manufacturing_date then
    raise exception 'Invalid manufacturing or expiry dates';
  end if;

  v_eligible:=p_filled_quantity-p_rejected_quantity-p_held_quantity;

  if exists(select 1 from public.batch_qc_checks where batch_id=p_batch_id) then
    raise exception 'QC records already exist for this batch';
  end if;
  if exists(select 1 from public.stock_receipts where batch_id=p_batch_id) then
    raise exception 'Stock already received for this batch';
  end if;

  update public.production_batches set
    filled_quantity=p_filled_quantity, rejected_quantity=p_rejected_quantity, held_quantity=p_held_quantity,
    manufacturing_date=p_manufacturing_date, expiry_date=p_expiry_date, notes=p_notes,
    status='awaiting_qc', updated_at=now()
  where id=p_batch_id;

  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'batch.manufacturing_confirmed',p_batch_id,
      jsonb_build_object('filled_quantity',p_filled_quantity,'rejected_quantity',p_rejected_quantity,'held_quantity',p_held_quantity));

  return jsonb_build_object('success',true,'batch_id',p_batch_id,'filled_quantity',p_filled_quantity,
    'rejected_quantity',p_rejected_quantity,'held_quantity',p_held_quantity,'eligible_for_qc',v_eligible,'status','awaiting_qc');
end $$;

revoke execute on function public.confirm_fresava_batch_manufacturing(uuid,uuid,integer,integer,integer,date,date,text) from public,anon,authenticated;
grant execute on function public.confirm_fresava_batch_manufacturing(uuid,uuid,integer,integer,integer,date,date,text) to service_role;

create function public.approve_fresava_batch_qc(
  p_admin uuid, p_batch_id uuid, p_decision text, p_released_quantity integer,
  p_packaging_passed boolean, p_seal_passed boolean, p_labeling_passed boolean,
  p_lab_testing_passed boolean, p_documentation_passed boolean, p_remarks text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_batch public.production_batches; v_qc_id uuid; v_eligible integer; v_new_status text;
begin
  if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then
    raise exception 'Active admin authorization required';
  end if;

  select * into v_batch from public.production_batches where id=p_batch_id for update;
  if not found then raise exception 'Manufacturing batch not found'; end if;

  if exists(select 1 from public.stock_receipts where batch_id=p_batch_id) then
    raise exception 'QC decision cannot change after stock receiving';
  end if;

  if v_batch.status not in ('awaiting_qc','qc_approved','qc_held','qc_rejected') then
    raise exception 'Batch is not eligible for QC review';
  end if;

  if v_batch.filled_quantity is null or v_batch.rejected_quantity is null or v_batch.held_quantity is null then
    raise exception 'Manufacturing quantities are incomplete';
  end if;

  v_eligible:=v_batch.filled_quantity-v_batch.rejected_quantity-v_batch.held_quantity;
  if v_eligible<0 then raise exception 'Invalid manufacturing quantities'; end if;

  if p_decision not in ('approved','held','rejected') then raise exception 'Invalid QC decision'; end if;

  if p_decision='approved' then
    if p_released_quantity is null or p_released_quantity<=0 or p_released_quantity>v_eligible then
      raise exception 'QC release exceeds eligible batch quantity';
    end if;
    if not (coalesce(p_packaging_passed,false) and coalesce(p_seal_passed,false) and coalesce(p_labeling_passed,false)
            and coalesce(p_lab_testing_passed,false) and coalesce(p_documentation_passed,false)) then
      raise exception 'All required QC checks must pass';
    end if;
    v_new_status:='qc_approved';
  else
    if p_released_quantity is distinct from 0 then
      raise exception 'Held or rejected batches cannot release stock';
    end if;
    if nullif(btrim(p_remarks),'') is null then
      raise exception 'Remarks required for held or rejected batches';
    end if;
    v_new_status:=case when p_decision='held' then 'qc_held' else 'qc_rejected' end;
  end if;

  insert into public.batch_qc_checks(
    batch_id,packaging_passed,seal_passed,labeling_passed,lab_testing_passed,documentation_passed,
    decision,released_quantity,remarks,reviewed_by
  ) values(
    p_batch_id,coalesce(p_packaging_passed,false),coalesce(p_seal_passed,false),coalesce(p_labeling_passed,false),
    coalesce(p_lab_testing_passed,false),coalesce(p_documentation_passed,false),p_decision,
    coalesce(p_released_quantity,0),p_remarks,null
  ) returning id into v_qc_id;

  update public.production_batches set status=v_new_status, updated_at=now() where id=p_batch_id;

  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'batch.qc_decision',p_batch_id,jsonb_build_object('decision',p_decision,'qc_check_id',v_qc_id));

  return jsonb_build_object('success',true,'qc_check_id',v_qc_id,'batch_id',p_batch_id,'decision',p_decision,
    'eligible_quantity',v_eligible,'released_quantity',case when p_decision='approved' then p_released_quantity else 0 end,
    'batch_status',v_new_status);
end $$;

revoke execute on function public.approve_fresava_batch_qc(uuid,uuid,text,integer,boolean,boolean,boolean,boolean,boolean,text) from public,anon,authenticated;
grant execute on function public.approve_fresava_batch_qc(uuid,uuid,text,integer,boolean,boolean,boolean,boolean,boolean,text) to service_role;

create function public.receive_fresava_batch_stock(
  p_admin uuid, p_batch_barcode text, p_received_quantity integer, p_warehouse_location text,
  p_idempotency_key uuid, p_notes text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_batch public.production_batches; v_qc public.batch_qc_checks; v_existing public.stock_receipts;
  v_receipt_id uuid; v_receipt_number text; v_received_total bigint; v_eligible integer; v_location text;
begin
  if not exists(select 1 from public.staff_members where id=p_admin and role='admin' and active) then
    raise exception 'Admin authorization required';
  end if;

  v_location:=btrim(p_warehouse_location);
  if p_idempotency_key is null or p_batch_barcode is null or btrim(p_batch_barcode)=''
     or p_received_quantity is null or p_received_quantity<=0
     or v_location is null or v_location='' or length(v_location)>120 then
    raise exception 'Invalid stock receipt input';
  end if;

  select * into v_batch from public.production_batches where barcode_value=btrim(p_batch_barcode) for update;
  if not found then raise exception 'Manufacturing batch not found'; end if;

  select * into v_existing from public.stock_receipts where idempotency_key=p_idempotency_key;
  if found then
    if v_existing.batch_id<>v_batch.id or v_existing.received_quantity<>p_received_quantity
       or v_existing.warehouse_location<>v_location then
      raise exception 'Idempotency key already used for another receipt';
    end if;
    return jsonb_build_object('success',true,'duplicate',true,'receipt_id',v_existing.id,
      'receipt_number',v_existing.receipt_number,'received_quantity',v_existing.received_quantity);
  end if;

  if v_batch.status not in ('qc_approved','completed') then raise exception 'Batch is not QC approved'; end if;
  if v_batch.manufacturing_date is null or v_batch.manufacturing_date>current_date
     or v_batch.expiry_date is null or v_batch.expiry_date<=current_date then
    raise exception 'Batch manufacturing or expiry dates are invalid';
  end if;
  if v_batch.filled_quantity is null or v_batch.rejected_quantity is null or v_batch.held_quantity is null then
    raise exception 'Manufacturing quantities incomplete';
  end if;

  v_eligible:=v_batch.filled_quantity-v_batch.rejected_quantity-v_batch.held_quantity;

  select * into v_qc from public.batch_qc_checks where batch_id=v_batch.id
    order by reviewed_at desc, created_at desc, id desc limit 1;
  if not found or v_qc.decision<>'approved' then raise exception 'Valid QC approval not found'; end if;
  if not (v_qc.packaging_passed and v_qc.seal_passed and v_qc.labeling_passed and v_qc.lab_testing_passed and v_qc.documentation_passed) then
    raise exception 'Required QC checks not passed';
  end if;
  if v_qc.released_quantity<=0 or v_qc.released_quantity>v_eligible then
    raise exception 'QC release exceeds eligible production';
  end if;

  select coalesce(sum(received_quantity),0) into v_received_total from public.stock_receipts where batch_id=v_batch.id;
  if v_received_total+p_received_quantity>v_qc.released_quantity then
    raise exception 'Receipt exceeds remaining QC-released quantity';
  end if;

  v_receipt_id:=gen_random_uuid();
  v_receipt_number:='FRV-R-'||replace(v_receipt_id::text,'-','');

  insert into public.stock_receipts(
    id,batch_id,qc_check_id,receipt_number,idempotency_key,received_quantity,warehouse_location,received_by,notes
  ) values(
    v_receipt_id,v_batch.id,v_qc.id,v_receipt_number,p_idempotency_key,p_received_quantity,v_location,null,p_notes
  );

  insert into public.inventory_lots(batch_id,warehouse_location,received_quantity,available_quantity,reserved_quantity)
    values(v_batch.id,v_location,p_received_quantity,p_received_quantity,0)
    on conflict(batch_id,warehouse_location) do update set
      received_quantity=public.inventory_lots.received_quantity+excluded.received_quantity,
      available_quantity=public.inventory_lots.available_quantity+excluded.available_quantity,
      updated_at=now();

  insert into public.inventory_movements(batch_id,receipt_id,movement_type,quantity_change,warehouse_location,performed_by,notes)
    values(v_batch.id,v_receipt_id,'receipt',p_received_quantity,v_location,null,'QC-approved warehouse stock receipt');

  insert into public.audit_log(actor_type,staff_member_id,action,entity_id,details)
    values('admin',p_admin,'batch.stock_received',v_batch.id,
      jsonb_build_object('receipt_id',v_receipt_id,'received_quantity',p_received_quantity,'warehouse_location',v_location));

  return jsonb_build_object('success',true,'duplicate',false,'receipt_id',v_receipt_id,'receipt_number',v_receipt_number,
    'batch_id',v_batch.id,'received_quantity',p_received_quantity,
    'remaining_receivable',v_qc.released_quantity-v_received_total-p_received_quantity);
end $$;

revoke execute on function public.receive_fresava_batch_stock(uuid,text,integer,text,uuid,text) from public,anon,authenticated;
grant execute on function public.receive_fresava_batch_stock(uuid,text,integer,text,uuid,text) to service_role;
