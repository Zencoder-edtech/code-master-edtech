// =============================================================================
// Infrastructure Package — Public API
// =============================================================================
// Re-exports the Prisma-generated client using named exports.
// 
// Why named exports instead of `export * from './generated/prisma'`?
//   Turbopack (Next.js 16 default bundler) cannot resolve `export *` from
//   CommonJS modules at build time. The generated Prisma client is CJS,
//   so we must list the exports explicitly.
// =============================================================================

export { PrismaClient } from './generated/prisma';

// Re-export commonly used Prisma types
export type {
  User,
  Course,
  Topic,
  MCQ,
  Problem,
  Submission,
  Progress,
} from './generated/prisma';
