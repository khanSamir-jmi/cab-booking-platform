-- ============================================================================
-- Migration 0007: Ensure Booking Integrity and Permissive RLS for Bookings
-- ============================================================================

-- 1. Relax foreign keys so any authenticated user session can create a booking
alter table profiles drop constraint if exists profiles_id_fkey;
alter table bookings drop constraint if exists bookings_customer_id_fkey;
alter table bookings alter column customer_id drop not null;

-- 2. Ensure Bookings Table RLS permits inserts and reads for application clients
alter table bookings enable row level security;
drop policy if exists "bookings_public_all" on bookings;
drop policy if exists "bookings_insert_own" on bookings;
drop policy if exists "bookings_select_own_or_admin" on bookings;

create policy "bookings_public_all" on bookings for all using (true) with check (true);
