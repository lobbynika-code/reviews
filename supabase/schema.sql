-- Run this script in the Supabase SQL Editor for your project.
create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  rating integer not null check (rating between 1 and 5),
  experience text not null,
  improvement text,
  customer_name text,
  phone text,
  request_callback boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- No public SELECT, UPDATE, or DELETE policies are created.
-- Submissions are inserted only by the server using the Supabase service-role key.
-- Never expose SUPABASE_SERVICE_ROLE_KEY in browser code.
