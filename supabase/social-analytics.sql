create table if not exists public.social_connections (
  provider text primary key check (provider in ('instagram', 'tiktok')),
  sealed_tokens text not null,
  refresh_lock uuid,
  refresh_until timestamptz,
  check ((refresh_lock is null) = (refresh_until is null))
);

alter table public.social_connections enable row level security;
revoke all on public.social_connections from public, anon, authenticated;
grant select, insert, update, delete on public.social_connections to authenticated;

drop policy if exists social_connections_admin_access on public.social_connections;
create policy social_connections_admin_access on public.social_connections
  for all to authenticated
  using ((select public.is_blackline_admin()))
  with check ((select public.is_blackline_admin()));
