// =============================================================================
// Course Card Component
// =============================================================================
// Premium UI component displaying a user's course progress and a quick link
// to jump right back into learning. Features glassmorphism and gradients.
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
  return (
    <div className="group relative w-full sm:max-w-md">
      {/* Animated glow effect behind the card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Card Content */}
      <div className="relative flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 hover:bg-zinc-900/80 transition-colors">
        
        {/* Header Block */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
            {/* Simple python-esque icon / placeholder */}
            <span className="text-2xl">🐍</span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            In Progress
          </span>
        </div>

        {/* Text Block */}
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-zinc-300">Course Progress</span>
            <span className="text-blue-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Highlight gleam on the progress bar */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-white/30"></div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/learn/${topicId}`}
          className="w-full relative inline-flex items-center justify-center py-4 px-6 font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
        >
          Resume Learning
        </Link>
      </div>
    </div>
  );
}
