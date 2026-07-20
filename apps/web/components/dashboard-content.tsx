// =============================================================================
// Dashboard Content — Light Theme, Kid-Friendly
// =============================================================================
// Bright, colorful dashboard with animated welcome, streak, progress,
// badges, and redesigned course cards.
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { StreakCard } from '@/components/streak-card';
import { TopicProgress } from '@/components/topic-progress';
import { BadgeDisplay } from '@/components/badge-display';
import { CourseCard } from '@/components/course-card';

// ---------------------------------------------------------------------------
// Simulated topic data
// ---------------------------------------------------------------------------
const TOPICS = [
  {
    topicId: 'loops-001',
    topicTitle: 'Loops in Python',
    totalProblems: 3,
    problemIds: ['prob-1', 'prob-2', 'prob-3'],
  },
];

const STREAK_KEY = 'cm_streak';
const progressKey = (topicId: string) => `cm_progress_${topicId}`;

interface StreakData {
  streak: number;
  longestStreak: number;
  lastActivityAt: string;
}

interface TopicProgressData {
  solved: string[];
  total: number;
  isComplete: boolean;
}

function calculateUpdatedStreak(data: StreakData): StreakData {
  const now = new Date();
  const last = new Date(data.lastActivityAt);

  const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (toDay(now).getTime() - toDay(last).getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = data.streak;
  if (diffDays === 0) {
    newStreak = data.streak;
  } else if (diffDays === 1) {
    newStreak = data.streak + 1;
  } else {
    newStreak = 1;
  }

  return {
    streak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActivityAt: now.toISOString(),
  };
}

export function DashboardContent() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [topicProgress, setTopicProgress] = useState<
    Map<string, TopicProgressData>
  >(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // --- Streak ---
    const rawStreak = localStorage.getItem(STREAK_KEY);
    let streak: StreakData;

    if (rawStreak) {
      const parsed: StreakData = JSON.parse(rawStreak);
      streak = calculateUpdatedStreak(parsed);
    } else {
      streak = {
        streak: 1,
        longestStreak: 1,
        lastActivityAt: new Date().toISOString(),
      };
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    setStreakData(streak);

    // --- Topic Progress ---
    const progressMap = new Map<string, TopicProgressData>();
    for (const topic of TOPICS) {
      const raw = localStorage.getItem(progressKey(topic.topicId));
      if (raw) {
        progressMap.set(topic.topicId, JSON.parse(raw));
      } else {
        const initial: TopicProgressData = {
          solved: [],
          total: topic.totalProblems,
          isComplete: false,
        };
        localStorage.setItem(
          progressKey(topic.topicId),
          JSON.stringify(initial)
        );
        progressMap.set(topic.topicId, initial);
      }
    }
    setTopicProgress(progressMap);
    setIsLoaded(true);
  }, []);

  if (!isLoaded || !streakData) {
    return (
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-100 rounded-2xl w-80" />
          <div className="h-6 bg-gray-100 rounded-xl w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-40 bg-gray-100 rounded-3xl" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
          </div>
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-3xl" />
        </div>
      </main>
    );
  }

  const badgeData = TOPICS.map((topic) => {
    const progress = topicProgress.get(topic.topicId);
    return {
      topicTitle: topic.topicTitle,
      badge: progress?.isComplete ? `${topic.topicTitle} Master` : null,
      isComplete: progress?.isComplete ?? false,
    };
  });

  const totalSolved = TOPICS.reduce((acc, t) => {
    const p = topicProgress.get(t.topicId);
    return acc + (p?.solved.length ?? 0);
  }, 0);
  const totalProblems = TOPICS.reduce((acc, t) => acc + t.totalProblems, 0);
  const overallPercent =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      {/* Course Hero Banner */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-zinc-200 p-8 sm:p-10 shadow-sm">
          <div className="relative max-w-2xl">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              Active Course
            </span>
            <h1 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">
              Python Fundamentals
            </h1>
            <p className="text-zinc-650 text-sm sm:text-base mb-6 leading-relaxed font-medium">
              Master Python basics: variables, loops, conditionals, lists, and functions with interactive coding problems.
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <a
                href="/learn/python-loops"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm text-center"
              >
                Continue Learning
              </a>
              
              <div className="flex-grow max-w-xs">
                <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-1.5">
                  <span>Progress (Loops)</span>
                  <span>{overallPercent}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="relative">
        <div className="flex items-center gap-2 mb-8 pb-3 border-b border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Learning Path
          </h2>
        </div>

        {/* Path container */}
        <div className="relative max-w-2xl mx-auto px-4 py-4">
          {/* Vertical connecting line */}
          <div className="absolute left-[27px] sm:left-1/2 top-8 bottom-8 w-0.5 bg-zinc-200 transform -translate-x-1/2 rounded-full z-0" />

          <div className="space-y-10 relative z-10">
            
            {/* Unit 1: Welcome */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm sm:mx-auto">
                ✓
              </div>
              <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all sm:max-w-sm">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Unit 1 · Completed</span>
                <h3 className="text-base font-bold text-zinc-900 mt-1 mb-1.5">Introduction to Coding</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Learn what coding is, write your very first output statements, and explore the python shell.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                  <span>✓ 100% Completed</span>
                </div>
              </div>
            </div>

            {/* Unit 2: Loops in Python */}
            <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-sm sm:mx-auto relative">
                2
                {overallPercent < 100 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border border-white animate-pulse" />
                )}
              </div>
              <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all sm:max-w-sm sm:ml-auto">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Unit 2 · In Progress</span>
                <h3 className="text-base font-bold text-zinc-900 mt-1 mb-1.5">Loops & Iterations</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Repeat statements easily using loops! Master `for` and `while` loop controls.
                </p>
                <div className="mt-3.5 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-zinc-400">{overallPercent}% Complete</span>
                  <a
                    href="/learn/python-loops"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm select-none"
                  >
                    {overallPercent === 100 ? 'Review' : 'Continue'}
                  </a>
                </div>
              </div>
            </div>

            {/* Unit 3: Variables & Math */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-sm shadow-sm sm:mx-auto">
                3
              </div>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 opacity-70 sm:max-w-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit 3 · Locked</span>
                <h3 className="text-base font-bold text-zinc-500 mt-1 mb-1.5">Variables & Arithmetic</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Store numbers and text inside variables, and do math calculations to build calculator apps.
                </p>
              </div>
            </div>

            {/* Unit 4: Conditionals */}
            <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-sm shadow-sm sm:mx-auto">
                4
              </div>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 opacity-70 sm:max-w-sm sm:ml-auto">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit 4 · Locked</span>
                <h3 className="text-base font-bold text-zinc-500 mt-1 mb-1.5">Conditional Statements</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Make your programs make decisions using `if`, `elif`, and `else` conditions.
                </p>
              </div>
            </div>

            {/* Unit 5: Lists */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-sm shadow-sm sm:mx-auto">
                5
              </div>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 opacity-70 sm:max-w-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit 5 · Locked</span>
                <h3 className="text-base font-bold text-zinc-500 mt-1 mb-1.5">Lists & Arrays</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Learn to store collections of data in Lists and sort/filter them using Python.
                </p>
              </div>
            </div>

            {/* Unit 6: Functions */}
            <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-sm shadow-sm sm:mx-auto">
                6
              </div>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 opacity-70 sm:max-w-sm sm:ml-auto">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit 6 · Locked</span>
                <h3 className="text-base font-bold text-zinc-500 mt-1 mb-1.5">Functions & Modules</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Write reusable blocks of code called functions, import helper libraries, and build mini-projects.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
