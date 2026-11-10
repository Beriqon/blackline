begin;
do $$ declare token_value text='full-payment-transaction-test'; original jsonb; upgraded jsonb; again jsonb;
begin
 insert into blackline_private.server_credentials(digest) values(encode(extensions.digest(token_value,'sha256'),'hex'));
 original=jsonb_build_object('id','BL-FULL-VERIFY-ORIGINAL','testMode',true,'status','pending','createdAtIso',now(),'customerName','Full payment test','customerEmail','test@example.com','customerPhone','+12025550123','knownTotalCents',10000,'depositCents',3000,'remainingCents',7000,'bookingIds',jsonb_build_array('bk-full-verify-original'),'lines',jsonb_build_array(jsonb_build_object('productId','car','title','Synthetic car','totalCents',10000),jsonb_build_object('productId','villa','title','Synthetic villa','totalCents',null)));
 insert into blackline_private.checkout_test_orders(id,data,stripe_session_id) values(original->>'id',original,'cs_test_fullverifyoriginal');
 insert into blackline_private.checkout_test_bookings(id,data) values('bk-full-verify-original',jsonb_build_object('id','bk-full-verify-original','category','exotic-car','itemId','full-verification-resource','startIso','2099-08-01T10:00:00Z','endIso','2099-08-02T10:00:00Z','status','pending','holdUntilIso',now()+interval '30 minutes'));
 upgraded=public.blackline_full_checkout(token_value,jsonb_build_object('sessionId','cs_test_fullverifyoriginal','orderId','BL-FULL-VERIFY-NEW'));
 if upgraded->>'paymentType'<>'full' or (upgraded->>'amountDueCents')::bigint<>10000 or (upgraded->>'remainingCents')::bigint<>0 or jsonb_array_length(upgraded->'lines')<>2 then raise exception 'Full payment upgrade did not preserve amounts and quote lines'; end if;
 again=public.blackline_full_checkout(token_value,jsonb_build_object('sessionId','cs_test_fullverifyoriginal','orderId','BL-FULL-VERIFY-DUPLICATE'));
 if again->>'id'<>upgraded->>'id' then raise exception 'Upgrade retry duplicated order'; end if;
 if exists(select 1 from blackline_private.checkout_test_bookings where id='bk-full-verify-original' and data->>'status'<>'cancelled') then raise exception 'Previous hold was not released'; end if;
 perform public.blackline_checkout_order(token_value,'attach',jsonb_build_object('orderId',upgraded->>'id','sessionId','cs_test_fullverifynew'));
 begin perform public.blackline_checkout_order(token_value,'paid',jsonb_build_object('sessionId','cs_test_fullverifynew','amountCents',3000,'currency','usd'));raise exception 'Deposit accepted as full payment';exception when raise_exception then if sqlerrm='Deposit accepted as full payment' then raise;end if;end;
 upgraded=public.blackline_checkout_order(token_value,'paid',jsonb_build_object('sessionId','cs_test_fullverifynew','amountCents',10000,'currency','usd','eventId','evt_full_synthetic'));
 if upgraded->>'status'<>'deposit_paid' or exists(select 1 from blackline_private.checkout_test_bookings where id in(select jsonb_array_elements_text(upgraded->'bookingIds')) and data->>'status'<>'paid') then raise exception 'Full payment was not fulfilled'; end if;
end $$;
rollback;
