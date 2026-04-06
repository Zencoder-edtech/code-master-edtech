// =============================================================================
// Next.js Configuration
// =============================================================================
// This file controls how Next.js builds and runs the web app.
//
// ignoreBuildErrors: true → Allows building even if TypeScript has errors.
//   This is useful during early development but should be set to false
//   before deploying to production.
// =============================================================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TODO: Set to false before production deploy
  },
};

export default nextConfig;
