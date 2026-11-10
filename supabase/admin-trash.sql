-- Recoverable workspace deletion; underlying payments and inventory are untouched.
begin;
create table public.admin_trash (
 id text primary key,
 data jsonb not null check (data->>'kind' in ('booking','customer') and data->>'id'=id),
 updated_at timestamptz not null default now()
);
alter table public.admin_trash enable row level security;
create trigger touch_updated_at before update on public.admin_trash for each row execute function public.blackline_touch();
revoke all on public.admin_trash from public,anon,authenticated;
grant select,insert,update,delete on public.admin_trash to authenticated;
create policy admin_trash_access on public.admin_trash for all to authenticated
 using ((select public.is_blackline_admin())) with check ((select public.is_blackline_admin()));
commit;
