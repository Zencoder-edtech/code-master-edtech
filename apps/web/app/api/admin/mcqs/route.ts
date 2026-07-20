// =============================================================================
// Admin MCQs API — POST (create)
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
            { question: { contains: search, mode: 'insensitive' as const } },
            { explanation: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const mcqs = await prisma.mCQ.findMany({
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

    return NextResponse.json({ mcqs });
  } catch (error) {
    console.error('MCQs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch MCQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { topicId, question, options, correctIndex, explanation } = body;

    if (!topicId || !question || !options) {
      return NextResponse.json({ error: 'topicId, question, and options are required' }, { status: 400 });
    }

    const count = await prisma.mCQ.count({ where: { topicId } });

    const mcq = await prisma.mCQ.create({
      data: {
        topicId,
        question,
        options,
        correctIndex: correctIndex ?? 0,
        explanation: explanation || null,
        order: count,
      },
    });

    return NextResponse.json({ mcq }, { status: 201 });
  } catch (error) {
    console.error('MCQ POST error:', error);
    return NextResponse.json({ error: 'Failed to create MCQ' }, { status: 500 });
  }
}
