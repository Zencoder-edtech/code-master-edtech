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
import { LearnClient } from './learn-client';

// ---------------------------------------------------------------------------
// Server Component — Fetches data and renders the client component
// In the future, this will query Supabase for the topic by ID.
// For now, we use hardcoded data regardless of the topicId param.
// ---------------------------------------------------------------------------
export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;

  // TODO: Replace with database query: const topic = await topicRepo.getById(topicId);
  const topic = pythonLoopsTopic;
  const mcqs = pythonLoopsMCQs;
  const problems = pythonLoopsProblems;

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
              {topic.title}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">{topic.description}</p>
          </div>
          <span className="hidden sm:block text-xs text-zinc-600 font-mono">
            ID: {topicId}
          </span>
        </div>
      </header>

      {/* Main Content — Client Component with tabs */}
      <LearnClient topic={topic} mcqs={mcqs} problems={problems} />
    </div>
  );
}
