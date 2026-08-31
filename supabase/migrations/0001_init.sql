-- QR Attendance System - initial schema
-- Run in Supabase SQL editor, or via `supabase db push`

create extension if not exists "pgcrypto";

-- ORGANIZATIONS
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mode text not null default 'session' check (mode in ('session', 'personal_qr')),
  -- geofence (nullable = no location check enforced)
  geofence_lat double precision,
  geofence_lng double precision,
  geofence_radius_m integer default 150,
  require_selfie boolean not null default false,
  created_at timestamptz not null default now()
);

-- STAFF
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null, -- set once they log in (Option A)
  name text not null,
  phone text,
  email text,
  role text not null default 'staff',
  personal_qr_token uuid unique default gen_random_uuid(), -- used for Option B, works regardless of mode
  bound_device_id text, -- simple device binding fingerprint
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_org on staff(org_id);
create index if not exists idx_staff_auth_user on staff(auth_user_id);

-- ATTENDANCE RECORDS
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  staff_id uuid not null references staff(id) on delete cascade,
  type text not null check (type in ('in', 'out')),
  method text not null check (method in ('session', 'personal_qr')),
  occurred_at timestamptz not null default now(),
  lat double precision,
  lng double precision,
  distance_m numeric, -- distance from org geofence center, if geofence set
  selfie_url text,
  device_id text,
  flagged boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_attendance_org_time on attendance_records(org_id, occurred_at desc);
create index if not exists idx_attendance_staff_time on attendance_records(staff_id, occurred_at desc);

-- Convenience view: each staff member's current status (last event today)
create or replace view staff_current_status as
select distinct on (staff_id)
  staff_id,
  org_id,
  type as last_type,
  occurred_at as last_event_at
from attendance_records
order by staff_id, occurred_at desc;

-- RLS
alter table organizations enable row level security;
alter table staff enable row level security;
alter table attendance_records enable row level security;

-- Admins: for MVP, org membership/admin check is done via a simple admins table.
create table if not exists org_admins (
  org_id uuid not null references organizations(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  primary key (org_id, auth_user_id)
);

alter table org_admins enable row level security;

create or replace function is_org_admin(target_org uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from org_admins
    where org_id = target_org and auth_user_id = auth.uid()
  );
$$;

-- Organizations: admins can read/update their own org
create policy "org admins can view their org" on organizations
  for select using (is_org_admin(id));

create policy "org admins can update their org" on organizations
  for update using (is_org_admin(id));

-- Staff: admins manage staff in their org; a staff member can read their own row
create policy "org admins manage staff" on staff
  for all using (is_org_admin(org_id)) with check (is_org_admin(org_id));

create policy "staff can view own row" on staff
  for select using (auth_user_id = auth.uid());

-- Attendance: admins can view all records for their org; staff can view + insert their own
create policy "org admins view attendance" on attendance_records
  for select using (is_org_admin(org_id));

create policy "staff view own attendance" on attendance_records
  for select using (
    staff_id in (select id from staff where auth_user_id = auth.uid())
  );

create policy "staff insert own attendance" on attendance_records
  for insert with check (
    staff_id in (select id from staff where auth_user_id = auth.uid())
    or method = 'personal_qr' -- personal_qr inserts go through a service-role API route, not user session
  );

create policy "org admins manage org_admins" on org_admins
  for all using (is_org_admin(org_id)) with check (is_org_admin(org_id));
