// =============================================================================
// Root Layout — CodeMaster MVP (Production-Ready)
// =============================================================================
// This is the top-level layout for the entire application.
//
// Integrations wired in this file:
//   • Sentry — initialized automatically via sentry.client.config.ts and
//              sentry.server.config.ts (loaded by @sentry/nextjs plugin)
//   • PostHog — initialized client-side via AnalyticsProvider (useEffect)
//   • PWA     — manifest.json linked via metadata export; theme-color via
//              viewport export; apple-mobile-web-app meta tags for install prompt
//   • Font    — Geist (modern, clean Google font)
// =============================================================================

import '@repo/ui/styles.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { AnalyticsProvider } from '../components/providers/analytics-provider';

// Geist font (modern & clean)
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700'],
});

// SEO metadata + PWA manifest
export const metadata: Metadata = {
  title: 'CodeMaster — Learn Coding Practically',
  description:
    'Self-paced coding platform for ages 10+. Real compiler, MCQs & projects.',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CodeMaster',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// Viewport + theme color (separated from metadata per Next.js 14+ API)
export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.className} antialiased bg-zinc-950 text-zinc-100`}
      >
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}