// =============================================================================
// Admin User Submissions API — GET /api/admin/users/[id]/submissions
// =============================================================================
// Returns the last N submissions for a specific user, with problem details
// and color-coded status information for the admin forensics view.
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../../../verify';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    const submissions = await prisma.submission.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 20),
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            language: true,
            topic: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Calculate stats
    const totalSubmissions = await prisma.submission.count({ where: { userId: id } });
    const successCount = await prisma.submission.count({
      where: { userId: id, status: { in: ['accepted', 'Accepted'] } },
    });
    const errorCount = await prisma.submission.count({
      where: { userId: id, status: { in: ['runtime_error', 'compilation_error', 'wrong_answer', 'Runtime Error', 'Compilation Error', 'Wrong Answer'] } },
    });

    // Average execution time for completed submissions
    const avgExecResult = await prisma.submission.aggregate({
      where: { userId: id, executionTimeMs: { not: null } },
      _avg: { executionTimeMs: true },
    });

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        sourceCode: s.sourceCode,
        language: s.language,
        status: s.status,
        stdout: s.stdout,
        stderr: s.stderr,
        compileOutput: s.compileOutput,
        executionTimeMs: s.executionTimeMs,
        memoryUsedKb: s.memoryUsedKb,
        createdAt: s.createdAt.toISOString(),
        completedAt: s.completedAt?.toISOString() || null,
        problem: s.problem ? {
          id: s.problem.id,
          title: s.problem.title,
          difficulty: s.problem.difficulty,
          language: s.problem.language,
          topicTitle: s.problem.topic?.title || 'Unknown',
        } : null,
      })),
      stats: {
        total: totalSubmissions,
        success: successCount,
        errors: errorCount,
        avgExecutionTimeMs: avgExecResult._avg.executionTimeMs ? Math.round(avgExecResult._avg.executionTimeMs) : null,
      },
    });
  } catch (error) {
    console.error('User submissions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
