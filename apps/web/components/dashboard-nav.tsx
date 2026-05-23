// =============================================================================
// Dashboard Navigation Component
// =============================================================================
// Provides the top navigation bar for the post-login dashboard.
// Includes a logo, user avatar placeholder, and a working Logout button.
// =============================================================================

'use client';


import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Create once at module level — not on every render
const supabase = createClient();

export function DashboardNav() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ---------------------------------------------------------------------------
  // Logout handler
  // Clears the Supabase session and safely redirects to the sign-in page.
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            CM
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-100 hidden sm:block">
            CodeMaster
          </span>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-4 border border-zinc-800 bg-zinc-900/50 rounded-full pl-4 pr-1 py-1 shadow-inner">
          <span className="text-sm font-medium text-zinc-300 hidden sm:block">
            Student Account
          </span>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-black hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
        
      </div>
    </nav>
  );
}
