// =============================================================================
// Sentry Client Configuration — Browser-side error tracking
// =============================================================================
// Loaded automatically by @sentry/nextjs when the app hydrates in the browser.
// DSN is read from NEXT_PUBLIC_SENTRY_DSN environment variable.
// tracesSampleRate: 1.0 in development (capture everything), 0.2 in production.
// =============================================================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture all traces in dev for debugging; sample 20% in prod to control costs
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.2,

  // Only enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
});