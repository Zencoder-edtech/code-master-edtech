// =============================================================================
// Next.js Configuration — CodeMaster MVP
// =============================================================================
// This file configures the Next.js build and runtime behavior.
//
// Key settings:
//   • reactStrictMode: true — Enables React's strict mode for development
//     (double-renders components to catch side effects, warns about deprecated APIs)
//
//   • withSentryConfig() — Wraps the config to enable Sentry error tracking.
//     The Sentry plugin automatically instruments the app to capture errors,
//     performance traces, and upload source maps during build.
//
//     org/project: Used by Sentry CLI for source map uploads.
//     silent: Suppresses Sentry CLI output during build.
//
// Note: Update "your-sentry-org" with your actual Sentry org slug when ready.
// =============================================================================

import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
// @ts-expect-error - next-pwa does not provide TypeScript types by default
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', '@prisma/client-runtime-utils', 'prisma', '@repo/infrastructure'],
  turbopack: {
    // Point turbopack to the monorepo root so it resolves packages correctly
    // apps/web is 2 levels deep from the monorepo root
    root: '../../',
  },
};

export default withSentryConfig(withPWA(nextConfig), {
  silent: true,
  org: 'your-sentry-org',
  project: 'codemaster-mvp',
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});