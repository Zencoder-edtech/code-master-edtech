// =============================================================================
// Admin Authentication — Server Actions for Admin Panel Access
// =============================================================================
// Provides three server actions for managing admin access:
//
//   loginAdmin(email, password)
//     → Validates credentials against hardcoded admin email + password
//     → Sets an HTTP-only session cookie ("codemaster_admin_session")
//     → Returns { success: true } or { success: false, error: string }
//
//   logoutAdmin()
//     → Deletes the session cookie and redirects to /auth
//
//   verifyAdminAccess()
//     → Reads the session cookie to check if user is authenticated
//     → Returns { isAuthorized: boolean }
//
// Security Notes:
//   • 'use server' — These functions run ONLY on the server, never in the browser
//   • Cookie is httpOnly (not accessible via JavaScript) and secure in production
//   • Admin credentials are hardcoded (env vars with fallback defaults)
//   • This is MVP-level auth — production should use proper RBAC
// =============================================================================

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_COOKIE = 'codemaster_admin_session';
const ADMIN_SECRET = process.env.ADMIN_PASSWORD || 'sai1423';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'polampallisaivardhan1423@gmail.com';

export async function loginAdmin(email?: string, password?: string) {
  if (email === ADMIN_EMAIL && password === ADMIN_SECRET) {
    // Set a secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid admin credentials' };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect('/auth');
}

export async function verifyAdminAccess() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  
  return {
    isAuthorized: session?.value === 'authenticated'
  };
}
