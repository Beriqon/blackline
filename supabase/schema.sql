-- Blackline workspace. Applied to the linked project through the Supabase MCP.
create schema if not exists blackline_private;
revoke all on schema blackline_private from public, anon, authenticated;
create table public.admin_members (email text primary key check(email = lower(email)));
alter table public.admin_members enable row level security;
grant select on public.admin_members to authenticated;
create policy member_self on public.admin_members for select to authenticated using (email = lower((select auth.jwt()->>'email')));
insert into public.admin_members(email) values ('blackline235@gmail.com');
create function public.is_blackline_admin() returns boolean language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.admin_members where email = lower((select auth.jwt()->>'email')))
$$;
revoke all on function public.is_blackline_admin() from public;
grant execute on function public.is_blackline_admin() to authenticated;

create function public.blackline_touch() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = clock_timestamp(); return new; end $$;

create table public.products (
 id text primary key, data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id),
 service text generated always as (data->>'service') stored,
 status text generated always as (data->>'status') stored check(status in ('visible','hidden','archived')),
 updated_at timestamptz not null default now(),
 check ((data->>'price')::numeric >= 0), check(length(data->>'name') > 0)
);
create index products_service_status on public.products(service,status);
create table public.bookings (id text primary key, data jsonb not null check(data->>'id'=id and jsonb_typeof(data->'items')='array' and jsonb_array_length(data->'items')>0), updated_at timestamptz not null default now());
create table public.customers (id text primary key, data jsonb not null check(data->>'id'=id), updated_at timestamptz not null default now());
create unique index customers_email on public.customers(lower(data->>'email')) where length(data->>'email')>0;
create table public.affiliates (id text primary key, data jsonb not null check(data->>'id'=id), updated_at timestamptz not null default now());
create table public.site_settings (id text primary key check(id in ('promotion','business','workspace')), data jsonb not null, updated_at timestamptz not null default now());
create table public.photo_galleries (id text primary key, data jsonb not null check(jsonb_typeof(data)='array'), updated_at timestamptz not null default now());
create table public.checkout_bookings (id text primary key, data jsonb not null check(data->>'id'=id), updated_at timestamptz not null default now());
create table public.quote_requests (id text primary key, data jsonb not null check(data->>'id'=id), updated_at timestamptz not null default now());
do $$ declare t text; begin
 foreach t in array array['products','bookings','customers','affiliates','site_settings','photo_galleries','checkout_bookings','quote_requests'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 execute format('create policy admin_all on public.%I for all to authenticated using ((select public.is_blackline_admin())) with check ((select public.is_blackline_admin()))',t);
 execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.blackline_touch()',t);
 end loop;
end $$;
grant select on public.products,public.photo_galleries,public.site_settings to anon;
create policy published_products on public.products for select to anon,authenticated using (status='visible');
create policy published_settings on public.site_settings for select to anon,authenticated using (id = 'promotion');
create policy published_galleries on public.photo_galleries for select to anon,authenticated using (true);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('website-media','website-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif','image/gif']);
create policy admin_media on storage.objects for all to authenticated using (bucket_id='website-media' and (select public.is_blackline_admin())) with check (bucket_id='website-media' and (select public.is_blackline_admin()));

-- A scoped server credential for checkout/quote APIs, never available in the browser.
create table blackline_private.server_credentials (digest text primary key);
create function public.blackline_server_request(token text, operation text, payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb; item jsonb; existing jsonb; category text; item_id text;
begin
 if not exists(select 1 from blackline_private.server_credentials where digest=encode(extensions.digest(token,'sha256'),'hex')) then raise exception 'Unauthorized' using errcode='42501'; end if;
 if operation='list_checkout' then select coalesce(jsonb_agg(data),'[]'::jsonb) into result from public.checkout_bookings; return result;
 elsif operation='list_quotes' then select coalesce(jsonb_agg(data),'[]'::jsonb) into result from public.quote_requests; return result;
 elsif operation='save_quote' then
  insert into public.quote_requests(id,data) values(payload->>'id',payload) on conflict(id) do update set data=excluded.data; return payload;
 elsif operation='delete_quote' then delete from public.quote_requests where id=payload->>'id'; return '{}'::jsonb;
 elsif operation='save_checkout' then
  category=payload->>'category'; item_id=payload->>'itemId';
  perform pg_advisory_xact_lock(hashtextextended(category||':'||item_id,0));
  if (payload->>'status') <> 'cancelled' and ((payload->>'status') <> 'pending' or (payload->>'holdUntilIso')::timestamptz>now()) then
   if exists(select 1 from public.checkout_bookings b where b.id<>payload->>'id' and b.data->>'category'=category and b.data->>'itemId'=item_id and b.data->>'status'<>'cancelled' and (b.data->>'status'<>'pending' or (b.data->>'holdUntilIso')::timestamptz>now()) and (b.data->>'startIso')::timestamptz < (payload->>'endIso')::timestamptz and (b.data->>'endIso')::timestamptz > (payload->>'startIso')::timestamptz) then raise exception 'This time slot is no longer available.'; end if;
  end if;
  insert into public.checkout_bookings(id,data) values(payload->>'id',payload) on conflict(id) do update set data=excluded.data; return payload;
 elsif operation='delete_checkout' then delete from public.checkout_bookings where id=payload->>'id'; return '{}'::jsonb;
 elsif operation='expire_checkout' then update public.checkout_bookings set data=jsonb_set(data,'{status}','"cancelled"') where data->>'status'='pending' and (data->>'holdUntilIso')::timestamptz<=now(); return '{}'::jsonb;
 elsif operation='attach_session' then
  update public.checkout_bookings set data=data||jsonb_build_object('stripeSessionId',payload->>'stripeSessionId') where id in(select jsonb_array_elements_text(payload->'bookingIds')); return '{}'::jsonb;
 elsif operation='finalize_session' then
  if payload->>'status' not in ('paid','deposit_paid') then raise exception 'Invalid payment status'; end if;
  update public.checkout_bookings set data=(data-'holdUntilIso')||jsonb_build_object('status',payload->>'status') where data->>'stripeSessionId'=payload->>'stripeSessionId'; return '{}'::jsonb;
 else raise exception 'Unknown operation'; end if;
end $$;
revoke all on function public.blackline_server_request(text,text,jsonb) from public, authenticated;
grant execute on function public.blackline_server_request(text,text,jsonb) to anon;
-- Browser users cannot execute server operations; only the secret token authorizes them.
