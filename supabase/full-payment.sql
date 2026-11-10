begin;
-- Backwards compatible: existing orders have no amountDueCents and remain deposits.
do $$ declare definition text; begin
 definition=pg_get_functiondef('public.blackline_checkout_order(text,text,jsonb)'::regprocedure);
 definition=replace(definition,$find$(o->>'depositCents')::bigint is distinct from (payload->>'amountCents')::bigint$find$,$replace$coalesce(o->>'amountDueCents',o->>'depositCents')::bigint is distinct from (payload->>'amountCents')::bigint$replace$);
 definition=replace(definition,$find$jsonb_build_object('status','deposit_paid') where id in$find$, $replace$jsonb_build_object('status',case when o->>'paymentType'='full' then 'paid' else 'deposit_paid' end) where id in$replace$);
 execute definition;
end $$;

create or replace function public.blackline_full_checkout(token text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o jsonb; next_order jsonb; b jsonb; ids jsonb='[]'::jsonb; new_id text; new_booking text;
begin
 if not exists(select 1 from blackline_private.server_credentials where digest=encode(extensions.digest(token,'sha256'),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
 select data into o from blackline_private.checkout_test_orders where stripe_session_id=payload->>'sessionId' for update;
 if o is null or o->>'status'='deposit_paid' then raise exception 'This payment cannot be changed'; end if;
 if exists(select 1 from blackline_private.zelle_orders where id=o->>'id') then raise exception 'This order has already switched to Zelle'; end if;
 if o ? 'upgradedOrderId' then return (select data from blackline_private.checkout_test_orders where id=o->>'upgradedOrderId'); end if;
 if (o->>'createdAtIso')::timestamptz+interval '35 minutes'<=now() then raise exception 'Return to your selection to check current prices'; end if;
 if o->>'paymentType'='full' then return o; end if;
 new_id=payload->>'orderId';if new_id is null or new_id !~ '^BL-[A-Z0-9-]+$' then raise exception 'Invalid order reference'; end if;
 for b in select data from blackline_private.checkout_test_bookings where id in(select jsonb_array_elements_text(o->'bookingIds')) order by data->>'category',data->>'itemId' loop
  perform pg_advisory_xact_lock(hashtextextended('stripe-test:'||(b->>'category')||':'||(b->>'itemId'),0));
  if exists(select 1 from blackline_private.checkout_test_bookings r where r.id<>b->>'id' and r.data->>'category'=b->>'category' and r.data->>'itemId'=b->>'itemId' and r.data->>'status'<>'cancelled' and (r.data->>'status'<>'pending' or (r.data->>'holdUntilIso')::timestamptz>now()) and (r.data->>'startIso')::timestamptz<(b->>'endIso')::timestamptz and (r.data->>'endIso')::timestamptz>(b->>'startIso')::timestamptz) then raise exception 'This slot is no longer available'; end if;
  if exists(select 1 from jsonb_array_elements(public.blackline_availability(b->>'category',b->>'itemId')) w where (w->>'startIso')::timestamptz<(b->>'endIso')::timestamptz and (w->>'endIso')::timestamptz>(b->>'startIso')::timestamptz) then raise exception 'This slot is no longer available'; end if;
  new_booking='bk_full_'||md5(new_id||(b->>'id'));
  b=(b-'stripeSessionId')||jsonb_build_object('id',new_booking,'orderId',new_id,'status','pending','paymentType','full','holdUntilIso',now()+interval '35 minutes');
  insert into blackline_private.checkout_test_bookings(id,data) values(new_booking,b);
  ids=ids||jsonb_build_array(new_booking);
 end loop;
 next_order=(o-'stripeSessionId')||jsonb_build_object('id',new_id,'status','pending','paymentType','full','amountDueCents',(o->>'knownTotalCents')::bigint,'remainingCents',0,'bookingIds',ids,'createdAtIso',now());
 insert into blackline_private.checkout_test_orders(id,data) values(new_id,next_order);
 update blackline_private.checkout_test_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status','cancelled') where id in(select jsonb_array_elements_text(o->'bookingIds'));
 update blackline_private.checkout_test_orders set data=data||jsonb_build_object('status','expired','upgradedOrderId',new_id),updated_at=now() where id=o->>'id';
 return next_order;
end $$;
revoke all on function public.blackline_full_checkout(text,jsonb) from public,authenticated;
grant execute on function public.blackline_full_checkout(text,jsonb) to anon;
commit;
