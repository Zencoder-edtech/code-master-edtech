// =============================================================================
// Admin Problem [id] API — PUT | DELETE
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
    const { title, description, starterCode, solutionCode, difficulty, testCases, hints, language, order } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (starterCode !== undefined) data.starterCode = starterCode;
    if (solutionCode !== undefined) data.solutionCode = solutionCode;
    if (difficulty !== undefined) data.difficulty = difficulty;
    if (testCases !== undefined) data.testCases = testCases;
    if (hints !== undefined) data.hints = hints;
    if (language !== undefined) data.language = language;
    if (order !== undefined) data.order = parseInt(String(order));

    const problem = await prisma.problem.update({ where: { id }, data });
    return NextResponse.json({ problem });
  } catch (error) {
    console.error('Problem PUT error:', error);
    return NextResponse.json({ error: 'Failed to update problem' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await prisma.problem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Problem DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete problem' }, { status: 500 });
  }
}
