// =============================================================================
// Admin Streaks API — GET /api/admin/streaks | POST (upsert progress streak)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const completed = searchParams.get('completed') || '';
    const streakRange = searchParams.get('streakRange') || '';
    const sort = searchParams.get('sort') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { topic: { title: { contains: search, mode: 'insensitive' as const } } }
      ];
    }

    if (completed === 'true') {
      where.isTopicComplete = true;
    } else if (completed === 'false') {
      where.isTopicComplete = false;
    }

    if (streakRange === 'active') {
      where.streak = { gt: 0 };
    } else if (streakRange === 'long') {
      where.streak = { gte: 5 };
    } else if (streakRange === 'champion') {
      where.streak = { gte: 10 };
    }

    let orderBy: any = { updatedAt: 'desc' };
    if (sort === 'activity_asc') {
      orderBy = { updatedAt: 'asc' };
    } else if (sort === 'streak_desc') {
      orderBy = { streak: 'desc' };
    } else if (sort === 'longest_streak_desc') {
      orderBy = { longestStreak: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { user: { email: 'asc' } }; // fallback to email sorting if name is missing
    }

    const progressRecords = await prisma.progress.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        topic: {
          select: { id: true, title: true }
        }
      },
      orderBy
    });

    return NextResponse.json({ progress: progressRecords });
  } catch (error) {
    console.error('Streaks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { userId, topicId, streak, longestStreak, isTopicComplete } = body;

    if (!userId || !topicId) {
      return NextResponse.json({ error: 'User ID and Topic ID are required' }, { status: 400 });
    }

    const currentStreakVal = parseInt(streak || '0');
    const longestStreakVal = parseInt(longestStreak || '0');
    const isTopicCompleteVal = isTopicComplete === true || isTopicComplete === 'true';

    const progress = await prisma.progress.upsert({
      where: {
        userId_topicId: { userId, topicId }
      },
      create: {
        userId,
        topicId,
        streak: currentStreakVal,
        longestStreak: Math.max(longestStreakVal, currentStreakVal),
        lastActivityAt: new Date(),
        isTopicComplete: isTopicCompleteVal
      },
      update: {
        streak: currentStreakVal,
        longestStreak: Math.max(longestStreakVal, currentStreakVal),
        lastActivityAt: new Date(),
        isTopicComplete: isTopicCompleteVal
      },
      include: {
        user: { select: { email: true } },
        topic: { select: { title: true } }
      }
    });

    return NextResponse.json({ progress }, { status: 201 });
  } catch (error) {
    console.error('Streaks POST error:', error);
    return NextResponse.json({ error: 'Failed to save streak progress' }, { status: 500 });
  }
}
