// =============================================================================
// Root Layout — CodeMaster (Light Theme for Kids)
// =============================================================================
// Top-level layout wrapping every page. SERVER COMPONENT.
//
// Integrations:
//   • Sentry, PostHog, Supabase (unchanged)
//   • PWA manifest, Font (Geist body + Fredoka headings)
//   • Light theme: white background, dark text
// =============================================================================

import '@repo/ui/styles.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

// ---------------------------------------------------------------------------
// Font Configuration
// Geist — Modern sans-serif for body text
// ---------------------------------------------------------------------------
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700'],
});

// ---------------------------------------------------------------------------
// SEO Metadata + PWA Manifest
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
// ---------------------------------------------------------------------------
export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ---------------------------------------------------------------------------
// Root Layout Component
// Light theme: white background, dark text for kid-friendly UI
// ---------------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} antialiased bg-white text-[#1A1A2E]`}
      >
        <AuthProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}