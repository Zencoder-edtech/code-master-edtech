// =============================================================================
// Admin Submissions API — GET /api/admin/submissions | DELETE (audit logging)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const language = searchParams.get('language') || '';
    const sort = searchParams.get('sort') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    const andConditions: any[] = [];

    if (status) {
      if (status === 'success') {
        where.status = { equals: 'success' };
      } else if (status === 'error') {
        where.status = { not: 'success' };
      }
    }

    if (difficulty) {
      andConditions.push({ problem: { difficulty: { equals: difficulty } } });
    }

    if (language) {
      where.language = { equals: language };
    }

    if (search) {
      andConditions.push({
        OR: [
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { problem: { title: { contains: search, mode: 'insensitive' as const } } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'created_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'time_asc') {
      orderBy = { executionTimeMs: 'asc' };
    } else if (sort === 'memory_asc') {
      orderBy = { memoryUsedKb: 'asc' };
    }

    const submissions = await prisma.submission.findMany({
      where,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            topic: {
              select: { title: true }
            }
          }
        }
      },
      orderBy
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Submissions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { id, status, stdout, stderr } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Submission ID and status are required' }, { status: 400 });
    }

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        stdout: stdout !== undefined ? stdout : undefined,
        stderr: stderr !== undefined ? stderr : undefined
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            topic: {
              select: { title: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Submission PUT error:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    await prisma.submission.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Submission log entry deleted' });
  } catch (error) {
    console.error('Submissions DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
