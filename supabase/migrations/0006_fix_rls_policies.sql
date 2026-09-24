-- ============================================================================
-- Migration 0006: Fix RLS Policies for Drivers, Bookings, Payments & Profiles
-- ============================================================================

-- 1. Drivers Table RLS Policy
alter table drivers enable row level security;
drop policy if exists "drivers_admin_all" on drivers;
drop policy if exists "drivers_public_all" on drivers;
create policy "drivers_public_all" on drivers for all using (true) with check (true);

-- 2. Bookings Table RLS Policy
alter table bookings enable row level security;
drop policy if exists "bookings_public_all" on bookings;
drop policy if exists "bookings_public" on bookings;
create policy "bookings_public_all" on bookings for all using (true) with check (true);

-- 3. Payments Table RLS Policy
alter table payments enable row level security;
drop policy if exists "payments_public_all" on payments;
drop policy if exists "payments_public" on payments;
create policy "payments_public_all" on payments for all using (true) with check (true);

-- 4. Profiles Table RLS Policy
alter table profiles enable row level security;
drop policy if exists "profiles_public_all" on profiles;
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_public_all" on profiles for all using (true) with check (true);
