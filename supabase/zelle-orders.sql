begin;
create table if not exists blackline_private.zelle_orders(id text primary key,data jsonb not null check(data->>'id'=id and data->>'paymentMethod'='zelle'),updated_at timestamptz not null default now());
create table if not exists blackline_private.zelle_evidence(order_id text primary key references blackline_private.zelle_orders(id),image bytea not null check(octet_length(image) between 1 and 2097152),created_at timestamptz not null default now());
alter table blackline_private.zelle_orders enable row level security;
alter table blackline_private.zelle_evidence enable row level security;
revoke all on blackline_private.zelle_orders,blackline_private.zelle_evidence from public,anon,authenticated;

create or replace function public.blackline_zelle_request(token text,operation text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o jsonb; b jsonb; source_order jsonb; until_time timestamptz; ids jsonb='[]'::jsonb;
begin
 if not exists(select 1 from blackline_private.server_credentials where digest=encode(extensions.digest(token,'sha256'),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
 if operation='create' then
  select data into source_order from blackline_private.checkout_test_orders where stripe_session_id=payload->>'sessionId' for update;
  if source_order is null or source_order->>'status'='deposit_paid' or source_order ? 'upgradedOrderId' then raise exception 'Checkout is unavailable'; end if;
  select data into o from blackline_private.zelle_orders where id=source_order->>'id';
  if o is not null then return o; end if;
  until_time=now()+interval '30 minutes';
  -- Same sorted resource locks as the shared production reservation trigger.
  for b in select jsonb_build_object('resourceId',pid) from (
   select 'catalog:'||case when data->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(data->>'itemId') pid from blackline_private.checkout_test_bookings where id in(select jsonb_array_elements_text(source_order->'bookingIds'))
   union select value->'inventory'->>'resourceId' from jsonb_array_elements(source_order->'lines') where value->'inventory' is not null and value->'inventory'<>'null'::jsonb
  ) resources order by pid loop perform pg_advisory_xact_lock(hashtextextended(b->>'resourceId',0)); end loop;
  for b in select data from blackline_private.checkout_test_bookings where id in(select jsonb_array_elements_text(source_order->'bookingIds')) loop
   b=(b-'stripeSessionId')||jsonb_build_object('id','zelle:'||(b->>'id'),'paymentMode','zelle','status','pending','holdUntilIso',until_time);
   insert into public.checkout_bookings(id,data) values(b->>'id',b);
   ids=ids||jsonb_build_array(b->>'id');
  end loop;
  for b in select value->'inventory' from jsonb_array_elements(source_order->'lines') where value->'inventory' is not null and value->'inventory'<>'null'::jsonb order by value->'inventory'->>'resourceId' loop
   b=b||jsonb_build_object('id','zelle:'||(source_order->>'id')||':'||md5((b->>'resourceId')||(b->>'startIso')),'orderId',source_order->>'id','category','experience','status','pending','paymentMode','zelle','holdUntilIso',until_time,'customerName',source_order->>'customerName','customerEmail',source_order->>'customerEmail','customerPhone',source_order->>'customerPhone','source','website');
   insert into public.checkout_bookings(id,data) values(b->>'id',b);
   ids=ids||jsonb_build_array(b->>'id');
  end loop;
  o=(source_order-'stripeSessionId'-'stripeEventId')||jsonb_build_object('testMode',false,'paymentMethod','zelle','status','awaiting_transfer','bookingIds',ids,'holdUntilIso',until_time,'createdAtIso',now(),'hasEvidence',false);
  insert into blackline_private.zelle_orders(id,data) values(o->>'id',o);
  update blackline_private.checkout_test_orders set data=data||jsonb_build_object('status','expired'),updated_at=now() where id=o->>'id';
  update blackline_private.checkout_test_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status','cancelled') where id in(select jsonb_array_elements_text(source_order->'bookingIds'));
  return o;
 end if;
 select data into o from blackline_private.zelle_orders where id=payload->>'orderId' for update;
 if o is null then raise exception 'Order not found'; end if;
 if operation='get' then
  if o->>'status' in ('awaiting_transfer','payment_submitted') and (o->>'holdUntilIso')::timestamptz<=now() then o=o||jsonb_build_object('status','expired'); end if;
  return o;
 elsif operation='submit' then
  if o->>'status'='payment_submitted' then return o; end if;
  if o->>'status'<>'awaiting_transfer' or (o->>'holdUntilIso')::timestamptz<=now() then raise exception 'Your hold has expired. Contact your concierge before sending or resending money.'; end if;
  if payload->>'imageBase64' is null or length(payload->>'imageBase64')>2800000 then raise exception 'A valid payment screenshot is required'; end if;
  insert into blackline_private.zelle_evidence(order_id,image) values(o->>'id',decode(payload->>'imageBase64','base64'));
  until_time=now()+interval '72 hours';
  update public.checkout_bookings set data=data||jsonb_build_object('holdUntilIso',until_time) where id in(select jsonb_array_elements_text(o->'bookingIds'));
  o=o||jsonb_build_object('status','payment_submitted','submittedAtIso',now(),'holdUntilIso',until_time,'hasEvidence',true);
  update blackline_private.zelle_orders set data=o,updated_at=now() where id=o->>'id';
  return o;
 elsif operation='evidence' then
  return (select jsonb_build_object('imageBase64',encode(image,'base64')) from blackline_private.zelle_evidence where order_id=o->>'id');
 else raise exception 'Unknown operation'; end if;
end $$;
revoke all on function public.blackline_zelle_request(text,text,jsonb) from public,authenticated;
grant execute on function public.blackline_zelle_request(text,text,jsonb) to anon;

create or replace function public.blackline_admin_zelle(operation text,payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o jsonb; pid text;
begin
 if auth.uid() is null or not public.is_blackline_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if operation='list' then
  return coalesce((select jsonb_agg(jsonb_build_object('order',case when data->>'status' in ('awaiting_transfer','payment_submitted') and (data->>'holdUntilIso')::timestamptz<=now() then data||jsonb_build_object('status','expired') else data end,'bookings',coalesce((select jsonb_agg(b.data) from public.checkout_bookings b where b.id in(select jsonb_array_elements_text(o.data->'bookingIds'))),'[]'::jsonb)) order by updated_at desc) from blackline_private.zelle_orders o),'[]'::jsonb);
 end if;
 if operation not in ('confirm','reject') then raise exception 'Unknown operation'; end if;
 select data into o from blackline_private.zelle_orders where id=payload->>'orderId' for update;
 if o is null then raise exception 'Order not found'; end if;
 if o->>'status'=(case when operation='confirm' then 'confirmed' else 'rejected' end) then return o; end if;
 if o->>'status'<>'payment_submitted' or o->>'hasEvidence'<>'true' then raise exception 'Only submitted payments can be reviewed'; end if;
 if payload->>'bankChecked' is distinct from 'true' then raise exception 'Check the bank account before reviewing this payment'; end if;
 if operation='reject' and length(trim(coalesce(payload->>'note','')))=0 then raise exception 'Enter a reason for rejection'; end if;
 for pid in select coalesce(data->>'resourceId','catalog:'||case when data->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(data->>'itemId')) from public.checkout_bookings where id in(select jsonb_array_elements_text(o->'bookingIds')) order by 1 loop perform pg_advisory_xact_lock(hashtextextended(pid,0)); end loop;
 -- Existing reservation triggers re-check inventory, including after a hold expires.
 update public.checkout_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status',case when operation='confirm' then case when o->>'paymentType'='full' then 'paid' else 'deposit_paid' end else 'cancelled' end) where id in(select jsonb_array_elements_text(o->'bookingIds'));
 o=o||jsonb_build_object('status',case when operation='confirm' then 'confirmed' else 'rejected' end,'reviewedAtIso',now(),'reviewedBy',auth.uid(),'reviewNote',left(coalesce(payload->>'note',''),2000));
 update blackline_private.zelle_orders set data=o,updated_at=now() where id=o->>'id';
 return o;
end $$;
revoke all on function public.blackline_admin_zelle(text,jsonb) from public,anon,authenticated;
grant execute on function public.blackline_admin_zelle(text,jsonb) to authenticated;
commit;
