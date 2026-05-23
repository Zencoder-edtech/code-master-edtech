// =============================================================================
// Home Page — Post-Authentication Dashboard
// =============================================================================
// Main dashboard where students see their streak, topic progress, earned
// badges, and active courses. Uses simulated progress data (localStorage)
// until the database pipeline is fully wired.
//
// Sections:
//   1. Streak Card   — 🔥 current streak + longest streak
//   2. Topic Progress — 📊 per-topic progress bars (X/Y problems solved)
//   3. Badges        — 🏅 earned/locked mastery badges
//   4. Course Cards  — active courses with resume button
// =============================================================================

import { DashboardNav } from '@/components/dashboard-nav';
import { DashboardContent } from '@/components/dashboard-content';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { isAuthorized } = await verifyAdminAccess();
  if (isAuthorized) {
    redirect('/admin');
  }
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <DashboardNav />

      {/* Main Dashboard Content (Client Component for localStorage access) */}
      <DashboardContent />
    </div>
  );
}
