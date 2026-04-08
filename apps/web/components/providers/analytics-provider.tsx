// =============================================================================
// Analytics Provider — Client Component for PostHog Initialization
// =============================================================================
// This component initializes PostHog analytics on the client side using
// useEffect, ensuring it only runs once after hydration in the browser.
//
// Why a separate component?
//   PostHog must be initialized client-side (it needs window/document).
//   layout.tsx is a Server Component and cannot use hooks.
//   This 'use client' wrapper provides the correct execution context.
//
// Sentry is initialized automatically via sentry.client.config.ts and
// sentry.server.config.ts — no explicit import needed here.
// =============================================================================

'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/posthog';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
