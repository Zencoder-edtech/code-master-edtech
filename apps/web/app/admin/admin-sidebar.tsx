// =============================================================================
// Admin Sidebar — Fully Responsive Premium Navigation Drawer (Client Component)
// =============================================================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, LogOut, Shield, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, exact: false },
];

interface Props {
  logoutAction: () => Promise<void>;
}

export function AdminSidebar({ logoutAction }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {/* ------------------------------------------------------------------- */}
      {/* Mobile Top Header (hidden on desktop) */}
      {/* ------------------------------------------------------------------- */}
      <header className="lg:hidden flex h-16 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-50 w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-tight text-zinc-100">Admin Panel</p>
            <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest leading-none">CodeMaster</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="w-10 h-10 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* Mobile Overlay Navigation Drawer */}
      {/* ------------------------------------------------------------------- */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-lg flex flex-col justify-between pt-20 px-6 pb-6">
          <nav className="space-y-2 mt-4">
            <p className="px-3 mb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em]">Navigation</p>
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeDrawer}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-violet-400' : 'text-zinc-500'}`} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4">
            <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800/85">
              <p className="text-sm font-semibold text-zinc-300 truncate">polampallisaivardhan1423@gmail.com</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Super Admin</p>
            </div>
            <form action={logoutAction} onSubmit={closeDrawer}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Desktop Sidebar (hidden on mobile/tablet) */}
      {/* ------------------------------------------------------------------- */}
      <aside className="hidden lg:flex w-[260px] min-h-screen border-r border-zinc-800 bg-zinc-900/60 backdrop-blur-xl flex-col shrink-0 sticky top-0 h-screen">
        {/* Header */}
        <div className="h-[72px] flex items-center gap-3 px-6 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-zinc-100">Admin Panel</p>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">CodeMaster</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em]">Navigation</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-violet-500/10 text-violet-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-500" />
                )}
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800">
          <div className="px-3 py-2 mb-3 rounded-lg bg-zinc-800/40">
            <p className="text-xs font-semibold text-zinc-300 truncate">polampallisaivardhan1423@gmail.com</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Super Admin</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Log Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
