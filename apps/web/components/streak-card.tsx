// =============================================================================
// Streak Card Component
// =============================================================================
// Premium glassmorphism card displaying the user's current streak.
// Features an animated flame icon, large streak counter, and longest
// streak sub-text. Uses gradient glow and subtle pulse animation.
// =============================================================================

'use client';

interface StreakCardProps {
  streak: number;
  longestStreak: number;
}

export function StreakCard({ streak, longestStreak }: StreakCardProps) {
  const isActive = streak > 0;

  return (
    <div className="relative group" id="streak-card">
      {/* Animated glow behind the card */}
      <div
        className={`absolute -inset-0.5 rounded-3xl blur transition duration-700 ${
          isActive
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 opacity-30 group-hover:opacity-50'
            : 'bg-zinc-700 opacity-10'
        }`}
      />

      {/* Card content */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 overflow-hidden">
        {/* Background decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />

        <div className="relative flex items-center gap-5">
          {/* Flame icon container */}
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
              isActive
                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                : 'bg-zinc-800 border border-zinc-700'
            }`}
            style={isActive ? { animation: 'streakPulse 2s ease-in-out infinite' } : {}}
          >
            {isActive ? '🔥' : '💤'}
          </div>

          {/* Streak info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isActive
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400'
                    : 'text-zinc-500'
                }`}
              >
                {streak}
              </span>
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                day{streak !== 1 ? 's' : ''} streak
              </span>
            </div>

            <p className="text-sm text-zinc-500 mt-1">
              {isActive ? (
                <>
                  Best: <span className="text-zinc-300 font-semibold">{longestStreak} days</span>
                  {streak >= longestStreak && streak > 1 && (
                    <span className="ml-2 text-yellow-400 text-xs font-bold">🏆 Personal best!</span>
                  )}
                </>
              ) : (
                'Start learning to build your streak!'
              )}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
