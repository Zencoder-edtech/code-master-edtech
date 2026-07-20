// =============================================================================
// Profile Page — /profile (Light Theme)
// =============================================================================
// Server Component routing to the Student Profile dashboard.
// =============================================================================

import { DashboardNav } from '@/components/dashboard-nav';
import { ProfileContent } from '@/components/profile-content';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const { isAuthorized } = await verifyAdminAccess();
  if (isAuthorized) {
    redirect('/admin');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-white flex flex-col">
      {/* Top Navigation */}
      <DashboardNav />

      {/* Main Profile Page Content */}
      <ProfileContent />
    </div>
  );
}
