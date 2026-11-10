create or replace function public.blackline_check_reservation() returns trigger language plpgsql security invoker set search_path='' as $$
declare entry jsonb; other jsonb; pid text; starts timestamptz; ends timestamptz; lock_ids text[];
begin
 if tg_table_name='bookings' then
  if new.data->>'status' not in ('Pending','Confirmed') then return new; end if;
  select array_agg(distinct replace(e->>'productId','catalog:chauffeur-services:','catalog:exotic-cars:') order by replace(e->>'productId','catalog:chauffeur-services:','catalog:exotic-cars:')) into lock_ids from jsonb_array_elements(new.data->'items') e where length(replace(e->>'productId','catalog:chauffeur-services:','catalog:exotic-cars:'))>0;
 else
  if new.data->>'status'='cancelled' or (new.data->>'status'='pending' and (new.data->>'holdUntilIso')::timestamptz<=now()) then return new; end if;
  lock_ids=array[coalesce(new.data->>'resourceId','catalog:'||case when new.data->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(new.data->>'itemId'))];
 end if;
 if lock_ids is null then return new; end if;
 foreach pid in array lock_ids loop perform pg_advisory_xact_lock(hashtextextended(pid,0)); end loop;
 for entry in select value from jsonb_array_elements(case when tg_table_name='bookings' then new.data->'items' else jsonb_build_array(jsonb_build_object('productId',lock_ids[1],'start',new.data->>'startIso','end',new.data->>'endIso')) end) loop
  pid=replace(entry->>'productId','catalog:chauffeur-services:','catalog:exotic-cars:'); if pid is null or pid='' then continue; end if;
  starts=(entry->>'start')::timestamptz; ends=(entry->>'end')::timestamptz;
  if ends<=starts then raise exception 'Booking end must be after start'; end if;
  if exists(select 1 from public.bookings b cross join lateral jsonb_array_elements(b.data->'items') i where (tg_table_name<>'bookings' or b.id<>new.id) and b.data->>'status' in ('Pending','Confirmed') and replace(i->>'productId','catalog:chauffeur-services:','catalog:exotic-cars:')=pid and (i->>'start')::timestamptz<ends and (i->>'end')::timestamptz>starts) then raise exception 'This product already has a booking for these dates.'; end if;
  if exists(select 1 from public.checkout_bookings b where (tg_table_name<>'checkout_bookings' or b.id<>new.id) and coalesce(b.data->>'resourceId','catalog:'||case when b.data->>'category'='yacht' then 'yachts' else 'exotic-cars' end||':'||(b.data->>'itemId'))=pid and b.data->>'status'<>'cancelled' and (b.data->>'status'<>'pending' or (b.data->>'holdUntilIso')::timestamptz>now()) and (b.data->>'startIso')::timestamptz<ends and (b.data->>'endIso')::timestamptz>starts) then raise exception 'This product already has an online reservation for these dates.'; end if;
 end loop;
 return new;
end $$;
