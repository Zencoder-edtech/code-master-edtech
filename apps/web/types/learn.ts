// =============================================================================
// Learn Feature — Type Definitions
// =============================================================================
// Shared types for the learn feature (topics, MCQs, problems, submissions).
// These mirror the domain entities in packages/domain/entities.ts but are
// used locally in the web app to avoid cross-package import issues until
// the monorepo build pipeline is fully wired.
// =============================================================================

/** A learning topic with concept content and optional video */
export interface Topic {
  id: string;
  title: string;
  description: string;
  conceptHtml: string;
  videoUrl?: string;
}

/** A multiple-choice question with options and explanation */
export interface MCQ {
  id: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

/** A coding problem with starter code and test cases */
export interface Problem {
  id: string;
  title: string;
  description: string;
  starterCode?: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | 'fill_blank' | 'full_code' | string;
  testCases: Array<{ input: string; expected: string; expected_output?: string }>;
}

/** A code submission result from Judge0 */
export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  status: { id: number; description: string };
  compile_output: string | null;
}

/** Tracks a user's progress through a topic + streak state */
export interface Progress {
  id: string;
  userId: string;
  topicId: string;
  problemsSolved: string[];   // IDs of solved problems
  totalProblems: number;      // total problems in the topic
  streak: number;             // current consecutive-day streak
  longestStreak: number;      // all-time best streak
  lastActivityAt: Date;       // for streak calculation
  isTopicComplete: boolean;   // true when all problems passed
}

/** Dashboard view model returned by GetDashboardUseCase */
export interface DashboardData {
  streak: number;
  longestStreak: number;
  topics: Array<{
    topicId: string;
    topicTitle: string;
    solved: number;
    total: number;
    isComplete: boolean;
    badge: string | null;     // e.g., "Loops Master"
  }>;
}
