import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

async function readEnv(name: string): Promise<string | undefined> {
  // Try process.env first (works in most envs)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  // Fall back to Cloudflare Pages request context
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = (getRequestContext().env as any) || {};
    if (env[name]) return env[name];
  } catch {}
  return undefined;
}

export async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (cached) return cached;
  const url =
    (await readEnv('NEXT_PUBLIC_SUPABASE_URL')) ||
    'https://iwhxzjrfggqwwkflhutp.supabase.co';
  const key =
    (await readEnv('SUPABASE_SERVICE_ROLE_KEY')) ||
    (await readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  if (!key) throw new Error('Supabase key not configured');
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
