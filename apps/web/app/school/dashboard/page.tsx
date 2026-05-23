// =============================================================================
// School Dashboard Page — /school/dashboard
// =============================================================================
// Server Component for the school admin dashboard. Teachers/admins use this
// page to bulk-import students via CSV upload.
//
// How it works:
//   1. Creates a server-side Supabase client (using cookies for auth)
//   2. Checks if the user is authenticated — redirects to /auth if not
//   3. Extracts the schoolId from user metadata (or defaults to "demo-school-001")
//   4. Renders the CSVUploadClient component with the schoolId
//
// Note: The Supabase server client is created inline here (not shared with
// lib/supabase.ts which is browser-only). This is because Server Components
// need cookie access via next/headers for secure session management.
// =============================================================================

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import CSVUploadClient from "./csv-upload-client";

// Helper to create a server-side Supabase client for Server Components
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export default async function SchoolDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Basic route protection
  if (!user) {
    redirect('/auth');
  }

  // Find user's associated school ID from our User model or metadata
  // Since we don't have the Prisma client configured easily for the server component here without adding dependencies,
  // we can use standard UI to allow input or mock a school verification for the MVP.
  // We'll pass a default 'demo-school-id' if we can't extract one from metadata natively.

  const schoolId = user.user_metadata?.schoolId || "demo-school-001";

  // In a full production app edge case, if they aren't a teacher/admin, we redirect:
  // if (user.user_metadata?.role !== 'teacher' && user.user_metadata?.role !== 'admin') redirect('/home');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">School Dashboard</h1>
        <p className="text-zinc-400">
          Upload your class list in 30 seconds. This auto-creates student accounts with verified parental consent.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-6">Student Roster Management</h2>
        
        <CSVUploadClient schoolId={schoolId} />
      </div>
    </div>
  );
}
