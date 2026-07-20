// =============================================================================
// Dashboard Navigation — Light Theme for Kids
// =============================================================================
// Bright, colorful top navigation bar with logo, greeting, and logout.
// =============================================================================

'use client';

import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const supabase = createClient();

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileName, setProfileName] = useState('Student');
  const [profileAvatar, setProfileAvatar] = useState('🐯');

  useEffect(() => {
    const loadProfile = () => {
      if (typeof window !== 'undefined') {
        const storedName = localStorage.getItem('cm_profile_name');
        const storedAvatar = localStorage.getItem('cm_profile_avatar');
        if (storedName) setProfileName(storedName);
        if (storedAvatar) setProfileAvatar(storedAvatar);
      }
    };

    loadProfile();
    window.addEventListener('cm_profile_updated', loadProfile);
    return () => {
      window.removeEventListener('cm_profile_updated', loadProfile);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo/Brand */}
        <Link href="/home" className="flex items-center gap-3 hover:opacity-90 transition-all select-none">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white shadow-sm text-sm">
            CM
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900 hidden sm:block">
            CodeMaster
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/home"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              pathname === '/home'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                : 'text-zinc-650 hover:text-indigo-600 hover:bg-indigo-50/30 border border-transparent'
            }`}
          >
            Home
          </Link>
          <Link
            href="/profile"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              pathname === '/profile'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                : 'text-zinc-650 hover:text-indigo-600 hover:bg-indigo-50/30 border border-transparent'
            }`}
          >
            Profile
          </Link>
        </div>

        {/* Right: User Info & Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 transition-all border border-zinc-200 rounded-xl px-4 py-2 cursor-pointer hover:shadow-sm"
          >
            <span className="text-base leading-none">{profileAvatar}</span>
            <span className="text-sm font-semibold text-zinc-700">
              {profileName}
            </span>
          </Link>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-white hover:bg-zinc-50 text-zinc-700 transition-all border border-zinc-200 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
        
      </div>
    </nav>
  );
}
