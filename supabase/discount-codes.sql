begin;
create table public.discount_codes (
  id text primary key check (id ~ '^[A-Z0-9][A-Z0-9_-]{2,29}$'),
  kind text not null check (kind in ('percent', 'fixed')),
  amount integer not null check (amount > 0 and ((kind = 'percent' and amount < 100) or (kind = 'fixed' and amount <= 50000000))),
  expires_on date,
  active boolean not null default true
);
alter table public.discount_codes enable row level security;
revoke all on public.discount_codes from public, anon, authenticated;
grant select, insert, update on public.discount_codes to authenticated;
create policy discount_codes_admin on public.discount_codes for all to authenticated
  using ((select public.is_blackline_admin())) with check ((select public.is_blackline_admin()));

create function public.blackline_checkout_discount(token text, code text)
returns table (kind text, amount integer)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from blackline_private.server_credentials
    where digest = encode(extensions.digest(token, 'sha256'), 'hex')
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  return query select d.kind, d.amount from public.discount_codes d
    where d.id = code and d.active
      and (d.expires_on is null or d.expires_on >= (now() at time zone 'America/New_York')::date);
end;
$$;
revoke all on function public.blackline_checkout_discount(text, text) from public;
grant execute on function public.blackline_checkout_discount(text, text) to anon;
commit;
