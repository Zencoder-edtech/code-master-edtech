// =============================================================================
// PostHog Analytics — Client-side product analytics
// =============================================================================
// Initializes PostHog with the project API key from environment variables.
// autocapture is disabled for privacy (children's data compliance).
// This function is safe to call multiple times — PostHog deduplicates internally.
// =============================================================================

import posthog from 'posthog-js';

let initialized = false;

export const initPostHog = (): void => {
  if (typeof window === 'undefined') return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: 'https://app.posthog.com',
    autocapture: false,
    persistence: 'localStorage',
  });

  initialized = true;
};