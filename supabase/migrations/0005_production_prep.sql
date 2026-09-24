-- ============================================================================
-- Migration 0005: Production Prep, Auto-Admin Trigger, Surge, Carpooling & Docs
-- ============================================================================

-- 1. Add Surge Pricing, Carpooling, and Document Upload columns to bookings
alter table bookings add column if not exists surge_multiplier numeric(3, 2) not null default 1.00;
alter table bookings add column if not exists is_shared boolean not null default false;
alter table bookings add column if not exists shared_seat_count integer default 1;
alter table bookings add column if not exists documents_status text default 'not_required';
alter table bookings add column if not exists license_url text;
alter table bookings add column if not exists id_document_url text;

-- Add surge_multiplier to local_pricing_config
alter table local_pricing_config add column if not exists surge_multiplier numeric(3, 2) not null default 1.00;

-- 2. Auto-Admin Trigger: Auto-assigns role = 'admin' if email contains 'admin@' or matches ADMIN_EMAIL
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_email text;
  assigned_role user_role;
begin
  user_email := lower(coalesce(new.email, ''));
  
  if user_email like '%admin@%' or user_email = 'admin@terminalcabs.in' then
    assigned_role := 'admin';
  else
    assigned_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.phone,
    assigned_role
  )
  on conflict (id) do update set
    role = case when user_email like '%admin@%' then 'admin'::user_role else profiles.role end;
    
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
