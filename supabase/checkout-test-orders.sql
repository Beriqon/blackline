create table if not exists blackline_private.checkout_test_orders (
 id text primary key, data jsonb not null check(data->>'id'=id and data->>'testMode'='true'),
 stripe_session_id text unique, updated_at timestamptz not null default now()
);
alter table blackline_private.checkout_test_orders enable row level security;
revoke all on blackline_private.checkout_test_orders from public,anon,authenticated;
create table if not exists blackline_private.checkout_test_bookings (
 id text primary key, data jsonb not null check(data->>'id'=id)
);
alter table blackline_private.checkout_test_bookings enable row level security;
revoke all on blackline_private.checkout_test_bookings from public,anon,authenticated;
create or replace function public.blackline_checkout_order(token text, operation text, payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o jsonb; b jsonb;
begin
 if not exists(select 1 from blackline_private.server_credentials where digest=encode(extensions.digest(token,'sha256'),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
 if operation='create' then
  o=payload->'order';
  if o->>'testMode' is distinct from 'true' or (o->>'depositCents')::bigint<=0 then raise exception 'Invalid test order'; end if;
  insert into blackline_private.checkout_test_orders(id,data) values(o->>'id',o);
  for b in select value from jsonb_array_elements(payload->'bookings') order by value->>'category',value->>'itemId' loop
   perform pg_advisory_xact_lock(hashtextextended('stripe-test:'||(b->>'category')||':'||(b->>'itemId'),0));
   if exists(select 1 from blackline_private.checkout_test_bookings r
    where r.data->>'category'=b->>'category' and r.data->>'itemId'=b->>'itemId'
    and r.data->>'status'<>'cancelled' and (r.data->>'status'<>'pending' or (r.data->>'holdUntilIso')::timestamptz>now())
    and (r.data->>'startIso')::timestamptz<(b->>'endIso')::timestamptz and (r.data->>'endIso')::timestamptz>(b->>'startIso')::timestamptz)
   then raise exception 'This test booking slot is no longer available.'; end if;
   insert into blackline_private.checkout_test_bookings(id,data) values(b->>'id',b);
  end loop;
  return o;
 elsif operation='attach' then
  update blackline_private.checkout_test_orders set stripe_session_id=payload->>'sessionId', data=data||jsonb_build_object('stripeSessionId',payload->>'sessionId'),updated_at=now() where id=payload->>'orderId' and stripe_session_id is null returning data into o;
  if o is null then raise exception 'Order not found or already attached'; end if;
  update blackline_private.checkout_test_bookings set data=data||jsonb_build_object('stripeSessionId',payload->>'sessionId') where id in(select jsonb_array_elements_text(o->'bookingIds'));
  return o;
 elsif operation='get' then
  select data into o from blackline_private.checkout_test_orders where stripe_session_id=payload->>'sessionId';
  return o;
 elsif operation in ('paid','expire','abort') then
  select data into o from blackline_private.checkout_test_orders where
   (operation='abort' and id=payload->>'orderId') or (operation<>'abort' and stripe_session_id=payload->>'sessionId') for update;
  if o is null then raise exception 'Order not found'; end if;
  if o->>'status'='deposit_paid' then return o; end if;
  if operation='paid' then
   if coalesce(o->>'amountDueCents',o->>'depositCents')::bigint is distinct from (payload->>'amountCents')::bigint or payload->>'currency' is distinct from 'usd' then raise exception 'Payment amount mismatch'; end if;
   -- A late payment must never reclaim inventory which has since been reserved.
   if exists(select 1 from blackline_private.checkout_test_bookings where id in(select jsonb_array_elements_text(o->'bookingIds')) and data->>'status'='cancelled') then raise exception 'Paid reservation requires manual review'; end if;
   for b in select data from blackline_private.checkout_test_bookings where id in(select jsonb_array_elements_text(o->'bookingIds')) order by data->>'category',data->>'itemId' loop
    perform pg_advisory_xact_lock(hashtextextended('stripe-test:'||(b->>'category')||':'||(b->>'itemId'),0));
    if exists(select 1 from blackline_private.checkout_test_bookings r
     where r.id<>b->>'id' and r.data->>'category'=b->>'category' and r.data->>'itemId'=b->>'itemId'
     and r.data->>'status'<>'cancelled' and (r.data->>'status'<>'pending' or (r.data->>'holdUntilIso')::timestamptz>now())
     and (r.data->>'startIso')::timestamptz<(b->>'endIso')::timestamptz and (r.data->>'endIso')::timestamptz>(b->>'startIso')::timestamptz)
    then raise exception 'Late test payment requires manual inventory review'; end if;
   end loop;
   update blackline_private.checkout_test_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status',case when o->>'paymentType'='full' then 'paid' else 'deposit_paid' end) where id in(select jsonb_array_elements_text(o->'bookingIds'));
   o=o||jsonb_build_object('status','deposit_paid','paidAtIso',now(),'stripeEventId',payload->>'eventId');
   if exists(select 1 from jsonb_array_elements(o->'lines') where value->>'status'='price_follows') then
    o=o||jsonb_build_object('quoteStatus','pending');
   end if;
  else
   update blackline_private.checkout_test_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status','cancelled')
    where id in(select jsonb_array_elements_text(o->'bookingIds')) and data->>'status'='pending';
   o=o||jsonb_build_object('status','expired');
  end if;
  update blackline_private.checkout_test_orders set data=o,updated_at=now() where id=o->>'id';
  return o;
 else raise exception 'Unknown operation'; end if;
end $$;
revoke all on function public.blackline_checkout_order(text,text,jsonb) from public,authenticated;
grant execute on function public.blackline_checkout_order(text,text,jsonb) to anon;
