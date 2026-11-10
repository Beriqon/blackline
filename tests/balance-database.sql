-- Synthetic verification only. Every change is rolled back.
begin;
do $$
declare token_value text='balance-transaction-verification';o jsonb;r jsonb;a jsonb;
begin
 insert into blackline_private.server_credentials(digest) values(encode(extensions.digest(token_value,'sha256'),'hex'));
 o=jsonb_build_object('id','BL-BALANCE-VERIFY','testMode',true,'status','deposit_paid','customerName','Balance verification','customerEmail','test@example.com','knownTotalCents',10000,'depositCents',3000,'remainingCents',7000,'bookingIds','[]'::jsonb,'lines',jsonb_build_array(jsonb_build_object('productId','car','totalCents',10000),jsonb_build_object('productId','villa','totalCents',null)));
 insert into blackline_private.checkout_test_orders(id,data) values(o->>'id',o);
 begin perform public.blackline_balance('invalid','create','{}');raise exception 'Invalid credential accepted';exception when insufficient_privilege then null;end;
 r=public.blackline_balance(token_value,'create','{"source":"stripe","orderId":"BL-BALANCE-VERIFY","id":"balance-verification"}');
 if (r->>'amountCents')::bigint<>7000 then raise exception 'Incorrect balance';end if;
 a=public.blackline_balance(token_value,'create','{"source":"stripe","orderId":"BL-BALANCE-VERIFY","id":"duplicate-link"}');
 if a->>'id'<>r->>'id' then raise exception 'Duplicate balance link';end if;
 perform public.blackline_balance(token_value,'attach','{"id":"balance-verification","newSessionId":"cs_test_balanceverifyexpired"}');
 perform public.blackline_balance(token_value,'expire','{"sessionId":"cs_test_balanceverifyexpired"}');
 if (select data->>'status' from blackline_private.checkout_test_orders where id='BL-BALANCE-VERIFY')<>'deposit_paid' then raise exception 'Expiry cancelled initial booking';end if;
 perform public.blackline_balance(token_value,'attach','{"id":"balance-verification","newSessionId":"cs_test_balanceverify"}');
 begin perform public.blackline_balance(token_value,'paid','{"sessionId":"cs_test_balanceverify","amountCents":100,"currency":"usd"}');raise exception 'Wrong amount accepted';exception when raise_exception then if sqlerrm='Wrong amount accepted' then raise;end if;end;
 r=public.blackline_balance(token_value,'paid','{"sessionId":"cs_test_balanceverify","amountCents":7000,"currency":"usd","eventId":"evt_balance_verify"}');
 a=public.blackline_balance(token_value,'paid','{"sessionId":"cs_test_balanceverify","amountCents":7000,"currency":"usd","eventId":"evt_balance_retry"}');
 if (a->'order'->>'amountPaidCents')::bigint<>10000 or (a->'order'->>'remainingCents')::bigint<>0 or jsonb_array_length(a->'order'->'paymentHistory')<>1 or jsonb_array_length(a->'order'->'lines')<>2 then raise exception 'Full settlement or idempotency failed';end if;
 begin perform public.blackline_balance(token_value,'create','{"source":"stripe","orderId":"BL-BALANCE-VERIFY","id":"extra-charge"}');raise exception 'Paid order can be charged again';exception when raise_exception then if sqlerrm='Paid order can be charged again' then raise;end if;end;
 o=(o-'testMode')||jsonb_build_object('id','BL-BALANCE-ZELLE-VERIFY','testMode',false,'status','confirmed');
 insert into blackline_private.zelle_orders(id,data) values(o->>'id',o);
 perform public.blackline_balance(token_value,'create','{"source":"zelle","orderId":"BL-BALANCE-ZELLE-VERIFY","id":"balance-zelle-verification"}');
 r=public.blackline_balance(token_value,'submit',jsonb_build_object('id','balance-zelle-verification','imageBase64',repeat('AAAA',100)));
 if r->>'status'<>'zelle_submitted' or (r->'order'->>'remainingCents')::bigint<>7000 then raise exception 'Screenshot counted as paid';end if;
 begin perform public.blackline_balance(token_value,'confirm','{"id":"balance-zelle-verification"}');raise exception 'Unchecked bank accepted';exception when raise_exception then if sqlerrm='Unchecked bank accepted' then raise;end if;end;
 r=public.blackline_balance(token_value,'reject','{"id":"balance-zelle-verification","bankChecked":true,"note":"Synthetic bank check"}');
 if r->'order'->>'status'<>'confirmed' then raise exception 'Rejected balance cancelled confirmed reservation';end if;
 perform public.blackline_balance(token_value,'submit',jsonb_build_object('id','balance-zelle-verification','imageBase64',repeat('AAAA',100)));
 r=public.blackline_balance(token_value,'confirm','{"id":"balance-zelle-verification","bankChecked":true}');
 if (r->'order'->>'amountPaidCents')::bigint<>10000 or (r->'order'->>'remainingCents')::bigint<>0 then raise exception 'Verified Zelle balance not settled';end if;
 if has_table_privilege('anon','blackline_private.balance_payments','select') or has_table_privilege('authenticated','blackline_private.balance_payments','select') or has_function_privilege('anon','public.blackline_admin_balances()','execute') then raise exception 'Private balance data exposed';end if;
end $$;
rollback;
