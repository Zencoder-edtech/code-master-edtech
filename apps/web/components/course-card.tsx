// =============================================================================
// Course Card — Total Redesign for Kids
// =============================================================================
// Interactive, colorful course card with circular progress ring,
// topic chips, and animated "Continue Learning" button.
// =============================================================================

import Link from 'next/link';

interface CourseCardProps {
  title: string;
  description: string;
  topicId: string;
  progressPercent: number;
}

export function CourseCard({
  title,
  description,
  topicId,
  progressPercent,
}: CourseCardProps) {
  const circumference = 2 * Math.PI * 36; // radius 36
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="group relative w-full card-hover">
      {/* Card Content */}
      <div className="relative flex flex-col sm:flex-row items-stretch bg-white border-2 border-purple-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-200 transition-all">
        
        {/* Left: Visual Section */}
        <div className="sm:w-48 flex-shrink-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full" />
          <div className="absolute bottom-4 left-2 w-5 h-5 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 right-6 w-3 h-3 bg-white/15 rounded-full" />

          {/* Course icon */}
          <div className="relative">
            {/* Circular Progress Ring */}
            <svg width="88" height="88" viewBox="0 0 88 88" className="transform -rotate-90">
              <circle
                cx="44" cy="44" r="36"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="5"
              />
              <circle
                cx="44" cy="44" r="36"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🐍</span>
            </div>
          </div>

          {/* Progress text */}
          <span className="text-white/90 text-xs font-bold tracking-wider">
            {progressPercent}% DONE
          </span>
        </div>

        {/* Right: Info Section */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Status tag */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 bg-teal-100 text-teal-700 rounded-full border border-teal-200">
                {progressPercent > 0 ? '📚 In Progress' : '🆕 Not Started'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-2 group-hover:text-purple-700 transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-[#64648B] leading-relaxed mb-4">
              {description}
            </p>

            {/* Topic chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['Variables', 'Loops', 'Conditionals', 'Functions'].map((chip) => (
                <span
                  key={chip}
                  className="text-[11px] font-semibold px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg border border-purple-100"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar + CTA */}
          <div>
            {/* Thin progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Action Button */}
            <Link
              href={`/learn/${topicId}`}
              className="w-full relative inline-flex items-center justify-center py-3.5 px-6 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all rounded-2xl shadow-lg shadow-purple-500/20 active:scale-[0.98] text-sm group/btn"
            >
              {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
              <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
