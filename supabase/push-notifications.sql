-- Applied through MCP. VAPID material is provisioned separately in Vault, never in source.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table public.admin_push_subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null unique, subscription jsonb not null, enabled boolean not null default true,
 updated_at timestamptz not null default now(), last_test_at timestamptz
);
alter table public.admin_push_subscriptions enable row level security;
revoke all on public.admin_push_subscriptions from anon, authenticated;
grant select on public.admin_push_subscriptions to authenticated;
create index admin_push_user on public.admin_push_subscriptions(user_id);
create policy own_admin_devices on public.admin_push_subscriptions for select to authenticated
 using (user_id=(select auth.uid()) and (select public.is_blackline_admin()));

create table blackline_private.push_deliveries (
 id uuid primary key default gen_random_uuid(), subscription_id uuid not null references public.admin_push_subscriptions(id) on delete cascade,
 event_key text not null, payload jsonb not null, created_at timestamptz not null default now(),
 available_at timestamptz not null default now(), attempts integer not null default 0,
 lease uuid, done boolean not null default false, last_status integer,
 unique(subscription_id,event_key)
);
alter table blackline_private.push_deliveries enable row level security;
create index push_pending on blackline_private.push_deliveries(available_at) where not done;

create function public.blackline_push_device(action text, input jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); ep text:=input->>'endpoint'; cfg jsonb; device public.admin_push_subscriptions; key text;
begin
 if uid is null or not public.is_blackline_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if action='config' then
  select decrypted_secret::jsonb into cfg from vault.decrypted_secrets where name='blackline_push_config';
  return jsonb_build_object('publicKey',cfg->>'publicKey','configured',cfg is not null);
 end if;
 if action='subscribe' then
  ep:=input->'subscription'->>'endpoint';
  if ep is null or length(ep)>2048 or ep !~ '^https://(fcm[.]googleapis[.]com|updates[.]push[.]services[.]mozilla[.]com|web[.]push[.]apple[.]com|[a-z0-9-]+[.]notify[.]windows[.]com)/' then raise exception 'Unsupported push service'; end if;
  if coalesce(input->'subscription'->'keys'->>'p256dh','') !~ '^[A-Za-z0-9_-]{87}={0,2}$'
   or coalesce(input->'subscription'->'keys'->>'auth','') !~ '^[A-Za-z0-9_-]{22}={0,2}$' then raise exception 'Invalid subscription keys'; end if;
  if exists(select 1 from public.admin_push_subscriptions where endpoint=ep and user_id<>uid) then raise exception 'Device belongs to another account'; end if;
  if (select count(*) from public.admin_push_subscriptions where user_id=uid)>=20 and not exists(select 1 from public.admin_push_subscriptions where endpoint=ep and user_id=uid) then raise exception 'Device limit reached'; end if;
  insert into public.admin_push_subscriptions(user_id,endpoint,subscription) values(uid,ep,input->'subscription')
   on conflict(endpoint) do update set subscription=excluded.subscription,enabled=true,updated_at=now();
  return jsonb_build_object('enabled',true);
 end if;
 select * into device from public.admin_push_subscriptions where endpoint=ep and user_id=uid for update;
 if action='status' then return jsonb_build_object('enabled',coalesce(device.enabled,false)); end if;
 if action='disable' then
  update public.admin_push_subscriptions set enabled=false,updated_at=now() where id=device.id;
  update blackline_private.push_deliveries set done=true where subscription_id=device.id and not done;
  return jsonb_build_object('enabled',false);
 end if;
 if action='test' then
  if device.id is null or not device.enabled then raise exception 'Enable notifications on this device first'; end if;
  if device.last_test_at>now()-interval '60 seconds' then raise exception 'Wait a minute before sending another test'; end if;
  update public.admin_push_subscriptions set last_test_at=now() where id=device.id;
  key:='test:'||gen_random_uuid()::text;
  insert into blackline_private.push_deliveries(subscription_id,event_key,payload) values(device.id,key,
   jsonb_build_object('title','Blackline notifications are connected','body','This device can receive booking alerts.','url','/admin/dashboard?view=settings&section=notifications','tag',key));
  return jsonb_build_object('queued',true);
 end if;
 raise exception 'Unknown push action';
end $$;
revoke all on function public.blackline_push_device(text,jsonb) from public,anon;
grant execute on function public.blackline_push_device(text,jsonb) to authenticated;

