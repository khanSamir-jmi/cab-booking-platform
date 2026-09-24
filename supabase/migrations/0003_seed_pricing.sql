-- ============================================================================
-- Seed initial pricing configuration data
-- ============================================================================

-- Seed default local pricing (₹50 base fare + ₹15/km)
insert into local_pricing_config (base_fare, per_km_rate)
values (50.00, 15.00);

-- Seed sample outstation routes
insert into outstation_routes (from_city, to_city, trip_type, price)
values 
  ('Mumbai', 'Pune', 'one_way', 2500.00),
  ('Mumbai', 'Pune', 'round_trip', 4500.00),
  ('Bengaluru', 'Mysuru', 'one_way', 3000.00),
  ('Delhi', 'Agra', 'one_way', 3500.00);

-- Seed sample sightseeing packages
insert into sightseeing_packages (name, description, price, duration_hours)
values
  ('City Highlights Tour', 'Full day coverage of major heritage sites, parks, and landmarks.', 2800.00, 8.0),
  ('Express Half-Day Tour', '4-hour whirlwind tour covering top 4 popular attractions.', 1600.00, 4.0);

-- Seed sample hourly rental slabs
insert into hourly_rental_slabs (duration_hours, km_limit, price)
values
  (2.0, 20.0, 600.00),
  (4.0, 40.0, 1200.00),
  (8.0, 80.0, 2200.00),
  (12.0, 120.0, 3200.00);
