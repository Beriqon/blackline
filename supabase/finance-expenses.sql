-- Apply to the Blackline project after schema.sql.
begin;
create table public.finance_expenses (
  id text primary key,
  data jsonb not null check (
    jsonb_typeof(data) = 'object'
    and data ?& array['id','description','category','amountCents','date']
    and data->>'id' = id
    and jsonb_typeof(data->'description') = 'string'
    and length(trim(data->>'description')) between 1 and 160
    and jsonb_typeof(data->'category') = 'string'
    and length(trim(data->>'category')) between 1 and 60
    and jsonb_typeof(data->'amountCents') = 'number'
    and (data->>'amountCents') ~ '^[1-9][0-9]{0,10}$'
    and jsonb_typeof(data->'date') = 'string'
    and (data->>'date') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and (data->>'date')::date is not null
  ),
  updated_at timestamptz not null default now()
);
alter table public.finance_expenses enable row level security;
revoke all on public.finance_expenses from public, anon, authenticated;
grant select, insert, update on public.finance_expenses to authenticated;
create policy finance_expenses_admin_access on public.finance_expenses for all to authenticated
  using ((select public.is_blackline_admin()))
  with check ((select public.is_blackline_admin()));
create trigger touch_updated_at before update on public.finance_expenses
  for each row execute function public.blackline_touch();
commit;