create function blackline_private.queue_booking_push() returns trigger language plpgsql security definer set search_path='' as $$
declare title text:='New booking received'; destination text:='/admin/dashboard?view=bookings'; event text:=tg_table_name||':'||new.id;
begin
 if tg_table_name='checkout_bookings' then
  if coalesce(new.data->>'status','') not in ('paid','deposit_paid','owner_reserved') then return new; end if;
  if tg_op='UPDATE' and coalesce(old.data->>'status','') in ('paid','deposit_paid','owner_reserved') then return new; end if;
 elsif tg_table_name='quote_requests' then title:='New booking request received';
 elsif coalesce(new.data->>'status','')='Cancelled' then return new;
 end if;
 insert into blackline_private.push_deliveries(subscription_id,event_key,payload)
 select s.id,event,jsonb_build_object('title',title,'body','Open your secure Blackline dashboard to view the details.','url',destination,'tag',event)
 from public.admin_push_subscriptions s join auth.users u on u.id=s.user_id
 join public.admin_members m on m.email=lower(u.email)
 where s.enabled and u.email_confirmed_at is not null
 on conflict(subscription_id,event_key) do nothing;
 return new;
end $$;
revoke all on function blackline_private.queue_booking_push() from public,anon,authenticated;
create trigger booking_push after insert on public.bookings for each row execute function blackline_private.queue_booking_push();
create trigger checkout_push after insert or update of data on public.checkout_bookings for each row execute function blackline_private.queue_booking_push();
create trigger request_push after insert on public.quote_requests for each row execute function blackline_private.queue_booking_push();

-- Service-role-only RPC; the Edge Function authenticates its scheduler before claiming work.
create function public.blackline_push_worker(action text, input jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if action='config' then
  select decrypted_secret::jsonb into result from vault.decrypted_secrets where name='blackline_push_config'; return result;
 elsif action='claim' then
  update blackline_private.push_deliveries d set done=true where not done and (created_at<now()-interval '24 hours' or attempts>=6 or not exists(select 1 from public.admin_push_subscriptions s join auth.users u on u.id=s.user_id join public.admin_members m on m.email=lower(u.email) where s.id=d.subscription_id and s.enabled and u.email_confirmed_at is not null));
  with picked as (select id from blackline_private.push_deliveries where not done and available_at<=now() order by created_at for update skip locked limit 20),
  claimed as (update blackline_private.push_deliveries d set lease=gen_random_uuid(),available_at=now()+interval '5 minutes',attempts=attempts+1 from picked p where d.id=p.id returning d.*)
  select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'lease',d.lease,'payload',d.payload,'subscription',s.subscription,'subscriptionId',s.id)),'[]'::jsonb) into result from claimed d join public.admin_push_subscriptions s on s.id=d.subscription_id;
  return result;
 elsif action='finish' then
  update blackline_private.push_deliveries set done=coalesce((input->>'done')::boolean,false),last_status=(input->>'status')::integer,available_at=now()+interval '2 minutes'
   where id=(input->>'id')::uuid and lease=(input->>'lease')::uuid;
  if input->>'status' in ('404','410') then
   update public.admin_push_subscriptions set enabled=false where id=(select subscription_id from blackline_private.push_deliveries where id=(input->>'id')::uuid and lease=(input->>'lease')::uuid);
  end if;
  return '{}'::jsonb;
 end if;
 raise exception 'Unknown worker action';
end $$;
revoke all on function public.blackline_push_worker(text,jsonb) from public,anon,authenticated;
grant execute on function public.blackline_push_worker(text,jsonb) to service_role;

create function blackline_private.dispatch_push() returns void language plpgsql security definer set search_path='' as $$
declare cfg jsonb;
begin
 delete from blackline_private.push_deliveries where created_at<now()-interval '7 days';
 if not exists(select 1 from blackline_private.push_deliveries where not done and available_at<=now()) then return; end if;
 select decrypted_secret::jsonb into cfg from vault.decrypted_secrets where name='blackline_push_config';
 if cfg is null then return; end if;
 perform net.http_post(url:='https://hlalndhldrjcnohuegiw.supabase.co/functions/v1/booking-push',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(cfg->>'dispatchSecret')),body:='{}'::jsonb,timeout_milliseconds:=10000);
end $$;
revoke all on function blackline_private.dispatch_push() from public,anon,authenticated;
select cron.schedule('blackline-booking-push','* * * * *','select blackline_private.dispatch_push()');
