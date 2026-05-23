// =============================================================================
// Dashboard Content — Client Component
// =============================================================================
// Renders the full dashboard with streak, topic progress, badges, and courses.
// Uses localStorage to simulate progress/streak data until the DB is wired.
//
// localStorage schema:
//   cm_streak          — { streak: number, longestStreak: number, lastActivityAt: string }
//   cm_progress_<id>   — { solved: string[], total: number, isComplete: boolean }
//
// On first visit, simulated seed data is written so the dashboard isn't empty.
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { StreakCard } from '@/components/streak-card';
import { TopicProgress } from '@/components/topic-progress';
import { BadgeDisplay } from '@/components/badge-display';
import { CourseCard } from '@/components/course-card';

// ---------------------------------------------------------------------------
// Simulated topic data (mirrors what's in python-loops.ts seed data)
// ---------------------------------------------------------------------------
const TOPICS = [
  {
    topicId: 'loops-001',
    topicTitle: 'Loops in Python',
    totalProblems: 3,
    problemIds: ['prob-1', 'prob-2', 'prob-3'],
  },
];

// ---------------------------------------------------------------------------
// LocalStorage Keys
// ---------------------------------------------------------------------------
const STREAK_KEY = 'cm_streak';
const progressKey = (topicId: string) => `cm_progress_${topicId}`;

// ---------------------------------------------------------------------------
// Types for localStorage data
// ---------------------------------------------------------------------------
interface StreakData {
  streak: number;
  longestStreak: number;
  lastActivityAt: string; // ISO string
}

interface TopicProgressData {
  solved: string[];
  total: number;
  isComplete: boolean;
}

// ---------------------------------------------------------------------------
// Streak calculation (mirrors UpdateStreakUseCase logic)
// ---------------------------------------------------------------------------
function calculateUpdatedStreak(data: StreakData): StreakData {
  const now = new Date();
  const last = new Date(data.lastActivityAt);

  const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (toDay(now).getTime() - toDay(last).getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = data.streak;
  if (diffDays === 0) {
    // Same day — keep
    newStreak = data.streak;
  } else if (diffDays === 1) {
    // Yesterday — increment
    newStreak = data.streak + 1;
  } else {
    // Gap ≥ 2 days — reset
    newStreak = 1;
  }

  return {
    streak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActivityAt: now.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Dashboard Content Component
// ---------------------------------------------------------------------------
export function DashboardContent() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [topicProgress, setTopicProgress] = useState<
    Map<string, TopicProgressData>
  >(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and calculate streak/progress on mount
  useEffect(() => {
    // --- Streak ---
    const rawStreak = localStorage.getItem(STREAK_KEY);
    let streak: StreakData;

    if (rawStreak) {
      const parsed: StreakData = JSON.parse(rawStreak);
      streak = calculateUpdatedStreak(parsed);
    } else {
      // First ever visit — seed with streak of 1
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
        // Seed with empty progress
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

  // Don't render until localStorage is loaded (avoids hydration mismatch)
  if (!isLoaded || !streakData) {
    return (
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-zinc-900 rounded-3xl" />
          <div className="h-24 bg-zinc-900 rounded-2xl" />
          <div className="h-40 bg-zinc-900 rounded-2xl" />
        </div>
      </main>
    );
  }

  // Build badge data
  const badgeData = TOPICS.map((topic) => {
    const progress = topicProgress.get(topic.topicId);
    return {
      topicTitle: topic.topicTitle,
      badge: progress?.isComplete ? `${topic.topicTitle} Master` : null,
      isComplete: progress?.isComplete ?? false,
    };
  });

  // Calculate overall progress for course card
  const totalSolved = TOPICS.reduce((acc, t) => {
    const p = topicProgress.get(t.topicId);
    return acc + (p?.solved.length ?? 0);
  }, 0);
  const totalProblems = TOPICS.reduce((acc, t) => acc + t.totalProblems, 0);
  const overallPercent =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
      {/* Welcome Section */}
      <section className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Welcome back,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Student!
          </span>{' '}
          👋
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Pick up right where you left off. The world of coding is waiting for
          you.
        </p>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* Stats Grid — Streak + Progress Side by Side */}
      {/* ------------------------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Streak Card */}
        <StreakCard
          streak={streakData.streak}
          longestStreak={streakData.longestStreak}
        />

        {/* Topic Progress Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-1">
            Topic Progress
          </h3>
          {TOPICS.map((topic) => {
            const progress = topicProgress.get(topic.topicId);
            return (
              <TopicProgress
                key={topic.topicId}
                topicTitle={topic.topicTitle}
                solved={progress?.solved.length ?? 0}
                total={topic.totalProblems}
                isComplete={progress?.isComplete ?? false}
              />
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* Badges Section */}
      {/* ------------------------------------------------------------------- */}
      <section className="mb-10">
        <BadgeDisplay badges={badgeData} />
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* Courses Section */}
      {/* ------------------------------------------------------------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-zinc-100 border-b border-zinc-800 pb-4">
          In Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 
            Currently hardcoded to Python Fundamentals.
            In Phase 3, this will be a .map() over the user's progress records from the DB. 
          */}
          <CourseCard
            title="Python Fundamentals"
            description="Master the basics of Python including Variables, Loops, Conditionals, and Functions."
            topicId="python-loops"
            progressPercent={overallPercent}
          />
        </div>
      </section>
    </main>
  );
}
