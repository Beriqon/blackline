-- No Stripe requests or real charges. Synthetic fixtures are fully rolled back.
begin;
do $$
declare credential text='stripe-live-transaction-verification';o jsonb;r jsonb;b jsonb;a jsonb;claims jsonb;
begin
 insert into blackline_private.server_credentials(digest) values(encode(extensions.digest(credential,'sha256'),'hex'));
 o=jsonb_build_object('id','BL-LIVE-VERIFY-A','testMode',false,'status','pending','customerName','Synthetic live verification','customerEmail','synthetic@example.invalid','customerPhone','+12025550100','paymentType','deposit','knownTotalCents',10000,'depositCents',3000,'amountDueCents',3000,'remainingCents',7000,'createdAtIso',now(),'bookingIds',jsonb_build_array('live-verify-car'),'lines',jsonb_build_array(jsonb_build_object('productId','catalog:exotic-cars:live-verify-car','title','Synthetic car','totalCents',6000),jsonb_build_object('productId','catalog:jetskis-jetcars:live-verify-activity','title','Synthetic activity','totalCents',4000,'inventory',jsonb_build_object('resourceId','catalog:jetskis-jetcars:live-verify-activity','itemId','live-verify-activity','service','jetskis-jetcars','startIso','2099-05-01T04:00:00Z','endIso','2099-05-02T04:00:00Z')),jsonb_build_object('productId','villa','title','Quote only','totalCents',null)));
 b=jsonb_build_object('id','live-verify-car','category','exotic-car','service','exotic-cars','itemId','live-verify-car','startIso','2099-05-01T10:00:00Z','endIso','2099-05-02T10:00:00Z','totalUsd',60);
 begin perform public.blackline_checkout_live('bad-token','create','{}');raise exception 'Bad credential accepted';exception when insufficient_privilege then null;end;
 begin perform public.blackline_checkout_live(credential,'create',jsonb_build_object('order',o||'{"testMode":true}','bookings',jsonb_build_array(b)));raise exception 'Test order accepted into live storage';exception when raise_exception then if sqlerrm='Test order accepted into live storage' then raise;end if;end;
 r=public.blackline_checkout_live(credential,'create',jsonb_build_object('order',o,'bookings',jsonb_build_array(b)));
 if jsonb_array_length(r->'bookingIds')<>2 then raise exception 'Activity missing from production inventory';end if;
 if jsonb_array_length(public.blackline_availability('exotic-car','live-verify-car'))<>1 then raise exception 'Live pending hold missing from availability';end if;
 begin perform public.blackline_checkout_live(credential,'create',jsonb_build_object('order',o||'{"id":"BL-LIVE-VERIFY-CONFLICT"}','bookings',jsonb_build_array(b||'{"id":"conflicting-live-car"}')));raise exception 'Overlapping live order accepted';exception when raise_exception then if sqlerrm='Overlapping live order accepted' then raise;end if;end;
 begin insert into public.checkout_bookings(id,data) values('zelle-live-conflict',b||'{"id":"zelle-live-conflict","status":"owner_reserved","paymentMode":"zelle"}');raise exception 'Overlapping Zelle reservation accepted';exception when raise_exception then if sqlerrm='Overlapping Zelle reservation accepted' then raise;end if;end;
 perform public.blackline_checkout_live(credential,'attach','{"orderId":"BL-LIVE-VERIFY-A","sessionId":"cs_live_verifyA"}');
 begin perform public.blackline_checkout_live(credential,'paid','{"sessionId":"cs_live_verifyA","amountCents":1,"currency":"usd"}');raise exception 'Wrong payment amount accepted';exception when raise_exception then if sqlerrm='Wrong payment amount accepted' then raise;end if;end;
 perform public.blackline_checkout_live(credential,'paid','{"sessionId":"cs_live_verifyA","amountCents":3000,"currency":"usd","eventId":"evt_synthetic_live"}');
 r=public.blackline_checkout_live(credential,'paid','{"sessionId":"cs_live_verifyA","amountCents":3000,"currency":"usd","eventId":"evt_synthetic_retry"}');
 if r->>'status'<>'deposit_paid' or (select count(*) from public.checkout_bookings where data->>'orderId'='BL-LIVE-VERIFY-A')<>2 then raise exception 'Duplicate live payment created reservations';end if;
 perform public.blackline_balance(credential,'create','{"source":"stripe","orderId":"BL-LIVE-VERIFY-A","id":"live-balance-fixture"}');
 perform public.blackline_balance(credential,'attach','{"id":"live-balance-fixture","newSessionId":"cs_live_balanceFixture"}');
 r=public.blackline_balance(credential,'paid','{"sessionId":"cs_live_balanceFixture","amountCents":7000,"currency":"usd","eventId":"evt_balance_synthetic"}');
 if (r->'order'->>'amountPaidCents')::bigint<>10000 or (r->'order'->>'remainingCents')::bigint<>0 or r->'order'->'paymentHistory'->0->>'method'<>'Stripe' then raise exception 'Live balance settlement failed';end if;
 perform public.blackline_checkout_live(credential,'expire','{"sessionId":"cs_live_verifyA"}');
 if exists(select 1 from public.checkout_bookings where data->>'orderId'='BL-LIVE-VERIFY-A' and data->>'status'<>'paid') then raise exception 'Expiry cancelled a paid order';end if;
 -- Upgrade and switching to Zelle keep a single production reservation.
 o=o||'{"id":"BL-LIVE-VERIFY-B","knownTotalCents":6000,"depositCents":1800,"amountDueCents":1800,"remainingCents":4200}'::jsonb||jsonb_build_object('lines',jsonb_build_array(o->'lines'->0));
 b=b||'{"id":"live-verify-car-b","itemId":"live-verify-car-b"}'::jsonb;
 perform public.blackline_checkout_live(credential,'create',jsonb_build_object('order',o,'bookings',jsonb_build_array(b)));
 perform public.blackline_checkout_live(credential,'attach','{"orderId":"BL-LIVE-VERIFY-B","sessionId":"cs_live_verifyB"}');
 perform public.blackline_checkout_live(credential,'expire','{"sessionId":"cs_live_verifyB"}');
 r=public.blackline_checkout_live(credential,'upgrade','{"sessionId":"cs_live_verifyB","orderId":"BL-LIVE-VERIFY-FULL"}');
 if r->>'paymentType'<>'full' or (r->>'amountDueCents')::bigint<>6000 then raise exception 'Live full-payment upgrade failed';end if;
 perform public.blackline_checkout_live(credential,'expire','{"sessionId":"cs_live_verifyB"}');
 if exists(select 1 from public.checkout_bookings where data->>'orderId'='BL-LIVE-VERIFY-FULL' and data->>'status'='cancelled') then raise exception 'Old webhook cancelled upgraded reservation';end if;
 perform public.blackline_checkout_live(credential,'attach','{"orderId":"BL-LIVE-VERIFY-FULL","sessionId":"cs_live_verifyFull"}');
 r=public.blackline_checkout_live(credential,'zelle','{"sessionId":"cs_live_verifyFull"}');
 if r->>'paymentMethod'<>'zelle' or (select count(*) from public.checkout_bookings where data->>'orderId'='BL-LIVE-VERIFY-FULL')<>1 then raise exception 'Zelle switch duplicated reservation';end if;
 -- A late paid session must record funds without claiming occupied inventory.
 o=o||'{"id":"BL-LIVE-VERIFY-LATE"}';b=b||'{"id":"live-verify-late","itemId":"live-verify-late"}';
 perform public.blackline_checkout_live(credential,'create',jsonb_build_object('order',o,'bookings',jsonb_build_array(b)));
 perform public.blackline_checkout_live(credential,'attach','{"orderId":"BL-LIVE-VERIFY-LATE","sessionId":"cs_live_verifyLate"}');
 perform public.blackline_checkout_live(credential,'expire','{"sessionId":"cs_live_verifyLate"}');
 insert into public.checkout_bookings(id,data) values('live-verify-competitor',b||'{"id":"live-verify-competitor","status":"owner_reserved"}');
 r=public.blackline_checkout_live(credential,'paid','{"sessionId":"cs_live_verifyLate","amountCents":1800,"currency":"usd","eventId":"evt_synthetic_late"}');
 if r->>'status'<>'payment_review' or (r->>'amountPaidCents')::bigint<>1800 then raise exception 'Late funds not recorded for manual review';end if;
 if has_table_privilege('anon','blackline_private.checkout_live_orders','select') or has_table_privilege('authenticated','blackline_private.checkout_live_orders','select') or has_function_privilege('anon','public.blackline_admin_live_orders()','execute') then raise exception 'Live private data exposed';end if;
 select jsonb_build_object('sub',u.id,'email',u.email,'role','authenticated') into claims from auth.users u join public.admin_members m on m.email=lower(u.email) limit 1;
 perform set_config('request.jwt.claims',claims::text,true);
 if not exists(select 1 from jsonb_array_elements(public.blackline_admin_live_orders()) x where x->'order'->>'id'='BL-LIVE-VERIFY-LATE') then raise exception 'Manual-review payment missing from dashboard';end if;
end $$;
rollback;
