// =============================================================================
// Shared Prisma Client — Singleton for the Web App
// =============================================================================
// Creates a single PrismaClient instance shared across all server-side code.
// Uses the global object pattern to prevent connection exhaustion during
// Next.js hot-reloads in development.
//
// Usage:
//   import { prisma } from '@/lib/prisma';
//   const users = await prisma.user.findMany();
// =============================================================================

import { PrismaClient } from '@repo/infrastructure';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
