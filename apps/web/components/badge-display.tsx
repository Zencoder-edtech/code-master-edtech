// =============================================================================
// Badge Display — Light Theme, Animated
// =============================================================================
// Bright badge cards with shimmer effects for earned badges,
// friendly locked state for not-yet-earned ones.
// =============================================================================

'use client';

interface Badge {
  topicTitle: string;
  badge: string | null;
  isComplete: boolean;
}

interface BadgeDisplayProps {
  badges: Badge[];
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const earned = badges.filter((b) => b.isComplete);
  const locked = badges.filter((b) => !b.isComplete);

  return (
    <div id="badge-display">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center border border-pink-200">
          <span className="text-xl">🏅</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1A1A2E]">Your Badges</h3>
          <p className="text-xs text-[#9E9EB8] font-medium">
            {earned.length} earned · {locked.length} to unlock
          </p>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 stagger-children">
        {badges.map((b) => (
          <BadgeCard
            key={b.topicTitle}
            title={b.badge ?? `${b.topicTitle} Master`}
            isEarned={b.isComplete}
          />
        ))}

        {/* Empty state */}
        {badges.length === 0 && (
          <div className="col-span-full text-center py-8 text-[#9E9EB8] text-sm font-medium">
            Complete all problems in a topic to earn your first badge! 🎯
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Individual Badge Card
// =============================================================================
function BadgeCard({
  title,
  isEarned,
}: {
  title: string;
  isEarned: boolean;
}) {
  return (
    <div className="relative group card-hover">
      <div
        className={`relative flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 text-center transition-all ${
          isEarned
            ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-300 shadow-md shadow-yellow-100/50'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        {/* Shimmer overlay for earned */}
        {isEarned && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-shimmer pointer-events-none" />
        )}

        {/* Icon */}
        <span className={`text-4xl mb-2 ${isEarned ? 'animate-bounce-in' : ''}`}>
          {isEarned ? '🏆' : '🔒'}
        </span>

        {/* Badge name */}
        <span
          className={`text-xs font-bold leading-tight ${
            isEarned ? 'text-amber-700' : 'text-gray-400'
          }`}
        >
          {title}
        </span>

        {/* Earned indicator */}
        {isEarned && (
          <span className="mt-2 text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-100 px-2 py-0.5 rounded-full">
            ✨ Earned
          </span>
        )}

        {/* Locked hint */}
        {!isEarned && (
          <span className="mt-2 text-[10px] font-medium text-gray-400">
            Keep learning! 💪
          </span>
        )}
      </div>
    </div>
  );
}
