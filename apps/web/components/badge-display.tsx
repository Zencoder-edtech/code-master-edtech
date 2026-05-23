// =============================================================================
// Badge Display Component
// =============================================================================
// Showcases earned and locked badges in a visually appealing grid.
// Earned badges have a golden glow effect and trophy icon.
// Locked badges are greyed out with a lock icon.
// =============================================================================

'use client';

interface Badge {
  topicTitle: string;
  badge: string | null;  // null = not yet earned
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
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
          <span className="text-lg">🏅</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Badges</h3>
          <p className="text-xs text-zinc-500">
            {earned.length} earned · {locked.length} locked
          </p>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((b) => (
          <BadgeCard
            key={b.topicTitle}
            title={b.badge ?? `${b.topicTitle} Master`}
            isEarned={b.isComplete}
          />
        ))}

        {/* Empty state */}
        {badges.length === 0 && (
          <div className="col-span-full text-center py-8 text-zinc-500 text-sm">
            Complete all problems in a topic to earn your first badge!
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
    <div className="relative group">
      {/* Glow effect for earned badges */}
      {isEarned && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
      )}

      <div
        className={`relative flex flex-col items-center justify-center py-5 px-4 rounded-2xl border text-center transition-all ${
          isEarned
            ? 'bg-zinc-900 border-yellow-500/30 hover:border-yellow-500/50'
            : 'bg-zinc-900/50 border-zinc-800 opacity-60'
        }`}
      >
        {/* Icon */}
        <span className="text-3xl mb-2">
          {isEarned ? '🏆' : '🔒'}
        </span>

        {/* Badge name */}
        <span
          className={`text-xs font-bold leading-tight ${
            isEarned ? 'text-yellow-400' : 'text-zinc-500'
          }`}
        >
          {title}
        </span>

        {/* Earned indicator */}
        {isEarned && (
          <span className="mt-1.5 text-[10px] font-semibold text-green-400 uppercase tracking-widest">
            Earned
          </span>
        )}
      </div>
    </div>
  );
}
