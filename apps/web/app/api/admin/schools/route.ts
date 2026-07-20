// =============================================================================
// Admin Schools B2B API — GET /api/admin/schools | POST (bind student to school)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const usersWithSchool = await prisma.user.findMany({
      where: { schoolId: { not: null } },
      select: {
        id: true,
        name: true,
        email: true,
        schoolId: true,
        age: true,
        isMinor: true,
        parentalConsent: true
      }
    });

    const schoolsMap: Record<string, any> = {};
    usersWithSchool.forEach((u) => {
      const sId = u.schoolId!;
      if (!schoolsMap[sId]) {
        schoolsMap[sId] = {
          schoolId: sId,
          totalStudents: 0,
          minorCount: 0,
          consentGiven: 0,
          totalAge: 0,
          emails: [] as string[]
        };
      }
      const school = schoolsMap[sId];
      school.totalStudents += 1;
      if (u.isMinor) {
        school.minorCount += 1;
        if (u.parentalConsent) {
          school.consentGiven += 1;
        }
      }
      school.totalAge += u.age;
      school.emails.push(u.email);
    });

    const schoolsList = Object.values(schoolsMap).map((s: any) => ({
      schoolId: s.schoolId,
      totalStudents: s.totalStudents,
      minorCount: s.minorCount,
      consentRate: s.minorCount > 0 ? Math.round((s.consentGiven / s.minorCount) * 100) : 100,
      avgAge: Math.round(s.totalAge / s.totalStudents),
      emails: s.emails
    }));

    return NextResponse.json({ schools: schoolsList });
  } catch (error) {
    console.error('Schools GET error:', error);
    return NextResponse.json({ error: 'Failed to aggregate school groupings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { email, schoolId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Student email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        schoolId: schoolId ? schoolId.trim() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: schoolId
        ? `Successfully bound student to school ${schoolId}`
        : 'Successfully removed school link for student',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        schoolId: updatedUser.schoolId
      }
    });
  } catch (error) {
    console.error('Schools POST error:', error);
    return NextResponse.json({ error: 'Failed to bind student to school' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { oldSchoolId, newSchoolId } = body;

    if (!oldSchoolId || !newSchoolId) {
      return NextResponse.json({ error: 'Both old school ID and new school ID are required' }, { status: 400 });
    }

    const { count } = await prisma.user.updateMany({
      where: { schoolId: oldSchoolId },
      data: { schoolId: newSchoolId }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${count} student(s) from "${oldSchoolId}" to "${newSchoolId}"`,
      count
    });
  } catch (error) {
    console.error('Schools PUT error:', error);
    return NextResponse.json({ error: 'Failed to migrate school code' }, { status: 500 });
  }
}
