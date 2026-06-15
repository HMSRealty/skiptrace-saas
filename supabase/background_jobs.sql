-- Background-processing schema for QStash-driven skip-trace jobs.
-- Run once in Supabase → SQL Editor.

-- Columns on trace_jobs to drive the background worker:
alter table trace_jobs add column if not exists chunk_cursor   int default 0;
alter table trace_jobs add column if not exists total_chunks   int default 0;
alter table trace_jobs add column if not exists input_records  jsonb;   -- raw uploaded rows
alter table trace_jobs add column if not exists column_map     jsonb;   -- field mapping
alter table trace_jobs add column if not exists user_email     text;

-- One row per processed chunk (keeps the job row small for big files).
create table if not exists trace_chunk_results (
  job_id       uuid not null references trace_jobs(id) on delete cascade,
  chunk_index  int  not null,
  results      jsonb not null,
  created_at   timestamptz default now(),
  primary key (job_id, chunk_index)
);

-- Atomic, race-safe credit deduction (idempotent finalize relies on this).
create or replace function deduct_credits(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
as $$
declare new_balance int;
begin
  update profiles
     set credits_balance = greatest(0, credits_balance - p_amount)
   where id = p_user_id
  returning credits_balance into new_balance;
  return new_balance;
end;
$$;

-- Return only a slice of input_records (so the worker reads 25 rows, not 10k, per tick).
create or replace function get_input_slice(p_job_id uuid, p_start int, p_count int)
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(elem order by idx), '[]'::jsonb)
  from trace_jobs,
       lateral jsonb_array_elements(input_records) with ordinality as t(elem, idx)
  where id = p_job_id and idx > p_start and idx <= p_start + p_count;
$$;

-- status values used by the app: 'processing' | 'completed' | 'failed' | 'cancelled'
