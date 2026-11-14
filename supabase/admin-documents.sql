create table public.admin_documents (
  id uuid primary key,
  name text not null check (char_length(trim(name)) between 1 and 160),
  folder text not null check (folder in ('contracts','invoices','suppliers','company','bookings','templates')),
  context text not null check (context in ('Business','Booking','Supplier','Broker')),
  reference text not null default '' check (char_length(reference) <= 200),
  description text not null default '' check (char_length(description) <= 2000),
  format text not null check (format in ('PDF','DOCX','XLSX')),
  status text not null check (status in ('Signed','Filed','Draft','Needs review')),
  created_at timestamptz not null default now()
);

alter table public.admin_documents enable row level security;
revoke all on public.admin_documents from public, anon, authenticated;
grant select, insert on public.admin_documents to authenticated;

create policy admin_documents_read on public.admin_documents
  for select to authenticated using ((select public.is_blackline_admin()));
create policy admin_documents_create on public.admin_documents
  for insert to authenticated with check ((select public.is_blackline_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('admin-documents', 'admin-documents', false, 6291456, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

create policy admin_documents_file_read on storage.objects
  for select to authenticated
  using (bucket_id = 'admin-documents' and (select public.is_blackline_admin()));
create policy admin_documents_file_upload on storage.objects
  for insert to authenticated
  with check (bucket_id = 'admin-documents' and (select public.is_blackline_admin()));
create policy admin_documents_file_cleanup on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'admin-documents' and (select public.is_blackline_admin())
    and not exists (
      select 1 from public.admin_documents d where d.id::text = objects.name
    )
  );
