// Hand-written types matching supabase/migrations/0001_init.sql.
// Once the Supabase CLI is connected, regenerate this file with:
//   supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts

export type UserRole = "customer" | "admin";
export type ServiceType = "outstation" | "local" | "sightseeing" | "hourly";
export type BookingStatus =
  | "requested"
  | "confirmed"
  | "driver_assigned"
  | "ongoing"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "link_sent" | "paid" | "failed";
export type PaymentMethod = "cash" | "upi" | "link";
export type TripType = "one_way" | "round_trip";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  vehicle_type: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OutstationRoute {
  id: string;
  from_city: string;
  to_city: string;
  trip_type: TripType;
  price: number;
  is_active: boolean;
}

export interface SightseeingPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_hours: number;
  is_active: boolean;
}

export interface HourlyRentalSlab {
  id: string;
  duration_hours: number;
  km_limit: number;
  price: number;
  is_active: boolean;
}

export interface FareBreakdown {
  base_fare?: number;
  per_km_rate?: number;
  distance_km?: number;
  package_price?: number;
  slab_price?: number;
  total: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  service_type: ServiceType;
  status: BookingStatus;
  driver_id: string | null;
  route_id: string | null;
  package_id: string | null;
  slab_id: string | null;
  pickup_location: string | null;
  drop_location: string | null;
  distance_km: number | null;
  fare_breakdown: FareBreakdown;
  fare_amount: number;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_reference: string | null;
  link_url: string | null;
  created_at: string;
}

// Placeholder — replace with generated Supabase Database type in Sprint 1+.
export type Database = any;
