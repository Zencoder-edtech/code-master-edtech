// =============================================================================
// Supabase Browser Client — Client-side Supabase instance
// =============================================================================
// Creates a Supabase client for use in 'use client' components (browser only).
// Uses @supabase/ssr's createBrowserClient which handles cookie-based auth
// sessions automatically, making it compatible with Next.js App Router.
//
// Environment variables required:
//   NEXT_PUBLIC_SUPABASE_URL      — Your Supabase project URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY — Public anon key (safe to expose client-side)
//
// Usage:
//   import { createClient } from '@/lib/supabase';
//   const supabase = createClient();
//   const { data } = await supabase.from('users').select('*');
// =============================================================================

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}