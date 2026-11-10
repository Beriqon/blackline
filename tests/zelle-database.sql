-- Transactional synthetic fixtures. All records and decisions are rolled back.
begin;
do $$
declare token_value text='zelle-transactional-verification-only'; o jsonb; claims jsonb; n integer; letter text; order_id text; session_id text; booking_id text; start_at timestamptz;
begin
 insert into blackline_private.server_credentials(digest) values(encode(extensions.digest(token_value,'sha256'),'hex'));
 select jsonb_build_object('sub',u.id,'email',u.email,'role','authenticated') into claims from auth.users u join public.admin_members m on m.email=lower(u.email) limit 1;
 if claims is null then raise exception 'No admin for verification'; end if;
 if has_function_privilege('anon','public.blackline_admin_zelle(text,jsonb)','execute') then raise exception 'Guest can review payments'; end if;
 begin perform public.blackline_zelle_request('wrong','get','{}');raise exception 'Bad token accepted';exception when insufficient_privilege then null;end;
 for n in 1..3 loop
  letter=chr(64+n);order_id='BL-ZELLE-VERIFY-'||letter;session_id='cs_test_zelleverification'||letter;booking_id='zelle-fixture-'||letter;start_at='2099-01-01'::timestamptz+n*interval '10 days';
  insert into blackline_private.checkout_test_orders(id,stripe_session_id,data) values(order_id,session_id,jsonb_build_object('id',order_id,'testMode',true,'status','pending','customerName','Synthetic Zelle check','customerEmail','zelle-test@example.com','customerPhone','+12025550123','knownTotalCents',10000,'depositCents',3000,'remainingCents',7000,'bookingIds',jsonb_build_array(booking_id),'lines',jsonb_build_array(jsonb_build_object('productId','catalog:exotic-cars:zelle-verification-resource','title','Synthetic item','totalCents',10000,'status','priced'),jsonb_build_object('productId','villa','title','Synthetic villa','totalCents',null,'status','price_follows'))));
  insert into blackline_private.checkout_test_bookings(id,data) values(booking_id,jsonb_build_object('id',booking_id,'orderId',order_id,'category','exotic-car','service','exotic-cars','itemId','zelle-verification-resource','status','pending','startIso',start_at,'endIso',start_at+interval '1 day','holdUntilIso',now()+interval '30 minutes','totalUsd',100,'paymentMode','stripe'));
  o=public.blackline_zelle_request(token_value,'create',jsonb_build_object('sessionId',session_id));
  if o->>'testMode'<>'false' or o->>'status'<>'awaiting_transfer' then raise exception 'Wrong initial state';end if;
  if (public.blackline_zelle_request(token_value,'create',jsonb_build_object('sessionId',session_id)))->>'id'<>order_id then raise exception 'Create retry failed';end if;
  begin perform public.blackline_zelle_request(token_value,'submit',jsonb_build_object('orderId',order_id));raise exception 'Missing screenshot accepted';exception when raise_exception then if sqlerrm='Missing screenshot accepted' then raise;end if;end;
  o=public.blackline_zelle_request(token_value,'submit',jsonb_build_object('orderId',order_id,'imageBase64','AA=='));
  if o->>'status'<>'payment_submitted' or (o->>'holdUntilIso')::timestamptz<>now()+interval '72 hours' then raise exception 'Wrong submitted state or deadline';end if;
  if public.blackline_zelle_request(token_value,'submit',jsonb_build_object('orderId',order_id,'imageBase64','AA==')) is distinct from o then raise exception 'Submission retry changed hold';end if;
  perform set_config('request.jwt.claims','{}',true);
  begin perform public.blackline_admin_zelle('list','{}');raise exception 'Guest read accepted';exception when insufficient_privilege then null;end;
  perform set_config('request.jwt.claims',claims::text,true);
  begin perform public.blackline_admin_zelle('confirm',jsonb_build_object('orderId',order_id));raise exception 'Unchecked bank accepted';exception when raise_exception then if sqlerrm='Unchecked bank accepted' then raise;end if;end;
  if n=1 then
   o=public.blackline_admin_zelle('confirm',jsonb_build_object('orderId',order_id,'bankChecked',true));
   if o->>'status'<>'confirmed' then raise exception 'Confirmation failed';end if;
   if exists(select 1 from public.checkout_bookings where id='zelle:'||booking_id and (data->>'status'<>'deposit_paid' or data ? 'holdUntilIso')) then raise exception 'Confirmed booking not secured';end if;
   perform public.blackline_admin_zelle('confirm',jsonb_build_object('orderId',order_id,'bankChecked',true));
  elsif n=2 then
   o=public.blackline_admin_zelle('reject',jsonb_build_object('orderId',order_id,'bankChecked',true,'note','Synthetic bank check: no funds'));
   if o->>'status'<>'rejected' or exists(select 1 from public.checkout_bookings where id='zelle:'||booking_id and data->>'status'<>'cancelled') then raise exception 'Rejection did not release inventory';end if;
  else
   update public.checkout_bookings set data=data||jsonb_build_object('holdUntilIso',now()-interval '1 second') where id='zelle:'||booking_id;
   update blackline_private.zelle_orders set data=data||jsonb_build_object('holdUntilIso',now()-interval '1 second') where id=order_id;
   if (public.blackline_zelle_request(token_value,'get',jsonb_build_object('orderId',order_id)))->>'status'<>'expired' then raise exception 'Expired hold not reported';end if;
   if jsonb_array_length(public.blackline_availability('exotic-car','zelle-verification-resource'))<>1 then raise exception 'Expired or rejected holds still block inventory';end if;
   insert into public.checkout_bookings(id,data) values('zelle-fixture-conflict',jsonb_build_object('id','zelle-fixture-conflict','category','exotic-car','itemId','zelle-verification-resource','status','owner_reserved','startIso',start_at,'endIso',start_at+interval '1 day'));
   begin perform public.blackline_admin_zelle('confirm',jsonb_build_object('orderId',order_id,'bankChecked',true));raise exception 'Expired hold reclaimed occupied dates';exception when raise_exception then if sqlerrm='Expired hold reclaimed occupied dates' then raise;end if;end;
   if (select data->>'status' from blackline_private.zelle_orders where id=order_id)<>'payment_submitted' then raise exception 'Failed confirmation corrupted order';end if;
  end if;
 end loop;
end $$;
rollback;
