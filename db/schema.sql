-- Run this in the Supabase SQL editor to support async chunked processing
-- and the pay-only-for-hits model. Safe to re-run (IF NOT EXISTS).

-- trace_jobs now carries its own input so the chunk processor is self-contained.
alter table public.trace_jobs add column if not exists input_records  jsonb;
alter table public.trace_jobs add column if not exists column_map     jsonb;
alter table public.trace_jobs add column if not exists processed_count integer not null default 0;
alter table public.trace_jobs add column if not exists user_email      text;

-- Existing columns referenced by the app (create the table if you haven't yet):
-- create table public.trace_jobs (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references auth.users(id),
--   file_name text,
--   total_records integer,
--   successful_hits integer,
--   credits_used integer,
--   status text default 'pending',
--   processed_count integer not null default 0,
--   input_records jsonb,
--   column_map jsonb,
--   result_data jsonb,
--   user_email text,
--   error_message text,
--   created_at timestamptz default now()
-- );

-- profiles.credits_balance is deducted by successful_hits at job completion
-- (see app/api/jobs/[jobId]/process/route.ts), not by total record count.
