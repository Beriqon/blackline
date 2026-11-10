-- Live payments share production inventory, never the isolated test holds.
begin;
create table blackline_private.checkout_live_orders(
 id text primary key,data jsonb not null check(data->>'id'=id and data->>'testMode'='false'),
 stripe_session_id text unique,updated_at timestamptz not null default now()
);
alter table blackline_private.checkout_live_orders enable row level security;
revoke all on blackline_private.checkout_live_orders from public,anon,authenticated;

create or replace function public.blackline_checkout_live(token text,operation text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o jsonb;b jsonb;v jsonb;next_order jsonb;ids jsonb='[]'::jsonb;new_id text;conflict_message text;
begin
 if not exists(select 1 from blackline_private.server_credentials where digest=encode(extensions.digest(token,'sha256'),'hex')) then raise exception 'Unauthorized' using errcode='42501';end if;
 if operation='create' then
  o=payload->'order';
  if o->>'testMode' is distinct from 'false' or o->>'status' is distinct from 'pending' or (o->>'amountDueCents')::bigint<50 or (o->>'knownTotalCents')::bigint is distinct from (select sum((l->>'totalCents')::bigint) from jsonb_array_elements(o->'lines') l) then raise exception 'Invalid live order';end if;
  if exists(select 1 from blackline_private.checkout_test_orders where id=o->>'id') then raise exception 'Environment reference collision';end if;
  -- Lock every resource in one deterministic order before any inserts.
  for b in select jsonb_build_object('pid',pid) from (
   select replace(coalesce(x->>'resourceId','catalog:'||case when x->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(x->>'itemId')),'catalog:chauffeur-services:','catalog:exotic-cars:') pid from jsonb_array_elements(payload->'bookings') x
   union select replace(l->'inventory'->>'resourceId','catalog:chauffeur-services:','catalog:exotic-cars:') from jsonb_array_elements(o->'lines') l where l->>'totalCents' is not null and l->'inventory'->>'resourceId' is not null
  ) resources order by pid loop perform pg_advisory_xact_lock(hashtextextended(b->>'pid',0));end loop;
  for b in select value from jsonb_array_elements(payload->'bookings') loop
   b=b||jsonb_build_object('orderId',o->>'id','paymentMode','stripe','testMode',false,'status','pending','holdUntilIso',now()+interval '35 minutes');
   insert into public.checkout_bookings(id,data) values(b->>'id',b);ids=ids||jsonb_build_array(b->>'id');
  end loop;
  for v in select l->'inventory' from jsonb_array_elements(o->'lines') l where l->>'totalCents' is not null and l->'inventory'->>'resourceId' is not null loop
   b=v||jsonb_build_object('id','stripe:'||(o->>'id')||':'||md5((v->>'resourceId')||(v->>'startIso')),'orderId',o->>'id','category','experience','paymentMode','stripe','testMode',false,'status','pending','holdUntilIso',now()+interval '35 minutes','customerName',o->>'customerName','customerEmail',o->>'customerEmail','customerPhone',o->>'customerPhone','source','website');
   insert into public.checkout_bookings(id,data) values(b->>'id',b);ids=ids||jsonb_build_array(b->>'id');
  end loop;
  o=o||jsonb_build_object('bookingIds',ids,'createdAtIso',now());
  insert into blackline_private.checkout_live_orders(id,data) values(o->>'id',o);return o;
 end if;
 if operation='abort' then select data into o from blackline_private.checkout_live_orders where id=payload->>'orderId' for update;
 elsif operation='attach' then select data into o from blackline_private.checkout_live_orders where id=payload->>'orderId' for update;
 else select data into o from blackline_private.checkout_live_orders where stripe_session_id=payload->>'sessionId' for update;end if;
 if o is null then if operation='get' then return null;else raise exception 'Order not found';end if;end if;
 if operation='get' then return o;end if;
 for b in select data from public.checkout_bookings where id in(select jsonb_array_elements_text(o->'bookingIds')) order by replace(coalesce(data->>'resourceId','catalog:'||case when data->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(data->>'itemId')),'catalog:chauffeur-services:','catalog:exotic-cars:') loop
  perform pg_advisory_xact_lock(hashtextextended(replace(coalesce(b->>'resourceId','catalog:'||case when b->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(b->>'itemId')),'catalog:chauffeur-services:','catalog:exotic-cars:'),0));
 end loop;
 if operation='attach' then
  if o->>'status'<>'pending' or o ? 'stripeSessionId' or payload->>'sessionId' !~ '^cs_live_[A-Za-z0-9]+$' then raise exception 'Session cannot be attached';end if;
  o=o||jsonb_build_object('stripeSessionId',payload->>'sessionId');
  update blackline_private.checkout_live_orders set stripe_session_id=payload->>'sessionId',data=o,updated_at=now() where id=o->>'id';
  update public.checkout_bookings set data=data||jsonb_build_object('stripeSessionId',payload->>'sessionId') where id in(select jsonb_array_elements_text(o->'bookingIds'));return o;
 end if;
 if operation='zelle' then
  select data into next_order from blackline_private.zelle_orders where id=o->>'id';if next_order is not null then return next_order;end if;
  if o->>'status' not in ('pending','expired') or o ? 'upgradedOrderId' or (o->>'createdAtIso')::timestamptz+interval '35 minutes'<=now() then raise exception 'Checkout cannot switch to Zelle';end if;
  update public.checkout_bookings set data=(data-'stripeSessionId')||jsonb_build_object('paymentMode','zelle','status','pending','holdUntilIso',now()+interval '30 minutes') where id in(select jsonb_array_elements_text(o->'bookingIds'));
  next_order=(o-'stripeSessionId'-'stripeEventId')||jsonb_build_object('testMode',false,'paymentMethod','zelle','status','awaiting_transfer','holdUntilIso',now()+interval '30 minutes','createdAtIso',now(),'hasEvidence',false);
  insert into blackline_private.zelle_orders(id,data) values(o->>'id',next_order);
  update blackline_private.checkout_live_orders set data=data||jsonb_build_object('status','expired','switchedToZelle',true,'bookingIds','[]'::jsonb),updated_at=now() where id=o->>'id';return next_order;
 end if;
 if operation='upgrade' then
  if o ? 'upgradedOrderId' then return (select data from blackline_private.checkout_live_orders where id=o->>'upgradedOrderId');end if;
  if o->>'status' not in ('pending','expired') or o ? 'switchedToZelle' or (o->>'createdAtIso')::timestamptz+interval '35 minutes'<=now() then raise exception 'Checkout cannot be changed';end if;
  if o->>'paymentType'='full' then return o;end if;
  new_id=payload->>'orderId';if new_id is null or new_id !~ '^BL-[A-Z0-9-]+$' then raise exception 'Invalid order reference';end if;
  for b in select data from public.checkout_bookings where id in(select jsonb_array_elements_text(o->'bookingIds')) order by coalesce(data->>'resourceId','catalog:'||case when data->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(data->>'itemId')) loop
   perform pg_advisory_xact_lock(hashtextextended(replace(coalesce(b->>'resourceId','catalog:'||case when b->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(b->>'itemId')),'catalog:chauffeur-services:','catalog:exotic-cars:'),0));
  end loop;
  update public.checkout_bookings set data=(data-'stripeSessionId')||jsonb_build_object('orderId',new_id,'status','pending','paymentType','full','holdUntilIso',now()+interval '35 minutes') where id in(select jsonb_array_elements_text(o->'bookingIds'));
  next_order=(o-'stripeSessionId')||jsonb_build_object('id',new_id,'paymentType','full','amountDueCents',(o->>'knownTotalCents')::bigint,'remainingCents',0,'status','pending','createdAtIso',now());
  insert into blackline_private.checkout_live_orders(id,data) values(new_id,next_order);
  update blackline_private.checkout_live_orders set data=data||jsonb_build_object('status','expired','upgradedOrderId',new_id,'bookingIds','[]'::jsonb),updated_at=now() where id=o->>'id';return next_order;
 end if;
 if operation in ('paid','expire','abort') then
  if operation='paid' then
   if o->>'status' in ('deposit_paid','payment_review') then return o;end if;
   if payload->>'currency' is distinct from 'usd' or (payload->>'amountCents')::bigint is distinct from (o->>'amountDueCents')::bigint then raise exception 'Payment amount mismatch';end if;
   if o ? 'upgradedOrderId' or o ? 'switchedToZelle' then raise exception 'Paid superseded checkout requires manual review';end if;
   -- The shared trigger rechecks expired holds against every real reservation.
   begin
    update public.checkout_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status',case when o->>'paymentType'='full' then 'paid' else 'deposit_paid' end) where id in(select jsonb_array_elements_text(o->'bookingIds'));
    o=o||jsonb_build_object('status','deposit_paid');
   exception when raise_exception then
    get stacked diagnostics conflict_message=message_text;
    if conflict_message not like 'This product already has %' then raise;end if;
    update public.checkout_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status','cancelled') where id in(select jsonb_array_elements_text(o->'bookingIds'));
    o=o||jsonb_build_object('status','payment_review','reviewReason','Payment received after availability changed. Contact the guest; resolve or refund manually.');
   end;
   o=o||jsonb_build_object('paidAtIso',now(),'amountPaidCents',(payload->>'amountCents')::bigint,'stripeEventId',payload->>'eventId');
  elsif o->>'status' not in ('deposit_paid','payment_review') then
   update public.checkout_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status','cancelled') where id in(select jsonb_array_elements_text(o->'bookingIds')) and data->>'status'='pending';
   o=o||jsonb_build_object('status','expired');
  end if;
  update blackline_private.checkout_live_orders set data=o,updated_at=now() where id=o->>'id';return o;
 end if;
 raise exception 'Unknown operation';
end $$;
revoke all on function public.blackline_checkout_live(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.blackline_checkout_live(text,text,jsonb) to anon;

create function public.blackline_admin_live_orders() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.is_blackline_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('order',o.data-'stripeSessionId'-'stripeEventId','bookings',coalesce((select jsonb_agg(b.data) from public.checkout_bookings b where b.id in(select jsonb_array_elements_text(o.data->'bookingIds'))),'[]'::jsonb)) order by o.updated_at desc) from blackline_private.checkout_live_orders o where o.data->>'status' in ('deposit_paid','payment_review')),'[]'::jsonb);
end $$;
revoke all on function public.blackline_admin_live_orders() from public,anon,authenticated;
grant execute on function public.blackline_admin_live_orders() to authenticated;
commit;
