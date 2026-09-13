-- Posto Control: banco online com Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('supervisor','manager')),
  station text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.profiles(id) on delete cascade,
  station text not null,
  sale_date date not null,
  common_liters numeric(12,2) not null default 0 check (common_liters >= 0),
  flex_liters numeric(12,2) not null default 0 check (flex_liters >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.manager_calls (
  id uuid primary key default gen_random_uuid(),
  station text not null,
  status text not null default 'pending' check (status in ('pending','responded')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.profiles(id) on delete cascade,
  station text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_config (
  key text primary key,
  value text not null
);

create or replace function public.is_supervisor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'supervisor'
  );
$$;

create or replace function public.my_station()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select station from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.sales enable row level security;
alter table public.manager_calls enable row level security;
alter table public.app_settings enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.push_config enable row level security;

revoke all on table public.profiles, public.sales, public.manager_calls, public.app_settings from anon;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.sales to authenticated;
grant select, insert, update on table public.manager_calls to authenticated;
grant select, insert, update on table public.app_settings to authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;
revoke all on table public.push_config from anon, authenticated;

drop policy if exists "profiles own or supervisor" on public.profiles;
create policy "profiles own or supervisor"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_supervisor());

drop policy if exists "sales supervisor sees all" on public.sales;
create policy "sales supervisor sees all"
on public.sales for select to authenticated
using (public.is_supervisor() or manager_id = auth.uid());

drop policy if exists "manager inserts own sales" on public.sales;
create policy "manager inserts own sales"
on public.sales for insert to authenticated
with check (
  manager_id = auth.uid()
  and station = public.my_station()
);

drop policy if exists "manager updates own sales" on public.sales;
create policy "manager updates own sales"
on public.sales for update to authenticated
using (public.is_supervisor() or manager_id = auth.uid())
with check (public.is_supervisor() or manager_id = auth.uid());

drop policy if exists "manager deletes own sales" on public.sales;
create policy "manager deletes own sales"
on public.sales for delete to authenticated
using (public.is_supervisor() or manager_id = auth.uid());

drop policy if exists "calls authenticated read" on public.manager_calls;
create policy "calls authenticated read"
on public.manager_calls for select to authenticated
using (true);

drop policy if exists "supervisor creates calls" on public.manager_calls;
create policy "supervisor creates calls"
on public.manager_calls for insert to authenticated
with check (public.is_supervisor());

drop policy if exists "supervisor updates calls" on public.manager_calls;
create policy "supervisor updates calls"
on public.manager_calls for update to authenticated
using (public.is_supervisor() or station = public.my_station())
with check (public.is_supervisor() or station = public.my_station());

drop policy if exists "settings authenticated read" on public.app_settings;
create policy "settings authenticated read"
on public.app_settings for select to authenticated
using (true);

drop policy if exists "settings supervisor write" on public.app_settings;
create policy "settings supervisor write"
on public.app_settings for insert to authenticated
with check (public.is_supervisor());

drop policy if exists "settings supervisor update" on public.app_settings;
create policy "settings supervisor update"
on public.app_settings for update to authenticated
using (public.is_supervisor())
with check (public.is_supervisor());

drop policy if exists "managers own push subscriptions" on public.push_subscriptions;
create policy "managers own push subscriptions"
on public.push_subscriptions for all to authenticated
using (manager_id = auth.uid())
with check (manager_id = auth.uid());

insert into public.app_settings(key,value)
values ('submission_deadline','18:00')
on conflict (key) do nothing;

create index if not exists sales_manager_id_idx on public.sales(manager_id);
create index if not exists sales_station_date_idx on public.sales(station, sale_date desc);
create index if not exists calls_station_created_idx on public.manager_calls(station, created_at desc);
create index if not exists push_subscriptions_manager_id_idx on public.push_subscriptions(manager_id);
create index if not exists push_subscriptions_station_idx on public.push_subscriptions(station);

alter publication supabase_realtime add table public.sales;
alter publication supabase_realtime add table public.manager_calls;
