// =============================================================================
// Admin API Middleware — Shared auth verification for admin API routes
// =============================================================================
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'codemaster_admin_session';

export async function verifyAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null; // authorized
}
