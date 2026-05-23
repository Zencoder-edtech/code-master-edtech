// =============================================================================
// Topic Progress Component
// =============================================================================
// Displays per-topic progress with a gradient progress bar, solved/total
// count, and a completion checkmark. Used on the dashboard to show how
// far along the student is in each topic.
// =============================================================================

interface TopicProgressProps {
  topicTitle: string;
  solved: number;
  total: number;
  isComplete: boolean;
}

export function TopicProgress({
  topicTitle,
  solved,
  total,
  isComplete,
}: TopicProgressProps) {
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 hover:border-zinc-700 transition-colors"
      id={`topic-progress-${topicTitle.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Completion indicator */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              isComplete
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            {isComplete ? '✓' : '📖'}
          </div>
          <h4 className="text-base font-semibold text-zinc-100 truncate">
            {topicTitle}
          </h4>
        </div>

        {/* Fraction badge */}
        <span
          className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
            isComplete
              ? 'bg-green-500/15 text-green-400 border border-green-500/25'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          {solved}/{total} solved
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-zinc-800 rounded-full h-2.5 shadow-inner overflow-hidden">
        <div
          className={`h-2.5 rounded-full relative transition-all duration-700 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}
          style={{ width: `${percent}%` }}
        >
          {/* Gleam highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/30" />
        </div>
      </div>

      {/* Bottom text */}
      <p className="text-xs text-zinc-500 mt-2.5">
        {isComplete ? (
          <span className="text-green-400 font-medium">
            🎉 Topic mastered!
          </span>
        ) : percent > 0 ? (
          `${100 - percent}% remaining — keep going!`
        ) : (
          'Not started yet'
        )}
      </p>
    </div>
  );
}
