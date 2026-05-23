// =============================================================================
// Admin Layout — Premium Sidebar Shell (/admin/*)
// =============================================================================
// Auth-guarded layout with icon-based sidebar, active route highlighting,
// admin branding, and responsive design. All pages under /admin/ are wrapped.
// =============================================================================

import { verifyAdminAccess, logoutAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized } = await verifyAdminAccess();
  if (!isAuthorized) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar logoutAction={logoutAdmin} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
