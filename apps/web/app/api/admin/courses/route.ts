// =============================================================================
// Admin Courses API — GET (list) | POST (create)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export async function GET() {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: 'asc' },
      include: {
        topics: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, isPublished: true, order: true },
        },
      },
    });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Courses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { name, language, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const course = await prisma.course.create({
      data: {
        name,
        slug,
        language: language || 'python',
        description: description || null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: unknown) {
    console.error('Courses POST error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create course';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A course with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
