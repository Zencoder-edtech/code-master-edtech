// =============================================================================
// Admin MCQ [id] API — PUT | DELETE
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../../verify';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const { question, options, correctIndex, explanation, order } = body;

    const data: Record<string, unknown> = {};
    if (question !== undefined) data.question = question;
    if (options !== undefined) data.options = options;
    if (correctIndex !== undefined) data.correctIndex = correctIndex;
    if (explanation !== undefined) data.explanation = explanation;
    if (order !== undefined) data.order = parseInt(String(order));

    const mcq = await prisma.mCQ.update({ where: { id }, data });
    return NextResponse.json({ mcq });
  } catch (error) {
    console.error('MCQ PUT error:', error);
    return NextResponse.json({ error: 'Failed to update MCQ' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await prisma.mCQ.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MCQ DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete MCQ' }, { status: 500 });
  }
}
