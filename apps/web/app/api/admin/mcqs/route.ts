// =============================================================================
// Admin MCQs API — POST (create)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

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
