// =============================================================================
// Learn Topic Page — /learn/[topicId] (Light Theme)
// =============================================================================
// Server Component that fetches topic data, renders light theme header,
// and passes data to LearnClient.
// =============================================================================

import {
  pythonLoopsTopic,
  pythonLoopsMCQs,
  pythonLoopsProblems,
} from '@/data/python-loops';
import { prisma } from '@/lib/prisma';
import { LearnClient } from './learn-client';
import type { Topic, MCQ, Problem } from '@/types/learn';

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
      if (topicId === 'loops' || topicId === 'python-loops' || topicId === 'loops-001') {
        topic = pythonLoopsTopic;
        mcqs = pythonLoopsMCQs;
        problems = pythonLoopsProblems;
      } else {
        isServerOffline = true;
      }
    }
  } catch (error) {
    console.warn('Prisma fetch failed, entering local/offline fallback mode:', error);
    isServerOffline = true;

    if (topicId === 'loops' || topicId === 'python-loops' || topicId === 'loops-001') {
      topic = pythonLoopsTopic;
      mcqs = pythonLoopsMCQs;
      problems = pythonLoopsProblems;
      isServerOffline = false;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <a
              href="/home"
              className="inline-flex items-center gap-1 text-sm text-purple-500 hover:text-purple-700 transition font-semibold mb-1"
            >
              <span>←</span> Back to Dashboard
            </a>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E]">
              {topic?.title || 'Learning Topic'}
            </h1>
            <p className="text-[#9E9EB8] text-xs sm:text-sm mt-0.5 font-medium">
              {topic?.description || 'Learn and solve challenges at your own pace.'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
              📚 Interactive Lesson
            </span>
          </div>
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
