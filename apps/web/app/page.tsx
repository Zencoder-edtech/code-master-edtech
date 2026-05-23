// =============================================================================
// Landing Page — Public Home Page (/)
// =============================================================================
// This is the first page visitors see when they arrive at CodeMaster.
// It is a SERVER COMPONENT (no 'use client') — fully SEO-friendly and
// pre-rendered at build time for maximum performance.
//
// Sections:
//   1. HERO — Animated beta badge, headline, tagline, CTA buttons
//   2. SCREENSHOT CAROUSEL — Desktop & mobile preview mockups
//   3. FOR SCHOOLS — B2B section promoting CSV upload & DPDP compliance
//   4. FOOTER — Simple credit line
//
// Key Design Patterns:
//   • Uses next/image for optimized, lazy-loaded images
//   • Responsive grid layout (1 col mobile → 2 cols desktop)
//   • Glassmorphism effects (bg-zinc-900/50, border, shadow)
//   • Gradient text via bg-clip-text + bg-gradient-to-r
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle, Smartphone, Monitor } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-12 sm:pt-20">
      {/* ----------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ----------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          CodeMaster is now in Beta
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Learn Coding Practically – <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            From Age 10 to University
          </span>
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Skip the boring videos. Build real programs using an interactive compiler,
          hands-on projects, and mastery challenges designed for all levels.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full font-bold shadow-blue-500/20 shadow-xl">
            <Link href="/auth">Start Learning Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full font-bold border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800">
            <Link href="/auth?mode=signin">Sign In</Link>
          </Button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SCREENSHOT CAROUSEL: Desktop & Mobile Previews */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-20 w-full max-w-6xl relative pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center overflow-hidden">
            {/* Desktop UI */}
            <div className="bg-zinc-900/50 p-2 sm:p-4 rounded-2xl border border-zinc-800 shadow-2xl relative group">
              <div className="absolute top-4 left-6 flex gap-2 z-10 hidden sm:flex">
                <div className="w-3 h-3 rounded-full bg-red-500 hidden group-hover:block" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 hidden group-hover:block" />
                <div className="w-3 h-3 rounded-full bg-green-500 hidden group-hover:block" />
              </div>
              <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-zinc-950">
                <Image
                  src="/images/desktop_flow.png"
                  alt="Desktop Code Editor Interface"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium">
                <Monitor className="w-4 h-4" /> Desktop VS-Code Engine
              </div>
            </div>

            {/* Mobile UI */}
            <div className="bg-zinc-900/50 p-2 sm:p-4 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative mx-auto w-full max-w-[320px] md:max-w-md">
              <div className="absolute top-0 inset-x-0 mx-auto w-32 h-6 bg-zinc-950 rounded-b-3xl z-10 hidden sm:block" />
              <div className="aspect-[9/19] relative rounded-[2rem] overflow-hidden bg-zinc-950">
                <Image
                  src="/images/mobile_flow.png"
                  alt="Mobile Code Editor Interface"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium pb-2">
                <Smartphone className="w-4 h-4" /> Code Anywhere Offline (PWA)
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* FOR SCHOOLS SECTION */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                For Schools: Zero Friction Onboarding
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Empower your students with the best coding platform in less than 30 seconds. 
                Upload your class roster via CSV, and we&apos;ll automatically provision standard DPDP-compliant accounts with verified parental consent metrics.
              </p>

              <ul className="space-y-4">
                {[
                  "No individual student sign-ups required",
                  "Automated DPDP age-gated consent tracking",
                  "Teacher dashboard with bulk-export reports",
                  "Works instantly offline on low-end devices"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-zinc-300">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="secondary" className="mt-10 font-semibold" asChild>
                <Link href="/auth?mode=signin">Go To School Dashboard</Link>
              </Button>
            </div>

            <div className="bg-black/40 rounded-3xl p-8 border border-zinc-800 relative shadow-2xl">
              <div className="absolute -top-6 -right-6 h-20 w-20 bg-blue-500 rounded-full blur-3xl opacity-20" />
              <div className="flex items-center justify-center h-20 w-20 bg-blue-500/10 text-blue-500 rounded-full mb-6">
                <UploadCloud className="h-10 w-10" />
              </div>
              <div className="font-mono text-sm text-zinc-300 bg-zinc-950 p-6 rounded-xl border border-zinc-800 overflow-x-auto">
                <div className="text-zinc-500 mb-2"># students.csv</div>
                <div><span className="text-blue-400">Name</span>, <span className="text-green-400">Contact</span>, <span className="text-yellow-400">Age</span></div>
                <div className="mt-2 text-zinc-400">
                  Alex S., alex@school.edu, 12<br/>
                  Becca T., becca@school.edu, 14<br/>
                  Carl M., carl@school.edu, 11
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ----------------------------------------------------------------- */}
      <footer className="py-12 text-center text-zinc-500 text-sm">
        <p>Built by Sai Vardhan – MVP v1.0</p>
      </footer>
    </div>
  );
}
