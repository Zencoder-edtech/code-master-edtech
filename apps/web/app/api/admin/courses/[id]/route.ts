// =============================================================================
// Admin Course [id] API — GET | PUT | DELETE
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../../verify';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { order: 'asc' },
          include: {
            mcqs: { orderBy: { order: 'asc' } },
            problems: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Course GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, language, description, isPublished, order } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (language !== undefined) data.language = language;
    if (description !== undefined) data.description = description;
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (order !== undefined) data.order = parseInt(String(order));

    const course = await prisma.course.update({ where: { id }, data });
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Course PUT error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Course DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
