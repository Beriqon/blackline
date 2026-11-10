begin;
create table blackline_private.balance_payments(id text primary key,data jsonb not null,image bytea,source text not null check(source in ('stripe','zelle')),order_id text not null,session_id text unique,unique(source,order_id));
alter table blackline_private.balance_payments enable row level security;
revoke all on blackline_private.balance_payments from public,anon,authenticated;
create or replace function public.blackline_balance(token text,operation text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r blackline_private.balance_payments; o jsonb; src text; oid text; paid bigint; remaining bigint; d jsonb;
begin
 if not exists(select 1 from blackline_private.server_credentials where digest=encode(extensions.digest(token,'sha256'),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
 if operation='create' then src=payload->>'source';oid=payload->>'orderId';
 else select * into r from blackline_private.balance_payments where (payload ? 'sessionId' and session_id=payload->>'sessionId') or (not(payload ? 'sessionId') and id=payload->>'id');if r.id is null then return null;end if;src=r.source;oid=r.order_id;end if;
 if src not in ('stripe','zelle') then raise exception 'Invalid payment source';end if;
 perform pg_advisory_xact_lock(hashtextextended('balance:'||src||':'||oid,0));
 if src='stripe' then select data into o from blackline_private.checkout_test_orders where id=oid for update;
 else select data into o from blackline_private.zelle_orders where id=oid for update;end if;
 if o is null or (src='stripe' and o->>'status'<>'deposit_paid') or (src='zelle' and o->>'status'<>'confirmed') then raise exception 'A confirmed booking is required';end if;
 paid=coalesce((o->>'amountPaidCents')::bigint,(o->>'amountDueCents')::bigint,(o->>'depositCents')::bigint);
 remaining=(o->>'knownTotalCents')::bigint-paid;
 select * into r from blackline_private.balance_payments where source=src and order_id=oid for update;
 if operation='create' then
  if remaining<=0 then raise exception 'This order is already paid in full';end if;
  if r.id is null then
   d=jsonb_build_object('id',payload->>'id','source',src,'orderId',oid,'status','open','amountCents',remaining,'attempt',1,'createdAtIso',now(),'expiresAtIso',now()+interval '30 days');
   insert into blackline_private.balance_payments(id,data,source,order_id) values(d->>'id',d,src,oid) returning * into r;
  else update blackline_private.balance_payments set data=data||jsonb_build_object('expiresAtIso',now()+interval '30 days') where id=r.id returning * into r;end if;
 elsif operation='get' then null;
 elsif operation='attach' then
  if src<>'stripe' or r.data->>'status'<>'open' or (r.session_id is not null and r.session_id<>payload->>'newSessionId') or (r.data->>'amountCents')::bigint<>remaining then raise exception 'Payment session cannot be attached';end if;
  update blackline_private.balance_payments set session_id=payload->>'newSessionId',data=data||jsonb_build_object('sessionId',payload->>'newSessionId','status','stripe_open') where id=r.id returning * into r;
 elsif operation='expire' then
  if r.data->>'status'='stripe_open' then update blackline_private.balance_payments set session_id=null,data=(data-'sessionId')||jsonb_build_object('status','open','attempt',(data->>'attempt')::int+1) where id=r.id returning * into r;end if;
 elsif operation='submit' then
  if src<>'zelle' or r.data->>'status' not in ('open','rejected') or (r.data->>'amountCents')::bigint<>remaining or (r.data->>'expiresAtIso')::timestamptz<=now() then raise exception 'This transfer cannot be submitted';end if;
  if length(coalesce(payload->>'imageBase64',''))<100 or length(payload->>'imageBase64')>2800000 then raise exception 'A screenshot is required';end if;
  update blackline_private.balance_payments set image=decode(payload->>'imageBase64','base64'),data=(data-'reviewNote')||jsonb_build_object('status','zelle_submitted','submittedAtIso',now()) where id=r.id returning * into r;
 elsif operation='evidence' then return case when r.image is null then null else jsonb_build_object('imageBase64',encode(r.image,'base64')) end;
 elsif operation in ('paid','confirm','reject') then
  if r.data->>'status'='paid' then return r.data||jsonb_build_object('order',o);end if;
  if operation='paid' then
   if src<>'stripe' or r.data->>'status'<>'stripe_open' or payload->>'currency' is distinct from 'usd' or (payload->>'amountCents')::bigint is distinct from (r.data->>'amountCents')::bigint then raise exception 'Payment mismatch';end if;
  else
   if src<>'zelle' or r.data->>'status'<>'zelle_submitted' or payload->>'bankChecked' is distinct from 'true' or r.image is null then raise exception 'Bank verification is required';end if;
   if operation='reject' then
    if length(trim(coalesce(payload->>'note','')))=0 then raise exception 'A rejection reason is required';end if;
    update blackline_private.balance_payments set data=data||jsonb_build_object('status','rejected','reviewNote',left(payload->>'note',2000)) where id=r.id returning * into r;
    return r.data||jsonb_build_object('order',o);
   end if;
  end if;
  if remaining is distinct from (r.data->>'amountCents')::bigint then raise exception 'Balance changed; manual review required';end if;
  o=o||jsonb_build_object('amountPaidCents',paid+remaining,'remainingCents',0,'balancePaidAtIso',now(),'paymentHistory',coalesce(o->'paymentHistory','[]'::jsonb)||jsonb_build_array(jsonb_build_object('amountCents',remaining,'method',case when src='stripe' then 'Stripe test' else 'Zelle' end,'paidAtIso',now(),'reference',r.id)));
  if src='stripe' then
   update blackline_private.checkout_test_orders set data=o,updated_at=now() where id=oid;
   update blackline_private.checkout_test_bookings set data=data||jsonb_build_object('status','paid') where id in(select jsonb_array_elements_text(o->'bookingIds'));
  else
   update blackline_private.zelle_orders set data=o,updated_at=now() where id=oid;
   update public.checkout_bookings set data=data||jsonb_build_object('status','paid') where id in(select jsonb_array_elements_text(o->'bookingIds'));
  end if;
  update blackline_private.balance_payments set data=data||jsonb_build_object('status','paid','paidAtIso',now(),'eventId',payload->>'eventId') where id=r.id returning * into r;
 else raise exception 'Unknown operation';end if;
 return r.data||jsonb_build_object('order',o);
end $$;
revoke all on function public.blackline_balance(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.blackline_balance(text,text,jsonb) to anon;
create or replace function public.blackline_admin_balances() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.is_blackline_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(data-'eventId') from blackline_private.balance_payments),'[]'::jsonb);
end $$;
revoke all on function public.blackline_admin_balances() from public,anon,authenticated;
grant execute on function public.blackline_admin_balances() to authenticated;
commit;
