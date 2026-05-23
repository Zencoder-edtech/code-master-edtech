// =============================================================================
// Admin Topic [id] API — GET | PUT | DELETE
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../../verify';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        mcqs: { orderBy: { order: 'asc' } },
        problems: { orderBy: { order: 'asc' } },
        course: { select: { id: true, name: true } },
      },
    });

    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Topic GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, conceptHtml, videoUrl, isPublished, order } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) data.description = description;
    if (conceptHtml !== undefined) data.conceptHtml = conceptHtml;
    if (videoUrl !== undefined) data.videoUrl = videoUrl;
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (order !== undefined) data.order = parseInt(String(order));

    const topic = await prisma.topic.update({ where: { id }, data });
    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Topic PUT error:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await prisma.topic.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Topic DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
