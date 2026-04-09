// =============================================================================
// Domain Entities — Core Business Objects
// =============================================================================
// These are the core domain types for the CodeMaster platform.
// They represent the fundamental concepts of the learning system:
//
//   Topic      — A learning topic (e.g., "Loops in Python") with concept content
//   MCQ        — A multiple-choice question linked to a topic
//   Problem    — A coding challenge with starter code and test cases
//   Submission — A student's code submission with execution status
//
// These types are "pure" — they have no framework dependencies.
// They are used by use-cases (application layer) and repositories
// (infrastructure layer) following Clean Architecture principles.
//
// Note: The web app currently uses local copies of these types in
// apps/web/types/learn.ts to avoid cross-package import issues.
// Once the monorepo build pipeline is fully wired, these will be
// the single source of truth.
// =============================================================================

/** A learning topic with concept content and optional video */
export interface Topic {
  id: string;
  title: string;
  description: string;
  conceptHtml: string;
  videoUrl?: string;
}

/** A multiple-choice question with answer options and explanation */
export interface MCQ {
  id: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

/** A coding problem with starter code and test cases for validation */
export interface Problem {
  id: string;
  title: string;
  description: string;
  starterCode?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  testCases: Array<{ input: string; expected: string }>;
}

/** A code submission result — tracks status through the Judge0 pipeline */
export interface Submission {
  id: string;
  problemId: string;
  code: string;
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'ERROR';
  output?: string;
}