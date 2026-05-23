// =============================================================================
// Learn Topic Page — /learn/[topicId]
// =============================================================================
// This is the main learning page where students study concepts, answer MCQs,
// and solve coding problems. It uses tabbed navigation (Concept | MCQs | Problems).
//
// Architecture:
//   - Server Component (this file) fetches topic data and passes to client
//   - LearnClient (below) handles all interactive UI
//   - Code editor: Monaco on desktop (≥768px), CodeMirror on mobile (<768px)
//   - Code execution: calls /api/execute → Judge0
//
// Data Source:
//   Currently uses hardcoded seed data from data/python-loops.ts.
//   Will be replaced with Supabase queries via TopicRepository in Phase 3.
// =============================================================================

import {
  pythonLoopsTopic,
  pythonLoopsMCQs,
  pythonLoopsProblems,
} from '@/data/python-loops';
import { prisma } from '@/lib/prisma';
import { LearnClient } from './learn-client';
import type { Topic, MCQ, Problem } from '@/types/learn';

// ---------------------------------------------------------------------------
// Server Component — Fetches data from database with offline resilience
// ---------------------------------------------------------------------------
export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;

  let topic: Topic | null = null;
  let mcqs: MCQ[] = [];
  let problems: Problem[] = [];
  let isServerOffline = false;

  try {
    // Attempt to query Postgres via Prisma
    const dbTopic = await prisma.topic.findFirst({
      where: {
        OR: [
          { slug: topicId },
          { id: topicId }
        ]
      },
      include: {
        mcqs: {
          orderBy: { order: 'asc' }
        },
        problems: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (dbTopic) {
      // Map database MCQ structure (JSON array + correctIndex) to UI structure ({ text, isCorrect })
      const mappedMCQs = dbTopic.mcqs.map((m) => {
        let opts: string[] = [];
        try {
          opts = Array.isArray(m.options) ? m.options : JSON.parse(m.options as string);
        } catch {
          opts = [];
        }
        return {
          id: m.id,
          question: m.question,
          options: opts.map((text, idx) => ({
            text,
            isCorrect: idx === m.correctIndex
          })),
          explanation: m.explanation || ''
        };
      });

      // Map database Problems
      const mappedProblems = dbTopic.problems.map((p) => {
        let cases: Array<{ input?: string; expected?: string; expected_output?: string }> = [];
        try {
          cases = Array.isArray(p.testCases)
            ? (p.testCases as unknown as Array<{ input?: string; expected?: string; expected_output?: string }>)
            : JSON.parse(p.testCases as string);
        } catch {
          cases = [];
        }

        return {
          id: p.id,
          title: p.title,
          description: p.description,
          starterCode: p.starterCode,
          difficulty: p.difficulty,
          testCases: cases.map((tc) => ({
            input: tc.input || '',
            expected: tc.expected || tc.expected_output || ''
          }))
        };
      });

      topic = {
        id: dbTopic.id,
        title: dbTopic.title,
        description: dbTopic.description || '',
        conceptHtml: dbTopic.conceptHtml,
        videoUrl: dbTopic.videoUrl || undefined
      };
      mcqs = mappedMCQs;
      problems = mappedProblems;
    } else {
      // If topicId is loops or python-loops, fall back to our local loops seed data
      if (topicId === 'loops' || topicId === 'python-loops' || topicId === 'loops-001') {
        topic = pythonLoopsTopic;
        mcqs = pythonLoopsMCQs;
        problems = pythonLoopsProblems;
      } else {
        // Not found - let client handle or show offline/fallback lists
        isServerOffline = true;
      }
    }
  } catch (error) {
    console.warn('Prisma fetch failed, entering local/offline fallback mode:', error);
    isServerOffline = true;

    // Fall back to pythonLoopsTopic for loops URL if offline
    if (topicId === 'loops' || topicId === 'python-loops' || topicId === 'loops-001') {
      topic = pythonLoopsTopic;
      mcqs = pythonLoopsMCQs;
      problems = pythonLoopsProblems;
      isServerOffline = false; // We have a complete fallback, we can treat it as offline mode inside the client
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <a
              href="/home"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition"
            >
              ← Back to Home
            </a>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {topic?.title || 'Learning Topic'}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {topic?.description || 'Learn and solve challenges at your own pace.'}
            </p>
          </div>
          <span className="hidden sm:block text-xs text-zinc-600 font-mono">
            SLUG: {topicId}
          </span>
        </div>
      </header>

      {/* Main Content — Client Component with tabs */}
      <LearnClient
        topic={topic}
        mcqs={mcqs}
        problems={problems}
        isServerOffline={isServerOffline}
        topicId={topicId}
      />
    </div>
  );
}
