// =============================================================================
// Admin Topics API — POST (create)
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

    const topics = await prisma.topic.findMany({
      where,
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
      include: {
        course: {
          select: { id: true, name: true, language: true },
        },
        mcqs: { select: { id: true } },
        problems: { select: { id: true } },
      },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Topics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { courseId, title, description, conceptHtml, videoUrl } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const count = await prisma.topic.count({ where: { courseId } });

    const topic = await prisma.topic.create({
      data: {
        courseId,
        title,
        slug,
        description: description || null,
        conceptHtml: conceptHtml || '<p>Content coming soon...</p>',
        videoUrl: videoUrl || null,
        order: count,
      },
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Topic POST error:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
