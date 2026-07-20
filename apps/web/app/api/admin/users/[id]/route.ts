// =============================================================================
// Admin Users [id] API — PUT (update) | DELETE
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
    const { name, email, age, role, subscriptionTier, schoolId, parentalConsent, parentalEmail } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (age !== undefined) { data.age = parseInt(String(age)); data.isMinor = parseInt(String(age)) < 18; }
    if (role !== undefined) data.role = role;
    if (subscriptionTier !== undefined) data.subscriptionTier = subscriptionTier;
    if (schoolId !== undefined) data.schoolId = schoolId || null;
    if (parentalConsent !== undefined) data.parentalConsent = parentalConsent;
    if (parentalEmail !== undefined) data.parentalEmail = parentalEmail || null;

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ user });
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
