import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // if exists, do nothing
      create: {
        email,
        name: name || email.split('@')[0],
        age: 18, // Default age for OAuth users
        isMinor: false,
        role: 'student',
        subscriptionTier: 'free',
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
