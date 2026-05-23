// =============================================================================
// Learn Client — Interactive & Offline-Resilient UI (Client Component)
// =============================================================================
// Renders the tab navigation (Concept | MCQs | Problems), dynamic code editors,
// and code execution results.
//
// Key Offline & Optimization Features:
//   1. Local Persistent Caching — caches successful loads to localStorage key:
//      `cm_topic_cache_<slug>` for instant 0ms offline loads.
//   2. Active Connectivity Tracking — monitors browser status (online/offline).
//   3. Zero-Latency Restores — instantly serves content from cache if offline.
//   4. Connection Fallback Alert — gracefully handles code runs/tab switching offline,
//      suggesting students study the concept card and offering other offline topics.
// =============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Topic, MCQ, Problem, ExecutionResult } from '@/types/learn';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { playSuccessSound, playErrorSound } from '@/lib/sounds';

// ---------------------------------------------------------------------------
// Dynamic imports for code editors (no SSR — they need browser APIs)
// Monaco = VS Code engine (heavy, great for desktop)
// CodeMirror = lightweight, touch-friendly (great for mobile)
// ---------------------------------------------------------------------------
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />,
});

const CodeMirrorEditor = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl bg-zinc-900 border border-zinc-800" />,
  }
);

const TABS = ['Concept', 'MCQs', 'Problems'] as const;

interface LearnClientProps {
  topic: Topic | null;
  mcqs: MCQ[];
  problems: Problem[];
  isServerOffline?: boolean;
  topicId: string;
}

interface CachedTopicEntry {
  slug: string;
  title: string;
  description: string;
}

