// =============================================================================
// Consent Report API Route — GET /api/school/consent-report
// =============================================================================
// Generates and downloads a CSV report of all students with verified parental
// consent for a given school. This supports DPDP Act 2023 compliance.
//
// Query Parameters:
//   ?schoolId=<string> — The school to generate the report for
//
// Processing:
//   1. Queries Prisma for all Users where schoolId matches AND parentalConsent = true
//   2. Formats results as CSV with columns: ID, Name, Email, Age, Consent Verified At
//   3. Returns the CSV file as a downloadable attachment
//
// Response Headers:
//   Content-Type: text/csv
//   Content-Disposition: attachment; filename="school_consent_report_<schoolId>.csv"
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return new NextResponse('Missing School ID', { status: 400 });
    }

    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        parentalConsent: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        parentalConsentTimestamp: true,
      }
    });

    // Generate CSV string
    const headers = ['ID', 'Name', 'Email', 'Age', 'Consent Verified At'];
    const rows = students.map(s => [
      s.id,
      s.name ? `"${s.name}"` : '', // quote against commas
      s.email,
      s.age.toString(),
      s.parentalConsentTimestamp ? s.parentalConsentTimestamp.toISOString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="school_consent_report_${schoolId}.csv"`,
      },
    });

  } catch (error: unknown) {
    console.error('Consent report generation error:', error);
    return new NextResponse('Failed to generate report', { status: 500 });
  }
}
