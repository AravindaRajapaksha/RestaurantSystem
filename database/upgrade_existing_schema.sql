create extension if not exists pgcrypto;

alter table public.foods
  add column if not exists offer_title text,
  add column if not exists offer_description text,
  add column if not exists discount_percent numeric(5,2),
  add column if not exists is_featured_offer boolean not null default false;

alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

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

alter table public.orders
  add column if not exists order_number text,
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists subtotal numeric(10,2) not null default 0,
  add column if not exists delivery_fee numeric(10,2) not null default 0,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.orders
set
  order_number = coalesce(order_number, 'ORD-' || lpad(id::text, 6, '0')),
  customer_name = coalesce(customer_name, 'Customer'),
  customer_email = coalesce(customer_email, ''),
  customer_phone = coalesce(customer_phone, phone, ''),
  subtotal = coalesce(subtotal, total, 0),
  delivery_fee = coalesce(delivery_fee, 0)
where
  order_number is null
  or customer_name is null
  or customer_email is null
  or customer_phone is null
  or subtotal is null
  or delivery_fee is null;

alter table public.orders
  alter column order_number set not null,
  alter column customer_name set not null,
  alter column customer_email set not null,
  alter column customer_phone set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_order_number_key'
  ) then
    alter table public.orders
      add constraint orders_order_number_key unique (order_number);
  end if;
end
$$;

alter table public.order_items
  add column if not exists item_name text,
  add column if not exists item_image text,
  add column if not exists unit_price numeric(10,2),
  add column if not exists line_total numeric(10,2);

update public.order_items oi
set
  item_name = coalesce(oi.item_name, f.name, 'Menu item'),
  item_image = coalesce(oi.item_image, f.image),
  unit_price = coalesce(oi.unit_price, oi.price, 0),
  line_total = coalesce(oi.line_total, coalesce(oi.price, 0) * oi.quantity)
from public.foods f
where oi.food_id = f.id
  and (
    oi.item_name is null
    or oi.item_image is null
    or oi.unit_price is null
    or oi.line_total is null
  );

update public.order_items
set
  item_name = coalesce(item_name, 'Menu item'),
  unit_price = coalesce(unit_price, price, 0),
  line_total = coalesce(line_total, coalesce(price, 0) * quantity)
where item_name is null or unit_price is null or line_total is null;

alter table public.order_items
  alter column item_name set not null,
  alter column unit_price set not null,
  alter column line_total set not null;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'phone_number'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'customer'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.foods enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view available foods" on public.foods;
create policy "Public can view available foods"
  on public.foods
  for select
  using (is_available = true or public.is_admin());

drop policy if exists "Admins can insert foods" on public.foods;
create policy "Admins can insert foods"
  on public.foods
  for insert
  with check (public.is_admin());

drop policy if exists "Admins can update foods" on public.foods;
create policy "Admins can update foods"
  on public.foods
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete foods" on public.foods;
create policy "Admins can delete foods"
  on public.foods
  for delete
  using (public.is_admin());

drop policy if exists "Users can view profiles" on public.profiles;
create policy "Users can view profiles"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert profiles" on public.profiles;
create policy "Users can insert profiles"
  on public.profiles
  for insert
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update profiles" on public.profiles;
create policy "Users can update profiles"
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders
  for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders
  for insert
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders
  for delete
  using (public.is_admin());

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = public.order_items.order_id
        and (public.orders.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Users can insert own order items" on public.order_items;
create policy "Users can insert own order items"
  on public.order_items
  for insert
  with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = public.order_items.order_id
        and (public.orders.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Admins can update order items" on public.order_items;
create policy "Admins can update order items"
  on public.order_items
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete order items" on public.order_items;
create policy "Admins can delete order items"
  on public.order_items
  for delete
  using (public.is_admin());
