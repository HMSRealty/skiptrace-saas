import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://iwhxzjrfggqwwkflhutp.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aHh6anJmZ2dxd3drZmxodXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzQzNDEsImV4cCI6MjA5NjQ1MDM0MX0.0SOHy4OFRma0LXs5765_fDW1B_hk_GUQiyENOzkVRVM",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://skiptrace-saas.pages.dev",
  },
};

export default nextConfig;
