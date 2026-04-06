// =============================================================================
// Root Layout — The outermost wrapper for EVERY page in the app
// =============================================================================
// This file is special in Next.js App Router:
//   - It runs on the SERVER (not in the browser)
//   - It wraps every single page in the app
//   - It sets the HTML lang, font, and metadata (title, description)
//
// What each import does:
//   @repo/ui/styles.css  → Shared Tailwind styles from packages/ui
//   ./globals.css         → App-specific styles (dark/light mode)
//   Geist font            → Modern, clean Google Font
// =============================================================================

import "@repo/ui/styles.css"; // Shared design system styles
import "./globals.css"; // App-level global styles
import type { Metadata } from "next";
import { Geist } from "next/font/google";

// Load Google's Geist font with Latin character set
const geist = Geist({ subsets: ["latin"] });

// Metadata appears in browser tab title and search engine results
export const metadata: Metadata = {
  title: "CodeMaster — Learn Coding Practically",
  description:
    "Self-paced coding platform for ages 10+. Practice with real compilers.",
};

// This function wraps EVERY page. {children} = whatever page is being shown
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
