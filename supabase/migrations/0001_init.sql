-- ============================================================================
-- Cab Booking Platform — Initial Schema (Stage 2 design)
-- ============================================================================

-- ---------- Enums ----------
create type user_role as enum ('customer', 'admin');
create type service_type as enum ('outstation', 'local', 'sightseeing', 'hourly');
create type booking_status as enum (
  'requested', 'confirmed', 'driver_assigned', 'ongoing', 'completed', 'cancelled'
);
create type payment_status as enum ('pending', 'link_sent', 'paid', 'failed');
create type payment_method as enum ('cash', 'upi', 'link');
create type trip_type as enum ('one_way', 'round_trip');
create type notification_channel as enum ('email', 'sms');

-- ---------- profiles (extends auth.users) ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------- drivers (admin-managed directory, no auth login) ----------
create table drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  vehicle_number text not null,
  vehicle_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- pricing config tables ----------
create table outstation_routes (
  id uuid primary key default gen_random_uuid(),
  from_city text not null,
  to_city text not null,
  trip_type trip_type not null,
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table local_pricing_config (
  id uuid primary key default gen_random_uuid(),
  base_fare numeric(10, 2) not null,
  per_km_rate numeric(10, 2) not null,
  effective_from timestamptz not null default now()
);

create table sightseeing_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  duration_hours numeric(5, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table hourly_rental_slabs (
  id uuid primary key default gen_random_uuid(),
  duration_hours numeric(5, 2) not null,
  km_limit numeric(6, 2) not null,
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- bookings ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id),
  service_type service_type not null,
  status booking_status not null default 'requested',
  driver_id uuid references drivers (id),

  -- exactly one of these is populated, depending on service_type
  route_id uuid references outstation_routes (id),
  package_id uuid references sightseeing_packages (id),
  slab_id uuid references hourly_rental_slabs (id),

  pickup_location text,
  drop_location text,
  distance_km numeric(8, 2), -- only for 'local'

  -- snapshot of the pricing components applied at booking time, so later
  -- admin edits to pricing config never retroactively change past bookings
  fare_breakdown jsonb not null,
  fare_amount numeric(10, 2) not null,

  scheduled_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- payments ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  amount numeric(10, 2) not null,
  method payment_method not null,
  status payment_status not null default 'pending',
  payment_reference text,
  link_url text,
  created_at timestamptz not null default now()
);

-- ---------- notifications_log ----------
create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  channel notification_channel not null,
  status text not null,
  sent_at timestamptz not null default now()
);

-- ============================================================================
-- Row-Level Security
-- ============================================================================

alter table profiles enable row level security;
alter table drivers enable row level security;
alter table outstation_routes enable row level security;
alter table local_pricing_config enable row level security;
alter table sightseeing_packages enable row level security;
alter table hourly_rental_slabs enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table notifications_log enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: a user can read/update their own profile; admins can read all
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- drivers: admin-only, not exposed to customers at all
create policy "drivers_admin_all" on drivers
  for all using (is_admin());

-- pricing tables: public read (customers need prices while booking), admin write
create policy "outstation_routes_public_read" on outstation_routes
  for select using (true);
create policy "outstation_routes_admin_write" on outstation_routes
  for insert with check (is_admin());
create policy "outstation_routes_admin_update" on outstation_routes
  for update using (is_admin());

create policy "local_pricing_public_read" on local_pricing_config
  for select using (true);
create policy "local_pricing_admin_write" on local_pricing_config
  for insert with check (is_admin());
create policy "local_pricing_admin_update" on local_pricing_config
  for update using (is_admin());

create policy "sightseeing_public_read" on sightseeing_packages
  for select using (true);
create policy "sightseeing_admin_write" on sightseeing_packages
  for insert with check (is_admin());
create policy "sightseeing_admin_update" on sightseeing_packages
  for update using (is_admin());

create policy "hourly_slabs_public_read" on hourly_rental_slabs
  for select using (true);
create policy "hourly_slabs_admin_write" on hourly_rental_slabs
  for insert with check (is_admin());
create policy "hourly_slabs_admin_update" on hourly_rental_slabs
  for update using (is_admin());

-- bookings: customers see/create only their own; admins see/update all
create policy "bookings_select_own_or_admin" on bookings
  for select using (auth.uid() = customer_id or is_admin());
create policy "bookings_insert_own" on bookings
  for insert with check (auth.uid() = customer_id);
create policy "bookings_update_admin_only" on bookings
  for update using (is_admin());

-- payments: customers see payments for their own bookings; admin/service-role writes
create policy "payments_select_own_or_admin" on payments
  for select using (
    is_admin() or
    exists (
      select 1 from bookings
      where bookings.id = payments.booking_id
      and bookings.customer_id = auth.uid()
    )
  );
create policy "payments_admin_write" on payments
  for insert with check (is_admin());
create policy "payments_admin_update" on payments
  for update using (is_admin());

-- notifications_log: admin-only (internal debugging/support tool)
create policy "notifications_log_admin_only" on notifications_log
  for all using (is_admin());
