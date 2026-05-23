// =============================================================================
// Admin Topics API — POST (create)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

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
