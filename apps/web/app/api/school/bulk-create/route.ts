// =============================================================================
// Bulk Create Students API Route — POST /api/school/bulk-create
// =============================================================================
// Server-side API route that receives parsed CSV data from CSVUploadClient
// and creates student user records in the database via Prisma.
//
// Request Body:
//   { schoolId: string, students: Array<{ name, contact, age }> }
//
// Processing:
//   1. Validates the payload (schoolId, students array)
//   2. Maps each student to a User record with:
//      - Auto-generated email from contact if not a valid email
//      - DPDP compliance fields (isMinor, parentalConsent, timestamp)
//      - Default role: "student"
//   3. Uses Prisma's createMany with skipDuplicates to avoid crashes
//      on duplicate email addresses
//
// Response:
//   Success: { success: true, count: number }
//   Error:   { error: string } with appropriate HTTP status code
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { schoolId, students } = await req.json();

    if (!schoolId || !students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    // Prepare data for Prisma bulk insert
    const usersToCreate = students.map((s: { name: string; contact: string; age: number }) => {
      const age = s.age || 0;
      const isMinor = age < 18;
      // Default to generic username matching email format for uniqueness if contact isn't pure email
      const fakeEmail = s.contact.includes('@') ? s.contact : `${s.contact}@placeholder.edu`;

      return {
        name: s.name,
        email: fakeEmail, // Supabase Auth and Prisma require a unique email conceptually
        age,
        isMinor,
        parentalConsent: true, // DPDP auto-consent tracking when uploaded by school
        parentalConsentTimestamp: new Date(),
        role: 'student',
        schoolId: schoolId,
        // we can store raw phone in name or metadata if we wanted strictly.
      };
    });

    // In a completely integrated mode with Supabase auth: 
    // You would loop through and call `supabase.auth.admin.createUser` to get unique ID 
    // before inserting into Prisma. Due to project structure, we will insert them into 
    // Prisma directly. The auth provider mapping might require custom trigger execution on supabase directly.
    
    // We attempt batch creation but realistically should use createMany
    // Adding skipDuplicates to avoid crashing on duplicate emails
    await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: usersToCreate.length });

  } catch (error: unknown) {
    console.error('Bulk create error:', error);
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
