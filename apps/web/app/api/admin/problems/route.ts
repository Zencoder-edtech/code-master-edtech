// =============================================================================
// Admin Problems API — POST (create)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export async function GET(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const problems = await prisma.problem.findMany({
      where,
      orderBy: [{ topicId: 'asc' }, { order: 'asc' }],
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            course: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Problems GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { topicId, title, description, starterCode, solutionCode, difficulty, testCases, hints, language } = body;

    if (!topicId || !title || !description || !solutionCode) {
      return NextResponse.json({ error: 'topicId, title, description, and solutionCode are required' }, { status: 400 });
    }

    const count = await prisma.problem.count({ where: { topicId } });

    const problem = await prisma.problem.create({
      data: {
        topicId,
        title,
        description,
        starterCode: starterCode || null,
        solutionCode,
        difficulty: difficulty || 'fill_blank',
        testCases: testCases || [],
        hints: hints || [],
        language: language || 'python',
        order: count,
      },
    });

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    console.error('Problem POST error:', error);
    return NextResponse.json({ error: 'Failed to create problem' }, { status: 500 });
  }
}
