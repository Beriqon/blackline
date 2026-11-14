create table public.email_templates (
 id text primary key,
 data jsonb not null check (
  jsonb_typeof(data) = 'object'
  and data ?& array['id','kind','name','blocks']
  and data->>'id' = id
  and data->>'kind' = 'template'
  and length(trim(data->>'name')) > 0
  and jsonb_typeof(data->'blocks') = 'array'
 ),
 updated_at timestamptz not null default now()
);
alter table public.email_templates enable row level security;
revoke all on public.email_templates from public, anon, authenticated;
grant select, insert, update on public.email_templates to authenticated;
create policy email_templates_admin_access on public.email_templates
 for all to authenticated
 using ((select public.is_blackline_admin()))
 with check ((select public.is_blackline_admin()));
create trigger touch_updated_at before update on public.email_templates
 for each row execute function public.blackline_touch();
