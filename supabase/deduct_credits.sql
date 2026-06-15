-- Atomic, race-safe credit deduction.
-- Run this once in the Supabase SQL editor:
--   Dashboard → SQL Editor → paste → Run
--
-- The skiptrace API calls this via sb.rpc('deduct_credits', {...}). Until it
-- exists, the API silently falls back to a read-modify-write update, so the app
-- works either way — but this function guarantees no double-billing under
-- concurrent finalizes.

create or replace function deduct_credits(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
as $$
declare
  new_balance int;
begin
  update profiles
     set credits_balance = greatest(0, credits_balance - p_amount)
   where id = p_user_id
  returning credits_balance into new_balance;

  return new_balance;
end;
$$;
