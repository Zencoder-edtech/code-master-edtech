// =============================================================================
// Streak Card — Light Theme, Kid-Friendly
// =============================================================================
// Warm gradient card showing the user's coding streak.
// Features animated flame, circular progress, milestone messages.
// =============================================================================

'use client';

import { useState } from 'react';

interface StreakCardProps {
  streak: number;
  longestStreak: number;
}

function getStreakShareMessage(streak: number): string {
  if (streak >= 100) return `🔥💯 UNSTOPPABLE! I've been coding for ${streak} days straight on CodeMaster! Can you beat my streak?`;
  if (streak >= 30) return `🔥🏆 ${streak}-day coding streak on CodeMaster! One month of daily practice — I'm on fire!`;
  if (streak >= 14) return `🔥 Two weeks strong! ${streak}-day coding streak on CodeMaster. Consistency is key!`;
  if (streak >= 7) return `🔥 ${streak}-day coding streak on CodeMaster! One full week of daily coding practice!`;
  if (streak >= 3) return `🔥 ${streak} days and counting! Building my coding streak on CodeMaster.`;
  return `🔥 Started my coding streak on CodeMaster! Day ${streak} — let's go!`;
}

function getStreakEncouragement(streak: number): string {
  if (streak >= 30) return "You're a coding legend! 🌟";
  if (streak >= 14) return "Two weeks strong! Amazing! 💪";
  if (streak >= 7) return "One full week! Keep it up! 🎯";
  if (streak >= 3) return "Great start, keep going! 🚀";
  return "Every journey starts with day 1! ✨";
}

export function StreakCard({ streak, longestStreak }: StreakCardProps) {
  const isActive = streak > 0;
  const [copied, setCopied] = useState(false);

  const handleShareStreak = async () => {
    const text = getStreakShareMessage(streak);
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://codemaster.dev';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `🔥 ${streak}-Day Coding Streak!`, text, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch { /* ignore */ }
    }
  };

  // Progress percentage toward longest streak
  const progressPercent = longestStreak > 0 ? Math.min((streak / longestStreak) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40; // radius 40
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative group card-hover" id="streak-card">
      {/* Card content */}
      <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200/60 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-sm">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-200/20 to-transparent rounded-tr-full" />

        <div className="relative flex items-center gap-5">
          {/* Circular Progress Ring with Flame */}
          <div className="flex-shrink-0 relative">
            <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="48" cy="48" r="40"
                fill="none"
                stroke="#FED7AA"
                strokeWidth="6"
              />
              {/* Progress ring */}
              <circle
                cx="48" cy="48" r="40"
                fill="none"
                stroke="url(#streakGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
            {/* Flame emoji in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-3xl"
                style={isActive ? { animation: 'streakPulse 2s ease-in-out infinite' } : {}}
              >
                {isActive ? '🔥' : '💤'}
              </span>
            </div>
          </div>

          {/* Streak info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-gradient-orange">
                {streak}
              </span>
              <span className="text-sm font-bold text-orange-600/70 uppercase tracking-widest">
                day{streak !== 1 ? 's' : ''} streak
              </span>
            </div>

            <p className="text-sm text-orange-700/60 mt-1 font-medium">
              {isActive ? (
                <>
                  Best: <span className="text-orange-700 font-bold">{longestStreak} days</span>
                  {streak >= longestStreak && streak > 1 && (
                    <span className="ml-2 text-yellow-500 text-xs font-bold">🏆 Personal best!</span>
                  )}
                </>
              ) : (
                'Start learning to build your streak!'
              )}
            </p>

            <p className="text-xs text-orange-600/50 mt-2 font-semibold">
              {getStreakEncouragement(streak)}
            </p>
          </div>
        </div>

        {/* Share Button */}
        {isActive && (
          <div className="relative mt-5 pt-5 border-t border-orange-200/60">
            <button
              onClick={handleShareStreak}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border border-orange-200 hover:border-orange-300 text-sm font-bold text-orange-700 hover:text-orange-800 transition-all active:scale-[0.98] shadow-sm"
            >
              <span className="text-base">📲</span>
              {copied ? '✓ Copied to clipboard!' : 'Share My Streak'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
