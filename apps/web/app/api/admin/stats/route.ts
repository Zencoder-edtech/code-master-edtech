// =============================================================================
// Admin Stats API — GET /api/admin/stats
// =============================================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export async function GET() {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const [userCount, courseCount, topicCount, submissionCount, mcqCount, problemCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.topic.count(),
      prisma.submission.count(),
      prisma.mCQ.count(),
      prisma.problem.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      stats: { userCount, courseCount, topicCount, submissionCount, mcqCount, problemCount },
      recentUsers,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