export function LearnClient({
  topic: initialTopic,
  mcqs: initialMcqs,
  problems: initialProblems,
  isServerOffline = false,
  topicId,
}: LearnClientProps) {
  // Connectivity state
  const [isOnline, setIsOnline] = useState(true);
  const [isDbOffline, setIsDbOffline] = useState(isServerOffline);
  const [offlineDataRestored, setOfflineDataRestored] = useState(false);

  // Active loaded data
  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [mcqs, setMcqs] = useState<MCQ[]>(initialMcqs);
  const [problems, setProblems] = useState<Problem[]>(initialProblems);

  // Previously cached topics for fallback lookup
  const [offlineTopics, setOfflineTopics] = useState<CachedTopicEntry[]>([]);

  // Mobile detection for editor switching
  const [isMobile, setIsMobile] = useState(false);
  
  // Track active tab to lazy-load Monaco/CodeMirror only when entering Problems tab
  const [activeTab, setActiveTab] = useState<string>('Concept');

  // Monitor connectivity, local cache, and scan cached topics
  useEffect(() => {
    // 1. Connectivity status setup
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setIsDbOffline(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Scan localStorage for other cached topics
    const scanCachedTopics = () => {
      const cachedList: CachedTopicEntry[] = [];
      try {
        const masterListRaw = localStorage.getItem('cm_cached_topics_list');
        if (masterListRaw) {
          const parsed = JSON.parse(masterListRaw);
          if (Array.isArray(parsed)) {
            setOfflineTopics(parsed);
            return;
          }
        }

        // Fallback scan of all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cm_topic_cache_')) {
            const slug = key.replace('cm_topic_cache_', '');
            const rawData = localStorage.getItem(key);
            if (rawData) {
              const parsed = JSON.parse(rawData);
              if (parsed?.topic) {
                cachedList.push({
                  slug,
                  title: parsed.topic.title,
                  description: parsed.topic.description || '',
                });
              }
            }
          }
        }
        setOfflineTopics(cachedList);
      } catch (err) {
        console.warn('Error scanning cached topics:', err);
      }
    };

    scanCachedTopics();

    // 3. Handle offline caching or cache restore
    const cacheKey = `cm_topic_cache_${topicId}`;
    if (isServerOffline) {
      // Server failed to fetch DB data (offline or database unreachable)
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        try {
          const restored = JSON.parse(cachedRaw);
          if (restored.topic) {
            setTopic(restored.topic);
            setMcqs(restored.mcqs || []);
            setProblems(restored.problems || []);
            setOfflineDataRestored(true);
            setIsDbOffline(true);
          }
        } catch (e) {
          console.error('Failed to parse cached topic:', e);
        }
      }
    } else if (initialTopic) {
      // Loaded successfully from server, write/update cache
      try {
        const payload = {
          topic: initialTopic,
          mcqs: initialMcqs,
          problems: initialProblems,
          cachedAt: new Date().toISOString(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(payload));

        // Update master checklist
        const currentListRaw = localStorage.getItem('cm_cached_topics_list');
        let currentList: CachedTopicEntry[] = [];
        if (currentListRaw) {
          try {
            currentList = JSON.parse(currentListRaw);
          } catch {
            currentList = [];
          }
        }
        if (!Array.isArray(currentList)) currentList = [];
        
        const exists = currentList.some((t) => t.slug === topicId);
        if (!exists) {
          currentList.push({
            slug: topicId,
            title: initialTopic.title,
            description: initialTopic.description || '',
          });
          localStorage.setItem('cm_cached_topics_list', JSON.stringify(currentList));
          setOfflineTopics(currentList);
        }
      } catch (err) {
        console.warn('Unable to write local topic cache:', err);
      }
    }

    // 4. Mobile screen resize monitor
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', checkMobile);
    };
  }, [topicId, isServerOffline, initialTopic, initialMcqs, initialProblems]);

  // Keyboard navigation shortcuts (Alt + 1 / 2 / 3) to switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === '1' || e.key === '2' || e.key === '3')) {
        e.preventDefault();
        const tabMap: Record<string, string> = { '1': 'Concept', '2': 'MCQs', '3': 'Problems' };
        const nextTab = tabMap[e.key];
        if (nextTab) setActiveTab(nextTab);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle manual tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Render completely offline not-cached fallback
  if (!topic && (isDbOffline || !isOnline)) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 text-center">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📶</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mb-4">
            Connection Unstable
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            This learning topic has not been saved on this device yet. Let&apos;s study one of your other topics that is ready to read completely offline!
          </p>

          {offlineTopics.length > 0 ? (
            <div className="max-w-md mx-auto space-y-3 text-left">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">
                Offline-Ready Topics
              </h3>
              <div className="grid gap-3">
                {offlineTopics.map((item) => (
                  <a
                    key={item.slug}
                    href={`/learn/${item.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 transition-all hover:bg-zinc-800"
                  >
                    <div>
                      <h4 className="font-semibold text-zinc-100 text-sm">{item.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-1">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-400">Study Offline →</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm mx-auto text-sm text-zinc-500">
              No offline concepts saved yet. Reconnect to the internet to cache your first programming topic!
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg"
          >
            🔄 Try Reconnecting
          </button>
        </div>
      </main>
    );
  }

  // Double check topic availability
  if (!topic) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-10 w-48 bg-zinc-900 rounded-xl" />
          <Skeleton className="h-[300px] w-full bg-zinc-900 rounded-2xl" />
        </div>
      </main>
    );
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mastering ${topic?.title || 'CodeMaster'}!`,
          text: `Check out my progress studying ${topic?.title || 'this topic'} on CodeMaster EdTech!`,
          url: window.location.href,
        });
      } catch { /* ignore */ }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('📋 Lesson link copied to clipboard!');
      } catch { /* ignore */ }
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* Premium Dynamic Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Interactive Lesson</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">{topic.title}</h1>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-sm font-bold text-zinc-200 transition-all active:scale-95 shadow-md self-start sm:self-auto"
        >
          <span>🔗</span> Share Mastery
        </button>
      </div>

      {/* Premium connectivity notifications */}
      {(!isOnline || isDbOffline) && (
        <div className="mb-6 bg-yellow-500/10 border-2 border-yellow-500/20 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">📶</span>
            <div>
              <h4 className="font-bold text-yellow-400 text-sm">
                Running in Offline Mode
              </h4>
              <p className="text-xs text-zinc-300">
                Connection unstable. {offlineDataRestored ? 'Content successfully restored from local cache. ' : ''}You can keep reading concepts!
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full select-none">
            Offline Ready
          </span>
        </div>
      )}

      <Tabs defaultValue="Concept" value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="flex w-full bg-zinc-900 rounded-xl p-1 mb-6 flex-wrap sm:flex-nowrap h-auto sm:h-12 border border-zinc-800">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="Concept">
          <ConceptTab topic={topic} />
        </TabsContent>
        <TabsContent value="MCQs">
          <MCQsTab
            mcqs={mcqs}
            switchToConcept={() => setActiveTab('Concept')}
          />
        </TabsContent>
        <TabsContent value="Problems">
          <ProblemsTab
            problems={problems}
            isMobile={isMobile}
            isOnline={isOnline && !isDbOffline}
            switchToConcept={() => setActiveTab('Concept')}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// =============================================================================
// Concept Tab — HTML + video (fully client-side / offline functional)
// =============================================================================
function ConceptTab({ topic }: { topic: Topic }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-xl">
      {/* Video embed (requires internet) */}
      {topic.videoUrl && (
        <div className="aspect-video mb-8 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner relative group">
          <iframe
            src={topic.videoUrl}
            title={topic.title}
            className="w-full h-full relative z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-4 text-center z-0">
            <span className="text-3xl mb-2">🎬</span>
            <p className="text-xs text-zinc-500 max-w-xs">Video content requires an active internet connection to stream.</p>
          </div>
        </div>
      )}

      {/* Concept HTML content */}
      <div
        className="prose prose-invert prose-zinc max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-2xl"
        dangerouslySetInnerHTML={{ __html: topic.conceptHtml }}
      />
    </div>
  );
}

// =============================================================================
// MCQs Tab — Quiz with offline fallback check
// =============================================================================
interface MCQsTabProps {
  mcqs: MCQ[];
  switchToConcept: () => void;
}

function MCQsTab({ mcqs, switchToConcept }: MCQsTabProps) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

  const handleSelect = (mcqId: string, optionIndex: number) => {
    if (answers[mcqId] !== undefined && answers[mcqId] !== null) return;
    setAnswers((prev) => ({ ...prev, [mcqId]: optionIndex }));

    const selectedMcq = mcqs.find((m) => m.id === mcqId);
    if (selectedMcq) {
      const isCorrect = selectedMcq.options[optionIndex]?.isCorrect;
      if (isCorrect) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    }
  };

  // If completely offline and there are no loaded MCQs, show offline block
  if (mcqs.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center shadow-lg">
        <span className="text-3xl mb-4 block">📶</span>
        <h3 className="text-lg font-bold text-zinc-100 mb-2">Unstable Connection</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Wifi connection is currently slow or disconnected. Study the concepts first to get ready!
        </p>
        <button
          onClick={switchToConcept}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-sm transition-all"
        >
          📚 Study Concepts Offline
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mcqs.map((mcq, qi) => {
        const selectedIndex = answers[mcq.id] ?? null;
        const hasAnswered = selectedIndex !== null;

        return (
          <div key={mcq.id} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-md">
            <h3 className="text-lg font-bold mb-4">
              <span className="text-blue-400">Q{qi + 1}.</span> {mcq.question}
            </h3>

            <div className="space-y-3">
              {mcq.options.map((opt, oi) => {
                let optionStyle = 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/70';
                if (hasAnswered) {
                  if (opt.isCorrect) {
                    optionStyle = 'border-green-500 bg-green-500/10 text-green-300';
                  } else if (oi === selectedIndex && !opt.isCorrect) {
                    optionStyle = 'border-red-500 bg-red-500/10 text-red-300';
                  } else {
                    optionStyle = 'border-zinc-900 opacity-40 bg-zinc-950/10';
                  }
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(mcq.id, oi)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-semibold ${optionStyle} ${
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

            {hasAnswered && (
              <div className="mt-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="font-bold text-blue-400">Explanation: </span>
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
// Problems Tab — Editor + Execution + Connection warnings
// =============================================================================
interface ProblemsTabProps {
  problems: Problem[];
  isMobile: boolean;
  isOnline: boolean;
  switchToConcept: () => void;
  activeTab: string;
}

function ProblemsTab({
  problems,
  isMobile,
  isOnline,
  switchToConcept,
  activeTab,
}: ProblemsTabProps) {
  const [activeProblem, setActiveProblem] = useState(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  // Load starter code on mount or when problems change
  useEffect(() => {
    if (problems && problems.length > 0) {
      const map: Record<string, string> = {};
      problems.forEach((p) => {
        map[p.id] = p.starterCode ?? '';
      });
      setCodeMap(map);
    }
  }, [problems]);

  const problem = problems[activeProblem];
  const code = problem ? (codeMap[problem.id] ?? '') : '';

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined || !problem) return;
    setCodeMap((prev) => ({ ...prev, [problem.id]: value }));
  };

  const handleRunCode = useCallback(async () => {
    if (!problem) return;
    if (!isOnline) {
      setOutput('📶 Cannot run code offline. Please connect to the internet to run and verify your solution on the live compiler.');
      return;
    }

    setIsRunning(true);
    setOutput('Running on compiler...');

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeMap[problem.id], language_id: 71 }),
      });

      if (!res.ok) {
        throw new Error('Execute request failed');
      }

      const result: ExecutionResult = await res.json();

      if (result.compile_output) {
        setOutput(`Compile Error:\n${result.compile_output}`);
        playErrorSound();
      } else if (result.stderr) {
        setOutput(`Error:\n${result.stderr}`);
        playErrorSound();
      } else if (result.stdout) {
        setOutput(result.stdout);
        playSuccessSound();
      } else {
        setOutput('No output');
        playSuccessSound();
      }
    } catch {
      setOutput('📶 The network compiler is currently unreachable. While we try to restore connection, you can keep drafting your code or review the concepts page!');
      playErrorSound();
    }

    setIsRunning(false);
  }, [codeMap, problem, isOnline]);

  // Keyboard shortcut (Cmd + Enter or Ctrl + Enter) to compile code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'Problems' && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleRunCode]);

  // If there are no loaded problems, show offline block
  if (!problem) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center shadow-lg">
        <span className="text-3xl mb-4 block">📶</span>
        <h3 className="text-lg font-bold text-zinc-100 mb-2">Unstable Connection</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Wifi connection is currently slow or disconnected. Study the concepts first to get ready!
        </p>
        <button
          onClick={switchToConcept}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-sm transition-all"
        >
          📚 Study Concepts Offline
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        {problems.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setActiveProblem(i);
              setOutput('');
            }}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              i === activeProblem
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/15'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full mr-2.5 ${
                p.difficulty === 'easy' || p.difficulty === 'fill_blank'
                  ? 'bg-green-400'
                  : p.difficulty === 'medium' || p.difficulty === 'full_code'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
            />
            {p.title}
          </button>
        ))}
      </div>

      {/* Connection notice for Code Compiler */}
      {!isOnline && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-zinc-300">
            <span className="font-bold text-yellow-400 mr-2">📶 Offline Compiler Note:</span>
            You are drafting code offline. Code verification requires internet access. Keep coding, or read concepts in the meantime!
          </p>
          <button
            onClick={switchToConcept}
            className="shrink-0 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold rounded-xl text-xs transition-all"
          >
            📚 Read Concepts Offline
          </button>
        </div>
      )}

      {/* Problem description */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-lg font-bold">{problem.title}</h3>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              problem.difficulty === 'easy' || problem.difficulty === 'fill_blank'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : problem.difficulty === 'medium' || problem.difficulty === 'full_code'
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {problem.difficulty === 'fill_blank' ? 'Fill Blank' : problem.difficulty === 'full_code' ? 'Full Code' : problem.difficulty}
          </span>
        </div>
        <p className="text-zinc-400 leading-relaxed text-sm">{problem.description}</p>
      </div>

      {/* Code Editor */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <span className="text-sm font-semibold text-zinc-400">
            Python 3 — {isMobile ? 'CodeMirror' : 'Monaco Editor'}
          </span>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98"
          >
            {isRunning ? '⏳ Running...' : '▶ Run Code'}
          </button>
        </div>

        {/* Editor area — dynamic lazy load only if Problem tab active */}
        <div className="min-h-[300px] bg-zinc-950">
          {activeTab === 'Problems' && (
            isMobile ? (
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
            )
          )}
        </div>
      </div>

      {/* Mobile-friendly Run Code button */}
      {isMobile && (
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white py-5 rounded-2xl font-extrabold text-lg transition-all shadow-lg active:scale-95"
        >
          {isRunning ? '⏳ Running...' : '▶ Run Code'}
        </button>
      )}

      {/* Output Panel */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-400">Output</span>
          {output && (
            <button
              onClick={() => setOutput('')}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-all font-semibold"
            >
              Clear
            </button>
          )}
        </div>
        <pre className="p-5 text-sm font-mono text-zinc-200 min-h-[120px] bg-zinc-950/40 whitespace-pre-wrap leading-relaxed shadow-inner">
          {output || 'Click "Run Code" to view compiler output here.'}
        </pre>
      </div>
    </div>
  );
}
