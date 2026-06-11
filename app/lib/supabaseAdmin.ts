import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

// Known public values. NEXT_PUBLIC_* env vars must be accessed with literal property
// names so Next.js can inline them at build time. Hardcoded as a safety net since
// these are public.
const PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://iwhxzjrfggqwwkflhutp.supabase.co';
const PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aHh6anJmZ2dxd3drZmxodXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzQzNDEsImV4cCI6MjA5NjQ1MDM0MX0.0SOHy4OFRma0LXs5765_fDW1B_hk_GUQiyENOzkVRVM';

// Server-only — this file is only imported by edge API routes so this key
// never ships to the browser bundle.
const SERVICE_ROLE_KEY_FALLBACK =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aHh6anJmZ2dxd3drZmxodXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg3NDM0MSwiZXhwIjoyMDk2NDUwMzQxfQ.v7kyfkP6V6LFjjxQ89aNMWbvFh8VgTQRjlIpw__CWCc';

async function readServiceRoleKey(): Promise<string> {
  const fromProcess = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (fromProcess) return fromProcess;
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = (getRequestContext().env as any) || {};
    if (env.SUPABASE_SERVICE_ROLE_KEY) return env.SUPABASE_SERVICE_ROLE_KEY;
  } catch {}
  return SERVICE_ROLE_KEY_FALLBACK;
}

export async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (cached) return cached;
  const key = await readServiceRoleKey();
  cached = createClient(PUBLIC_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
