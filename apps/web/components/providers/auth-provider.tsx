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

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Use a ref so the callback always sees the latest pathname
  // without needing to re-subscribe the auth listener
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    // Create a Supabase browser client instance
    const supabase = createClient();

    // Subscribe to auth state changes (sign in, sign out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        // Sync the Supabase auth user to the Prisma public.users table
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
          })
        }).catch(console.error);

        // Only redirect if the user is on the auth page or landing page!
        // (Supabase sometimes fires SIGNED_IN purely on page reload)
        const currentPath = pathnameRef.current;
        if (currentPath === '/auth' || currentPath === '/') {
          router.push('/home');
        }
        // Force a refresh so Server Components re-fetch with the new auth state
        router.refresh();
      }
    });

    // Cleanup: unsubscribe when this component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [router]); // removed pathname from deps — use ref instead

  return <>{children}</>;
}

