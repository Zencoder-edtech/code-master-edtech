// =============================================================================
// Learn Client — Interactive Learning UI (Client Component)
// =============================================================================
// This is the main interactive component for the learn page. It renders:
//   1. Tab navigation (Concept | MCQs | Problems)
//   2. Concept tab — HTML content + optional video embed
//   3. MCQs tab — interactive quiz with answer checking
//   4. Problems tab — code editor + "Run Code" button + output panel
//
// Code Editor:
//   - Desktop (≥768px): Monaco Editor — VS Code-like experience
//   - Mobile (<768px): CodeMirror 6 — touch-friendly, lightweight
//   Both are loaded dynamically via next/dynamic to avoid SSR issues.
//
// Code Execution:
//   Sends code to /api/execute (server-side route → Judge0).
//   Displays stdout/stderr in the output panel below the editor.
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Topic, MCQ, Problem, ExecutionResult } from '@/types/learn';

// ---------------------------------------------------------------------------
// Dynamic imports for code editors (no SSR — they need browser APIs)
// Monaco = VS Code engine (heavy, great for desktop)
// CodeMirror = lightweight, touch-friendly (great for mobile)
// ---------------------------------------------------------------------------
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
      Loading editor...
    </div>
  ),
});

const CodeMirrorEditor = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
        Loading editor...
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Tab names for the navigation
// ---------------------------------------------------------------------------
const TABS = ['Concept', 'MCQs', 'Problems'] as const;
type Tab = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Props from the server component
// ---------------------------------------------------------------------------
interface LearnClientProps {
  topic: Topic;
  mcqs: MCQ[];
  problems: Problem[];
}

export function LearnClient({ topic, mcqs, problems }: LearnClientProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState<Tab>('Concept');

  // Mobile detection for editor switching
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen width on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* ----------------------------------------------------------------- */}
      {/* Tab Navigation */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Tab Content */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'Concept' && (
        <ConceptTab topic={topic} />
      )}
      {activeTab === 'MCQs' && (
        <MCQsTab mcqs={mcqs} />
      )}
      {activeTab === 'Problems' && (
        <ProblemsTab problems={problems} isMobile={isMobile} />
      )}
    </main>
  );
}

