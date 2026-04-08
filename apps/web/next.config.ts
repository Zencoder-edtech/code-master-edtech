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

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'your-sentry-org',
  project: 'codemaster-mvp',
});