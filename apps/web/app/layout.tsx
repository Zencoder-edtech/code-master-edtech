// =============================================================================
// Root Layout — CodeMaster MVP (Production-Ready)
// =============================================================================
// This is the top-level layout that wraps every page in the application.
// It is a SERVER COMPONENT — hooks like useEffect/useState are NOT allowed here.
//
// Integrations wired in this file:
//   • Sentry     — auto-initialized via sentry.client.config.ts and
//                   sentry.server.config.ts (loaded by @sentry/nextjs plugin)
//   • PostHog    — initialized client-side via AnalyticsProvider (useEffect)
//   • Supabase   — auth state listener via AuthProvider (useEffect)
//   • PWA        — manifest.json linked via metadata; theme-color via viewport
//   • Font       — Geist (modern, clean Google font)
//
// Architecture Note:
//   layout.tsx MUST be a Server Component to export `metadata` and `viewport`.
//   All client-side logic (auth listener, analytics init) lives in dedicated
//   'use client' provider components that wrap {children}.
// =============================================================================

import '@repo/ui/styles.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

// ---------------------------------------------------------------------------
// Font Configuration
// Geist is a modern sans-serif font from Vercel, designed for readability
// on screens. We load weights 400–700 for body text through headings.
// ---------------------------------------------------------------------------
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700'],
});

// ---------------------------------------------------------------------------
// SEO Metadata + PWA Manifest
// This generates <title>, <meta description>, <link rel="manifest">, and
// apple-mobile-web-app meta tags in the <head> of every page.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Viewport Configuration
// themeColor sets the browser chrome color on mobile devices.
// Separated from metadata per Next.js 14+ API requirements.
// ---------------------------------------------------------------------------
export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ---------------------------------------------------------------------------
// Root Layout Component
// Renders the <html> and <body> tags, applies the font, and wraps all pages
// with AuthProvider (auth state listener) and AnalyticsProvider (PostHog).
// ---------------------------------------------------------------------------
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
        <AuthProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}