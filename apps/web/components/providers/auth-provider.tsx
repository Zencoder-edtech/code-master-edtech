// =============================================================================
// Auth Provider — Client Component for Supabase Auth State Listening
// =============================================================================
// This component wraps the app and listens for Supabase auth state changes.
// When a user signs in (SIGNED_IN event), it redirects them to /home.
//
// Why a separate component?
//   layout.tsx is a Server Component (required for metadata/viewport exports).
//   Server Components cannot use React hooks (useEffect, useRouter, useState).
//   So we extract all client-side auth logic into this 'use client' component.
//
// How it works:
//   1. On mount, subscribes to supabase.auth.onAuthStateChange
//   2. When SIGNED_IN fires, pushes user to /home and refreshes server data
//   3. On unmount, cleans up the subscription to prevent memory leaks
// =============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Create a Supabase browser client instance
    const supabase = createClient();

    // Subscribe to auth state changes (sign in, sign out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User just signed in — redirect to the home dashboard
        router.push('/home');
        // Force a refresh so Server Components re-fetch with the new auth state
        router.refresh();
      }
    });

    // Cleanup: unsubscribe when this component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
