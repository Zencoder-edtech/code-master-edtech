// =============================================================================
// Admin Streaks ID API — PUT /api/admin/streaks/[id] (update) | DELETE (remove)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../../verify';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();
    const { streak, longestStreak, lastActivityAt, isTopicComplete } = body;

    const streakVal = parseInt(streak);
    const longestStreakVal = parseInt(longestStreak);

    if (isNaN(streakVal) || isNaN(longestStreakVal)) {
      return NextResponse.json({ error: 'Streak and Longest Streak values must be numbers' }, { status: 400 });
    }

    const progress = await prisma.progress.update({
      where: { id },
      data: {
        streak: streakVal,
        longestStreak: Math.max(longestStreakVal, streakVal),
        lastActivityAt: lastActivityAt ? new Date(lastActivityAt) : undefined,
        isTopicComplete: isTopicComplete !== undefined ? (isTopicComplete === true || isTopicComplete === 'true') : undefined
      },
      include: {
        user: { select: { name: true, email: true } },
        topic: { select: { title: true } }
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Streak PUT error:', error);
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    await prisma.progress.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Streak record deleted' });
  } catch (error) {
    console.error('Streak DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete streak record' }, { status: 500 });
  }
}
