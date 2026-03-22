alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text;

do $$
begin
  if to_regclass('public.orders') is not null then
    update public.profiles p
    set phone = recent.customer_phone
    from (
      select distinct on (user_id)
        user_id,
        customer_phone
      from public.orders
      where customer_phone is not null
        and trim(customer_phone) <> ''
      order by user_id, created_at desc
    ) recent
    where p.id = recent.user_id
      and (p.phone is null or trim(p.phone) = '');
  end if;
end
$$;
