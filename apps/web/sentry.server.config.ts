// =============================================================================
// Sentry Server Configuration — Server-side error tracking
// =============================================================================
// Loaded automatically by @sentry/nextjs on the server (API routes, SSR, etc.).
// Falls back to NEXT_PUBLIC_SENTRY_DSN if SENTRY_DSN is not set.
// tracesSampleRate: 1.0 in development, 0.2 in production.
// =============================================================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture all traces in dev for debugging; sample 20% in prod to control costs
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.2,

  // Only enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
});