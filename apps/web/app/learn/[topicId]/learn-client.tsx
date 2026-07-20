// =============================================================================
// Learn Client — Light Theme, Kid-Friendly Interactive UI
// =============================================================================
// Renders tab navigation (Concept | MCQs | Problems) with bright colors,
// animations, and encouraging feedback. Code editor stays dark.
// =============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Topic, MCQ, Problem, ExecutionResult } from '@/types/learn';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { playSuccessSound, playErrorSound } from '@/lib/sounds';

// ---------------------------------------------------------------------------
// Dynamic imports for code editors (no SSR)
// ---------------------------------------------------------------------------
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
});

const CodeMirrorEditor = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  }
);

const TABS = ['Concept', 'MCQs', 'Problems'] as const;
const TAB_ICONS: Record<string, string> = {
  Concept: '📚',
  MCQs: '❓',
  Problems: '💻',
};

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
  const [isOnline, setIsOnline] = useState(true);
  const [isDbOffline, setIsDbOffline] = useState(isServerOffline);
  const [offlineDataRestored, setOfflineDataRestored] = useState(false);

  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [mcqs, setMcqs] = useState<MCQ[]>(initialMcqs);
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [offlineTopics, setOfflineTopics] = useState<CachedTopicEntry[]>([]);

  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Concept');

  const logActivity = (type: string, id: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const raw = localStorage.getItem('cm_activities');
      let list = [];
      if (raw) list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
      
      const exists = list.some(a => a.date === todayStr && a.type === type && a.id === id);
      if (!exists) {
        list.push({ date: todayStr, type, id });
        localStorage.setItem('cm_activities', JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Unable to log activity:', e);
    }
  };

  const updateStreak = () => {
    try {
      const STREAK_KEY = 'cm_streak';
      const rawStreak = localStorage.getItem(STREAK_KEY);
      let streakData = { streak: 1, longestStreak: 1, lastActivityAt: new Date().toISOString() };
      
      if (rawStreak) {
        const parsed = JSON.parse(rawStreak);
        const now = new Date();
        const last = new Date(parsed.lastActivityAt);
        
        const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round(
          (toDay(now).getTime() - toDay(last).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        let newStreak = parsed.streak;
        if (diffDays === 1) {
          newStreak = parsed.streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
        
        streakData = {
          streak: newStreak,
          longestStreak: Math.max(parsed.longestStreak, newStreak),
          lastActivityAt: now.toISOString()
        };
      }
      
      localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    } catch (e) {
      console.warn('Unable to update streak:', e);
    }
  };

  const handleMCQSolved = (mcqId: string) => {
    try {
      const progressKey = `cm_progress_${topicId}`;
      const raw = localStorage.getItem(progressKey);
      let data = { solved: [] as string[], solvedMCQs: [] as string[], isComplete: false };
      if (raw) {
        const parsed = JSON.parse(raw);
        data = {
          solved: parsed.solved || [],
          solvedMCQs: parsed.solvedMCQs || [],
          isComplete: parsed.isComplete || false
        };
      }
      if (!data.solvedMCQs.includes(mcqId)) {
        data.solvedMCQs.push(mcqId);
        
        const allMCQsComplete = mcqs.every(m => m.id === mcqId || data.solvedMCQs.includes(m.id));
        const allProblemsComplete = problems.every(p => data.solved.includes(p.id));
        data.isComplete = allMCQsComplete && allProblemsComplete;
        
        localStorage.setItem(progressKey, JSON.stringify(data));
        
        logActivity('mcq', mcqId);
        updateStreak();
      }
    } catch (e) {
      console.warn('Unable to save MCQ progress:', e);
    }
  };

  const handleProblemSolved = (problemId: string, problemTitle: string, userCode: string, status: 'success' | 'compile_error' | 'runtime_error') => {
    try {
      const rawSub = localStorage.getItem('cm_submissions');
      let subList = [];
      if (rawSub) subList = JSON.parse(rawSub);
      if (!Array.isArray(subList)) subList = [];
      
      const newSubmission = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: `${topic?.title || 'Coding Challenge'} - ${problemTitle}`,
        status,
        language: 'python',
        timestamp: new Date().toISOString(),
        code: userCode
      };
      
      subList.unshift(newSubmission);
      localStorage.setItem('cm_submissions', JSON.stringify(subList.slice(0, 20)));
    } catch (e) {
      console.warn('Unable to log submission:', e);
    }

    if (status !== 'success') return;

    try {
      const progressKey = `cm_progress_${topicId}`;
      const raw = localStorage.getItem(progressKey);
      let data = { solved: [] as string[], solvedMCQs: [] as string[], isComplete: false };
      if (raw) {
        const parsed = JSON.parse(raw);
        data = {
          solved: parsed.solved || [],
          solvedMCQs: parsed.solvedMCQs || [],
          isComplete: parsed.isComplete || false
        };
      }
      if (!data.solved.includes(problemId)) {
        data.solved.push(problemId);
        
        const allMCQsComplete = mcqs.every(m => data.solvedMCQs.includes(m.id));
        const allProblemsComplete = problems.every(p => p.id === problemId || data.solved.includes(p.id));
        data.isComplete = allMCQsComplete && allProblemsComplete;
        
        localStorage.setItem(progressKey, JSON.stringify(data));
        
        logActivity('problem', problemId);
        updateStreak();
      }
    } catch (e) {
      console.warn('Unable to save problem progress:', e);
    }
  };

  // Monitor connectivity, local cache, and scan cached topics
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setIsDbOffline(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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

    const cacheKey = `cm_topic_cache_${topicId}`;
    if (isServerOffline) {
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
      try {
        const payload = {
          topic: initialTopic,
          mcqs: initialMcqs,
          problems: initialProblems,
          cachedAt: new Date().toISOString(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(payload));

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

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', checkMobile);
    };
  }, [topicId, isServerOffline, initialTopic, initialMcqs, initialProblems]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === '1' || e.key === '2' || e.key === '3')) {
        e.preventDefault();
        const tabMap: Record<string, string> = { '1': 'Concept', '2': 'MCQs', '3': 'Problems' };
        const nextTab = tabMap[e.key];
        if (nextTab) setActiveTab(nextTab);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Completely offline, no cached data
  if (!topic && (isDbOffline || !isOnline)) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 text-center">
        <div className="bg-white border-2 border-orange-200 rounded-3xl p-8 sm:p-12 shadow-lg">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📶</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-4">
            Connection Unstable
          </h2>
          <p className="text-[#64648B] text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            This topic hasn&apos;t been saved on this device yet. Try one of your offline-ready topics!
          </p>

          {offlineTopics.length > 0 ? (
            <div className="max-w-md mx-auto space-y-3 text-left">
              <h3 className="text-xs font-bold text-[#9E9EB8] uppercase tracking-widest px-1">
                📱 Offline-Ready Topics
              </h3>
              <div className="grid gap-3">
                {offlineTopics.map((item) => (
                  <a
                    key={item.slug}
                    href={`/learn/${item.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-400 transition-all hover:shadow-md"
                  >
                    <div>
                      <h4 className="font-bold text-[#1A1A2E] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#9E9EB8] line-clamp-1">{item.description}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600">Study →</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl max-w-sm mx-auto text-sm text-[#9E9EB8]">
              No offline topics saved yet. Connect to the internet to cache your first topic!
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-lg active:scale-[0.97]"
          >
            🔄 Try Reconnecting
          </button>
        </div>
      </main>
    );
  }

  if (!topic) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
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
          text: `Check out my progress studying ${topic?.title || 'this topic'} on CodeMaster!`,
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
      {/* Dynamic Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white border-2 border-purple-100 rounded-2xl p-5 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Interactive Lesson</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight mt-1">{topic.title}</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-sm font-bold text-purple-700 transition-all active:scale-95 shadow-sm"
          >
            <span>🔗</span> Share
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Legend */}
      <KeyboardShortcutLegend />

      {/* Connectivity Notices */}
      {(!isOnline || isDbOffline) && (
        <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">📶</span>
            <div>
              <h4 className="font-bold text-orange-700 text-sm">
                Running in Offline Mode
              </h4>
              <p className="text-xs text-orange-600/70">
                Connection unstable. {offlineDataRestored ? 'Content restored from cache. ' : ''}You can keep reading concepts!
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-orange-200 text-orange-700 rounded-full select-none">
            Offline Ready
          </span>
        </div>
      )}

      <Tabs defaultValue="Concept" value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="flex w-full bg-gray-100 rounded-2xl p-1.5 mb-6 flex-wrap sm:flex-nowrap h-auto sm:h-14 border border-gray-200">
          {TABS.map((tab, idx) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md text-gray-500 hover:text-gray-700 gap-2"
            >
              <span>{TAB_ICONS[tab]}</span>
              {tab}
              <span className="hidden sm:inline-block text-[9px] font-mono opacity-40 ml-1.5">Ctrl+{idx + 1}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Concept">
          <ConceptTab topic={topic} />
        </TabsContent>
        <TabsContent value="MCQs">
          <MCQsTab
            mcqs={mcqs}
            switchToConcept={() => setActiveTab('Concept')}
            onMCQSolved={handleMCQSolved}
          />
        </TabsContent>
        <TabsContent value="Problems">
          <ProblemsTab
            problems={problems}
            isMobile={isMobile}
            isOnline={isOnline && !isDbOffline}
            switchToConcept={() => setActiveTab('Concept')}
            activeTab={activeTab}
            onProblemSolved={handleProblemSolved}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// =============================================================================
// Keyboard Shortcut Legend
// =============================================================================
function KeyboardShortcutLegend() {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone/.test(navigator.userAgent);
  const mod = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { keys: `Ctrl+1`, desc: 'Concept tab' },
    { keys: `Ctrl+2`, desc: 'MCQs tab' },
    { keys: `Ctrl+3`, desc: 'Problems tab' },
    { keys: `${mod}+↵`, desc: 'Run code' },
    { keys: `Ctrl+←/→`, desc: 'Switch problem' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white border-2 border-purple-100 rounded-2xl p-4 shadow-xl w-56 animate-slide-in">
          <h4 className="text-[10px] font-bold text-[#9E9EB8] uppercase tracking-widest mb-3">⌨️ Keyboard Shortcuts</h4>
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-xs text-[#64648B]">{s.desc}</span>
                <kbd className="text-[10px] font-mono bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5 text-[#1A1A2E]">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all shadow-lg border-2 ${
          isOpen
            ? 'bg-purple-600 border-purple-500 text-white shadow-purple-600/20'
            : 'bg-white border-gray-200 text-gray-500 hover:text-purple-600 hover:border-purple-300 shadow-gray-200/50'
        }`}
        title="Keyboard shortcuts"
      >
        ⌨️
      </button>
    </div>
  );
}

// =============================================================================
// Concept Tab
// =============================================================================
function ConceptTab({ topic }: { topic: Topic }) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 shadow-sm">
      {topic.videoUrl && (
        <div className="aspect-video mb-8 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner relative group">
          <iframe
            src={topic.videoUrl}
            title={topic.title}
            className="w-full h-full relative z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-4 text-center z-0">
            <span className="text-3xl mb-2">🎬</span>
            <p className="text-xs text-[#9E9EB8] max-w-xs">Video requires internet connection.</p>
          </div>
        </div>
      )}

      <div
        className="prose-light max-w-none [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:mb-4 [&_h2]:text-[#1A1A2E] [&_p]:text-[#64648B] [&_p]:leading-relaxed [&_p]:mb-4 [&_pre]:bg-[#1E1E2E] [&_pre]:text-[#CDD6F4] [&_pre]:p-5 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-gray-200 [&_pre]:mb-6 [&_pre]:overflow-x-auto [&_code]:text-purple-600 [&_code]:bg-purple-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_pre_code]:text-[#CDD6F4] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-[#1A1A2E] [&_strong]:font-bold"
        dangerouslySetInnerHTML={{ __html: topic.conceptHtml }}
      />
    </div>
  );
}

// =============================================================================
// MCQs Tab
// =============================================================================
interface MCQsTabProps {
  mcqs: MCQ[];
  switchToConcept: () => void;
  onMCQSolved: (mcqId: string) => void;
}

function MCQsTab({ mcqs, switchToConcept, onMCQSolved }: MCQsTabProps) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [shakeId, setShakeId] = useState<string | null>(null);

  const handleSelect = (mcqId: string, optionIndex: number) => {
    if (answers[mcqId] !== undefined && answers[mcqId] !== null) return;
    setAnswers((prev) => ({ ...prev, [mcqId]: optionIndex }));

    const selectedMcq = mcqs.find((m) => m.id === mcqId);
    if (selectedMcq) {
      const isCorrect = selectedMcq.options[optionIndex]?.isCorrect;
      if (isCorrect) {
        playSuccessSound();
        onMCQSolved(mcqId);
      } else {
        playErrorSound();
        setShakeId(mcqId);
        setTimeout(() => setShakeId(null), 600);
      }
    }
  };

  if (mcqs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-orange-200 text-center shadow-sm">
        <span className="text-3xl mb-4 block">📶</span>
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">Unstable Connection</h3>
        <p className="text-sm text-[#64648B] max-w-md mx-auto mb-6">
          Study the concepts first while we restore your connection!
        </p>
        <button
          onClick={switchToConcept}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-white text-sm transition-all"
        >
          📚 Study Concepts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
      {mcqs.map((mcq, qi) => {
        const selectedIndex = answers[mcq.id] ?? null;
        const hasAnswered = selectedIndex !== null;
        const isShaking = shakeId === mcq.id;

        return (
          <div
            key={mcq.id}
            className={`bg-white rounded-2xl p-6 border-2 shadow-sm transition-all ${
              hasAnswered
                ? mcq.options[selectedIndex]?.isCorrect
                  ? 'border-teal-300 bg-teal-50/30'
                  : 'border-red-300 bg-red-50/30'
                : 'border-gray-100'
            } ${isShaking ? 'animate-shake' : ''}`}
          >
            <h3 className="text-lg font-bold mb-4 text-[#1A1A2E]">
              <span className="text-purple-600">Q{qi + 1}.</span> {mcq.question}
            </h3>

            <div className="space-y-3">
              {mcq.options.map((opt, oi) => {
                let optionStyle = 'border-gray-200 hover:border-purple-300 bg-gray-50 hover:bg-purple-50 text-[#1A1A2E]';
                if (hasAnswered) {
                  if (opt.isCorrect) {
                    optionStyle = 'border-teal-400 bg-teal-50 text-teal-800';
                  } else if (oi === selectedIndex && !opt.isCorrect) {
                    optionStyle = 'border-red-400 bg-red-50 text-red-700';
                  } else {
                    optionStyle = 'border-gray-100 opacity-40 bg-gray-50';
                  }
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(mcq.id, oi)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-semibold ${optionStyle} ${
                      !hasAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                    }`}
                  >
                    <span className="font-mono text-sm text-[#9E9EB8] mr-3">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt.text}
                    {hasAnswered && opt.isCorrect && (
                      <span className="ml-2">✅</span>
                    )}
                    {hasAnswered && oi === selectedIndex && !opt.isCorrect && (
                      <span className="ml-2">❌</span>
                    )}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className={`mt-4 p-4 rounded-xl border ${
                mcq.options[selectedIndex]?.isCorrect
                  ? 'bg-teal-50 border-teal-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm leading-relaxed">
                  <span className="font-bold text-purple-700">💡 Explanation: </span>
                  <span className="text-[#64648B]">{mcq.explanation}</span>
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
// Problems Tab
// =============================================================================
interface ProblemsTabProps {
  problems: Problem[];
  isMobile: boolean;
  isOnline: boolean;
  switchToConcept: () => void;
  activeTab: string;
  onProblemSolved: (problemId: string, problemTitle: string, userCode: string, status: 'success' | 'compile_error' | 'runtime_error') => void;
}

function ProblemsTab({
  problems,
  isMobile,
  isOnline,
  switchToConcept,
  activeTab,
  onProblemSolved,
}: ProblemsTabProps) {
  const [activeProblem, setActiveProblem] = useState(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

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
      setOutput('📶 Cannot run code offline. Please connect to the internet.');
      setIsSuccess(false);
      return;
    }

    setIsRunning(true);
    setOutput('Running on compiler...');
    setIsSuccess(null);

    let finalStatus: 'success' | 'compile_error' | 'runtime_error' = 'success';

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
        setIsSuccess(false);
        finalStatus = 'compile_error';
        playErrorSound();
      } else if (result.stderr) {
        setOutput(`Error:\n${result.stderr}`);
        setIsSuccess(false);
        finalStatus = 'runtime_error';
        playErrorSound();
      } else if (result.stdout) {
        setOutput(result.stdout);
        setIsSuccess(true);
        playSuccessSound();
      } else {
        setOutput('No output');
        setIsSuccess(true);
        playSuccessSound();
      }

      onProblemSolved(problem.id, problem.title, codeMap[problem.id] ?? '', finalStatus);
    } catch {
      setOutput('📶 The compiler is currently unreachable. Keep drafting your code!');
      setIsSuccess(false);
      playErrorSound();
    }

    setIsRunning(false);
  }, [codeMap, problem, isOnline, onProblemSolved]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'Problems') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }

      if (e.ctrlKey && !e.metaKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveProblem((prev) => Math.max(0, prev - 1));
        setOutput('');
        setIsSuccess(null);
      }
      if (e.ctrlKey && !e.metaKey && e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveProblem((prev) => Math.min(problems.length - 1, prev + 1));
        setOutput('');
        setIsSuccess(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleRunCode, problems.length]);

  if (!problem) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-orange-200 text-center shadow-sm">
        <span className="text-3xl mb-4 block">📶</span>
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">Unstable Connection</h3>
        <p className="text-sm text-[#64648B] max-w-md mx-auto mb-6">
          Study the concepts first to get ready!
        </p>
        <button
          onClick={switchToConcept}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-white text-sm transition-all"
        >
          📚 Study Concepts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        {problems.map((p, i) => {
          const difficultyColor = 
            p.difficulty === 'easy' || p.difficulty === 'fill_blank'
              ? 'bg-teal-400'
              : p.difficulty === 'medium' || p.difficulty === 'full_code'
                ? 'bg-orange-400'
                : 'bg-red-400';

          return (
            <button
              key={p.id}
              onClick={() => {
                setActiveProblem(i);
                setOutput('');
                setIsSuccess(null);
              }}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                i === activeProblem
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/15'
                  : 'bg-white border-gray-200 text-[#64648B] hover:text-[#1A1A2E] hover:border-purple-200'
              }`}
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2.5 ${difficultyColor}`} />
              {p.title}
            </button>
          );
        })}
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-[#64648B]">
            <span className="font-bold text-orange-600 mr-2">📶 Offline Note:</span>
            You&apos;re drafting code offline. Running code requires internet.
          </p>
          <button
            onClick={switchToConcept}
            className="shrink-0 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl text-xs transition-all border border-orange-200"
          >
            📚 Read Concepts
          </button>
        </div>
      )}

      {/* Problem description */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-lg font-bold text-[#1A1A2E]">{problem.title}</h3>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              problem.difficulty === 'easy' || problem.difficulty === 'fill_blank'
                ? 'bg-teal-100 text-teal-700 border border-teal-200'
                : problem.difficulty === 'medium' || problem.difficulty === 'full_code'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {problem.difficulty === 'fill_blank' ? 'Fill Blank' : problem.difficulty === 'full_code' ? 'Full Code' : problem.difficulty}
          </span>
        </div>
        <p className="text-[#64648B] leading-relaxed text-sm">{problem.description}</p>
      </div>

      {/* Code Editor — stays dark for readability */}
      <div className="bg-[#1E1E2E] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#1E1E2E]">
          <span className="text-sm font-semibold text-gray-400">
            🐍 Python 3 — {isMobile ? 'CodeMirror' : 'Monaco Editor'}
          </span>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-teal-500 hover:bg-teal-400 disabled:bg-gray-600 disabled:text-gray-400 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.97] flex items-center gap-2"
          >
            {isRunning ? '⏳ Running...' : (<>▶ Run Code <span className="hidden sm:inline text-[10px] font-mono opacity-60 bg-teal-600/50 rounded px-1.5 py-0.5">⌘↵</span></>)}
          </button>
        </div>

        <div className="min-h-[300px] bg-[#1E1E2E]">
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

      {/* Mobile Run button */}
      {isMobile && (
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-gray-300 text-white py-5 rounded-2xl font-extrabold text-lg transition-all shadow-lg active:scale-95"
        >
          {isRunning ? '⏳ Running...' : '▶ Run Code'}
        </button>
      )}

      {/* Output Panel */}
      <div className={`bg-white rounded-2xl overflow-hidden border-2 shadow-sm transition-all ${
        isSuccess === true ? 'border-teal-300' : isSuccess === false ? 'border-red-300' : 'border-gray-100'
      }`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isSuccess === true ? 'bg-teal-50 border-teal-200' : isSuccess === false ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
        }`}>
          <span className={`text-sm font-bold ${
            isSuccess === true ? 'text-teal-700' : isSuccess === false ? 'text-red-700' : 'text-[#64648B]'
          }`}>
            {isSuccess === true ? '✅ Output — Success!' : isSuccess === false ? '❌ Output — Error' : '📤 Output'}
          </span>
          {output && (
            <button
              onClick={() => { setOutput(''); setIsSuccess(null); }}
              className="text-xs text-[#9E9EB8] hover:text-[#64648B] transition-all font-semibold"
            >
              Clear
            </button>
          )}
        </div>
        <pre className="p-5 text-sm font-mono text-[#1A1A2E] min-h-[120px] bg-white whitespace-pre-wrap leading-relaxed">
          {output || 'Click "Run Code" to view compiler output here. 🚀'}
        </pre>
      </div>
    </div>
  );
}
