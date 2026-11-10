-- Admin-only read access to the existing authoritative test orders.
-- No copies, no new bookings, and no changes to production availability.
begin;
create or replace function public.blackline_admin_checkout_orders()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.is_blackline_admin() then
  raise exception 'Administrator access required' using errcode='42501';
 end if;
 return coalesce((
  select jsonb_agg(jsonb_build_object(
   'order',o.data - 'stripeEventId' - 'stripeSessionId',
   'bookings',coalesce((select jsonb_agg(jsonb_build_object(
    'id',b.id,'itemId',b.data->>'itemId','category',b.data->>'category',
    'service',b.data->>'service','startIso',b.data->>'startIso','endIso',b.data->>'endIso'
   ) order by array_position(array(select jsonb_array_elements_text(o.data->'bookingIds')),b.id)) from blackline_private.checkout_test_bookings b
   where b.id in (select jsonb_array_elements_text(o.data->'bookingIds'))),'[]'::jsonb)
  ) order by o.updated_at desc)
  from blackline_private.checkout_test_orders o
  where o.data->>'testMode'='true' and o.data->>'status'='deposit_paid'
 ),'[]'::jsonb);
end $$;
revoke all on function public.blackline_admin_checkout_orders() from public,anon,authenticated;
grant execute on function public.blackline_admin_checkout_orders() to authenticated;
commit;
