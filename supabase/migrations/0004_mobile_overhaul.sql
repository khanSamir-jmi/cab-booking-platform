-- ============================================================================
-- Migration 0004: Mobile Overhaul, Self-Drive support, Fleet & Dhanbad Sightseeing
-- ============================================================================

-- 1. Add is_self_drive column to bookings
alter table bookings add column if not exists is_self_drive boolean not null default false;

-- 2. Create fleet_vehicles table
create table if not exists fleet_vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  capacity_passengers integer not null default 4,
  capacity_luggage integer not null default 2,
  price_per_km numeric(10, 2) not null,
  price_per_hour numeric(10, 2) not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table fleet_vehicles enable row level security;

create policy "fleet_public_read" on fleet_vehicles
  for select using (true);

-- Seed Fleet Vehicles
insert into fleet_vehicles (name, category, capacity_passengers, capacity_luggage, price_per_km, price_per_hour, image_url)
values
  ('Maruti Swift Dzire / Etios', 'Sedan', 4, 2, 14.00, 150.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'),
  ('Ergonomic Hatchback', 'Hatchback', 4, 1, 11.00, 120.00, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'),
  ('Toyota Innova Crysta / Ertiga', 'SUV', 6, 4, 20.00, 250.00, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'),
  ('Mercedes Benz C-Class / Audi A4', 'Luxury', 4, 3, 45.00, 600.00, 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80')
on conflict do nothing;

-- Seed Dhanbad, Jharkhand Localized Sightseeing Packages
insert into sightseeing_packages (name, description, price, duration_hours, is_active)
values
  ('Maithon Dam & Lake Retreat', 'Scenic 6-hour excursion to Maithon Dam, boat rides, Kalyaneshwari Temple, and Millennium Park.', 2200.00, 6.0, true),
  ('Bhatinda Fall & Topchanchi Explorer', 'Full-day tour covering Bhatinda Waterfalls, Topchanchi Lake sanctuary, and Parasnath foothills.', 3200.00, 8.0, true),
  ('Dhanbad City & Birsa Munda Park Tour', 'Quick 4-hour local sightseeing covering Birsa Munda Park, Panchet Dam, and local handicrafts markets.', 1500.00, 4.0, true)
on conflict do nothing;
