// =============================================================================
// Topic Progress — Light Theme, Animated
// =============================================================================
// Colorful progress bar with animated fill for each learning topic.
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
      className={`bg-white border-2 rounded-2xl p-5 sm:p-6 transition-all card-hover ${
        isComplete
          ? 'border-teal-200 shadow-teal-100/50'
          : 'border-gray-100 shadow-sm'
      }`}
      id={`topic-progress-${topicTitle.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Completion indicator */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
              isComplete
                ? 'bg-teal-100 text-teal-600 border border-teal-200'
                : 'bg-purple-100 text-purple-600 border border-purple-200'
            }`}
          >
            {isComplete ? '✓' : '📖'}
          </div>
          <h4 className="text-base font-bold text-[#1A1A2E] truncate">
            {topicTitle}
          </h4>
        </div>

        {/* Fraction badge */}
        <span
          className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
            isComplete
              ? 'bg-teal-100 text-teal-700 border border-teal-200'
              : 'bg-purple-50 text-purple-600 border border-purple-200'
          }`}
        >
          {solved}/{total} solved
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full relative transition-all duration-700 ease-out animate-progress-fill ${
            isComplete
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          style={{ width: `${percent}%` }}
        >
          {/* Gleam highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/50" />
        </div>
      </div>

      {/* Bottom text */}
      <p className="text-xs mt-2.5 font-medium">
        {isComplete ? (
          <span className="text-teal-600">
            🎉 Topic mastered! You&apos;re awesome!
          </span>
        ) : percent > 0 ? (
          <span className="text-purple-500">
            {100 - percent}% remaining — keep going! 💪
          </span>
        ) : (
          <span className="text-gray-400">
            Not started yet — let&apos;s begin! 🚀
          </span>
        )}
      </p>
    </div>
  );
}