// =============================================================================
// Concept Tab — Renders HTML content and optional video
// =============================================================================
function ConceptTab({ topic }: { topic: Topic }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8">
      {/* Video embed (if available) */}
      {topic.videoUrl && (
        <div className="aspect-video mb-8 rounded-xl overflow-hidden bg-zinc-800">
          <iframe
            src={topic.videoUrl}
            title={topic.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Concept HTML content */}
      <div
        className="prose prose-invert prose-zinc max-w-none"
        dangerouslySetInnerHTML={{ __html: topic.conceptHtml }}
      />
    </div>
  );
}

// =============================================================================
// MCQs Tab — Interactive Quiz
// =============================================================================
// State per question: null (unanswered), index of selected option.
// Shows green/red highlight + explanation after answering.
// =============================================================================
function MCQsTab({ mcqs }: { mcqs: MCQ[] }) {
  // Track selected answer for each question (null = unanswered)
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

  const handleSelect = (mcqId: string, optionIndex: number) => {
    // Only allow answering once per question
    if (answers[mcqId] !== undefined && answers[mcqId] !== null) return;
    setAnswers((prev) => ({ ...prev, [mcqId]: optionIndex }));
  };

  return (
    <div className="space-y-6">
      {mcqs.map((mcq, qi) => {
        const selectedIndex = answers[mcq.id] ?? null;
        const hasAnswered = selectedIndex !== null;

        return (
          <div key={mcq.id} className="bg-zinc-900 rounded-2xl p-6">
            {/* Question */}
            <h3 className="text-lg font-semibold mb-4">
              <span className="text-blue-400">Q{qi + 1}.</span> {mcq.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {mcq.options.map((opt, oi) => {
                let optionStyle = 'border-zinc-700 hover:border-zinc-500';
                if (hasAnswered) {
                  if (opt.isCorrect) {
                    optionStyle = 'border-green-500 bg-green-500/10';
                  } else if (oi === selectedIndex && !opt.isCorrect) {
                    optionStyle = 'border-red-500 bg-red-500/10';
                  } else {
                    optionStyle = 'border-zinc-800 opacity-50';
                  }
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(mcq.id, oi)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${optionStyle} ${
                      !hasAnswered ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span className="font-mono text-sm text-zinc-500 mr-3">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            {hasAnswered && (
              <div className="mt-4 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
                <p className="text-sm text-zinc-300">
                  <span className="font-semibold text-blue-400">
                    Explanation:{' '}
                  </span>
                  {mcq.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Problems Tab — Code Editor + Execution
// =============================================================================
// Shows a list of problems. Each problem has:
//   - Description card
//   - Code editor (Monaco/CodeMirror based on screen size)
//   - "Run Code" button
//   - Output panel showing stdout/stderr
// =============================================================================
function ProblemsTab({
  problems,
  isMobile,
}: {
  problems: Problem[];
  isMobile: boolean;
}) {
  // Track which problem is currently selected
  const [activeProblem, setActiveProblem] = useState(0);
  // Code state for each problem (initialize from starterCode)
  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    problems.forEach((p) => {
      map[p.id] = p.starterCode ?? '';
    });
    return map;
  });
  // Execution state
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const problem = problems[activeProblem];
  if (!problem) return null;
  const code = codeMap[problem.id] ?? '';

  // ---------------------------------------------------------------------------
  // Update code for the current problem
  // ---------------------------------------------------------------------------
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCodeMap((prev) => ({ ...prev, [problem.id]: value }));
  };

  // ---------------------------------------------------------------------------
  // Execute code via /api/execute → Judge0
  // ---------------------------------------------------------------------------
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running...');

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeMap[problem.id], language_id: 71 }),
      });

      const result: ExecutionResult = await res.json();

      if (result.compile_output) {
        setOutput(`Compile Error:\n${result.compile_output}`);
      } else if (result.stderr) {
        setOutput(`Error:\n${result.stderr}`);
      } else if (result.stdout) {
        setOutput(result.stdout);
      } else {
        setOutput('No output');
      }
    } catch {
      setOutput('Failed to connect to code execution service.');
    }

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Problem selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {problems.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setActiveProblem(i);
              setOutput('');
            }}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              i === activeProblem
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                p.difficulty === 'easy'
                  ? 'bg-green-400'
                  : p.difficulty === 'medium'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
            />
            {p.title}
          </button>
        ))}
      </div>

      {/* Problem description */}
      <div className="bg-zinc-900 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-lg font-semibold">{problem.title}</h3>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              problem.difficulty === 'easy'
                ? 'bg-green-500/20 text-green-400'
                : problem.difficulty === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <p className="text-zinc-400">{problem.description}</p>
      </div>

      {/* Code Editor — Monaco on desktop, CodeMirror on mobile */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="text-sm font-medium text-zinc-400">
            Python 3 — {isMobile ? 'CodeMirror' : 'Monaco Editor'}
          </span>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all"
          >
            {isRunning ? '⏳ Running...' : '▶ Run Code'}
          </button>
        </div>

        {/* Editor area */}
        <div className="min-h-[300px]">
          {isMobile ? (
            <CodeMirrorEditor
              value={code}
              onChange={handleCodeChange}
              height="300px"
              theme="dark"
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
              }}
            />
          ) : (
            <MonacoEditor
              height="300px"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile-friendly Run Code button (big green button) */}
      {isMobile && (
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg"
        >
          {isRunning ? '⏳ Running...' : '▶ Run Code'}
        </button>
      )}

      {/* Output Panel */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <span className="text-sm font-medium text-zinc-400">Output</span>
        </div>
        <pre className="p-4 text-sm font-mono text-zinc-200 min-h-[100px] whitespace-pre-wrap">
          {output || 'Click "Run Code" to see output here.'}
        </pre>
      </div>
    </div>
  );
}
