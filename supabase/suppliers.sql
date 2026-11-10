-- Supplier management: apply once to the linked Blackline project.
-- Uses the same approved-administrator access model as the other workspace tables.
begin;
create table public.suppliers (
 id text primary key,
 data jsonb not null check (
  jsonb_typeof(data)='object'
  and data ?& array['id','company','status','rates']
  and data->>'id'=id
  and length(trim(data->>'company'))>0
  and data->>'status' in ('Active','Inactive')
  and jsonb_typeof(data->'rates')='array'
 ),
 updated_at timestamptz not null default now()
);
alter table public.suppliers enable row level security;
revoke all on public.suppliers from public,anon,authenticated;
grant select,insert,update on public.suppliers to authenticated;
create policy suppliers_admin_access on public.suppliers for all to authenticated
 using ((select public.is_blackline_admin()))
 with check ((select public.is_blackline_admin()));
create trigger touch_updated_at before update on public.suppliers
 for each row execute function public.blackline_touch();
commit;
