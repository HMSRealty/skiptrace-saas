import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iwhxzjrfggqwwkflhutp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aHh6anJmZ2dxd3drZmxodXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzQzNDEsImV4cCI6MjA5NjQ1MDM0MX0.0SOHy4OFRma0LXs5765_fDW1B_hk_GUQiyENOzkVRVM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
