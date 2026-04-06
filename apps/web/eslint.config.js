// =============================================================================
// ESLint Configuration for the Web App
// =============================================================================
// Imports the shared Next.js ESLint rules from packages/eslint-config/next.js
// This keeps linting rules consistent across all apps in the monorepo.
// =============================================================================

import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default nextJsConfig;
