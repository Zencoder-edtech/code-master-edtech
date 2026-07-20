// =============================================================================
// Admin Analytics API — GET /api/admin/analytics (aggregated stats)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    // 1. Demographics counts
    const [totalUsers, minorCount, adultCount, consentGiven, consentPending] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isMinor: true } }),
      prisma.user.count({ where: { isMinor: false } }),
      prisma.user.count({ where: { isMinor: true, parentalConsent: true } }),
      prisma.user.count({ where: { isMinor: true, parentalConsent: false } })
    ]);

    // 2. Roles distribution
    const [students, teachers, admins] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.user.count({ where: { role: 'admin' } })
    ]);

    // 3. Submissions breakdown
    const [totalSubs, successSubs, failSubs] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: 'success' } }),
      prisma.submission.count({ where: { status: { not: 'success' } } })
    ]);

    // 4. Learning module progress
    const [completedProgress, activeProgress] = await Promise.all([
      prisma.progress.count({ where: { isTopicComplete: true } }),
      prisma.progress.count({ where: { isTopicComplete: false } })
    ]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const consent = searchParams.get('consent') || '';
    const ageFilter = searchParams.get('age') || '';

    const minorWhere: any = { isMinor: true };

    if (search) {
      minorWhere.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { parentalEmail: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (consent === 'verified') {
      minorWhere.parentalConsent = true;
    } else if (consent === 'pending') {
      minorWhere.parentalConsent = false;
    }

    if (ageFilter === 'under13') {
      minorWhere.age = { lt: 13 };
    } else if (ageFilter === '13to17') {
      minorWhere.age = { gte: 13, lt: 18 };
    }

    // 5. Minor Audit list for DPDP Compliance check
    const minorAudits = await prisma.user.findMany({
      where: minorWhere,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        parentalConsent: true,
        parentalEmail: true,
        createdAt: true
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      demographics: {
        totalUsers,
        minorCount,
        adultCount,
        consentGiven,
        consentPending
      },
      roles: {
        students,
        teachers,
        admins
      },
      submissions: {
        totalSubs,
        successSubs,
        failSubs
      },
      progress: {
        completedProgress,
        activeProgress
      },
      minorAudits
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to compile system analytics' }, { status: 500 });
  }
}
