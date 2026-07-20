// =============================================================================
// Admin Users API — GET /api/admin/users (list + search) | POST (create)
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, name: true, age: true, role: true,
          subscriptionTier: true, isMinor: true, parentalConsent: true,
          schoolId: true, createdAt: true, updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, limit });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { email, name, age, role, subscriptionTier, schoolId } = body;

    if (!email || !age) {
      return NextResponse.json({ error: 'Email and age are required' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        age: parseInt(age),
        isMinor: parseInt(age) < 18,
        role: role || 'student',
        subscriptionTier: subscriptionTier || 'free',
        schoolId: schoolId || null,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    console.error('Users POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
