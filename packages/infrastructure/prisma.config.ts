// =============================================================================
// Prisma 7 Configuration — Database Connection Setup
// =============================================================================
// This file tells Prisma:
//   1. WHERE to find the .env file (monorepo root, 2 levels up)
//   2. WHERE the schema file is (./prisma/schema.prisma)
//   3. WHAT database to connect to (reads DATABASE_URL from .env)
//
// Why dotenv?
//   Prisma 7 does NOT auto-load .env files. We must explicitly load them.
//   We use the `dotenv` package to read ../../.env (monorepo root).
//
// Why path.resolve?
//   In a monorepo, this file is at packages/infrastructure/prisma.config.ts
//   but the .env file is at the root. path.resolve(__dirname, "../../.env")
//   correctly resolves to the root no matter where you run the command from.
// =============================================================================

import { config } from "dotenv";
import path from "path";

// Step 1: Load environment variables from the monorepo root .env file
config({ path: path.resolve(__dirname, "../../.env") });

// Step 2: Import Prisma's config helpers
import { defineConfig, env } from "prisma/config";

// Step 3: Export the Prisma configuration
export default defineConfig({
  // Tell Prisma where the schema file is (relative to THIS file)
  schema: "./prisma/schema.prisma",

  // Tell Prisma the database connection URL
  // env("DATABASE_URL") reads it from the .env we loaded above
  // If DATABASE_URL is missing, Prisma throws a clear error
  datasource: {
    url: env("DATABASE_URL"),
  },
});
