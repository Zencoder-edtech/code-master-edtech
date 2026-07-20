// =============================================================================
// Landing Page — Bright, Playful, Kid-Friendly Design
// =============================================================================
// Redesigned with vibrant colors, animations, and visual delight.
// Sections: Hero, Features, How It Works, For Schools, Footer
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import { UploadCloud, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* ----------------------------------------------------------------- */}
      {/* NAVBAR */}
      {/* ----------------------------------------------------------------- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/20">
              CM
            </div>
            <span className="text-lg font-extrabold text-gradient-purple hidden sm:block">CodeMaster</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth?mode=signin" className="text-sm font-semibold text-[#64648B] hover:text-purple-600 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link href="/auth" className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all active:scale-[0.97]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ----------------------------------------------------------------- */}
      <main className="flex-1">
        <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-8">
          {/* Background decorations */}
          <div className="absolute top-10 left-10 w-72 h-72 blob-purple pointer-events-none" />
          <div className="absolute top-40 right-10 w-64 h-64 blob-pink pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 blob-orange pointer-events-none opacity-50" />

          {/* Floating decorative elements */}
          <div className="absolute top-32 right-[15%] text-5xl animate-float-slow opacity-40 pointer-events-none hidden md:block">💻</div>
          <div className="absolute top-60 left-[10%] text-4xl animate-float opacity-30 pointer-events-none hidden md:block" style={{ animationDelay: '1s' }}>🐍</div>
          <div className="absolute bottom-40 right-[20%] text-3xl animate-float-slow opacity-25 pointer-events-none hidden md:block" style={{ animationDelay: '2s' }}>⚡</div>
          <div className="absolute top-20 left-[40%] text-2xl animate-float opacity-20 pointer-events-none hidden md:block" style={{ animationDelay: '0.5s' }}>🎮</div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            {/* Beta badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-8 border border-purple-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              🎉 CodeMaster is now in Beta!
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
              Learn Coding{' '}
              <span className="text-gradient-purple">Practically</span>
              <br className="hidden sm:block" />
              <span className="text-gradient-blue">From Age 10 to University</span>
            </h1>

            {/* Tagline */}
            <p className="mt-8 text-lg sm:text-xl text-[#64648B] max-w-2xl mx-auto leading-relaxed font-medium">
              Skip the boring videos. Build real programs with an interactive compiler,
              hands-on projects, and mastery challenges 🚀
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center h-14 px-8 text-lg rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.97]"
              >
                Start Coding Free 🚀
              </Link>
              <Link
                href="/auth?mode=signin"
                className="inline-flex items-center justify-center h-14 px-8 text-lg rounded-2xl font-bold border-2 border-gray-200 text-[#1A1A2E] hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                I Have an Account
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[#9E9EB8] font-medium">
              <span className="flex items-center gap-1.5">✅ 100% Free</span>
              <span className="flex items-center gap-1.5">🔒 Safe for Kids</span>
              <span className="flex items-center gap-1.5">📱 Works Offline</span>
              <span className="flex items-center gap-1.5">🏫 School Ready</span>
            </div>
          </div>

          {/* Screenshot Preview */}
          <div className="mt-20 max-w-5xl mx-auto relative">
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-2xl shadow-purple-500/10 p-2 sm:p-4 relative overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-3 px-3 pt-2 hidden sm:flex">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 ml-4 h-7 bg-gray-100 rounded-lg" />
              </div>
              <div className="aspect-[16/9] relative rounded-2xl overflow-hidden bg-gray-50">
                <Image
                  src="/images/desktop_flow.png"
                  alt="CodeMaster - Interactive Code Editor"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            {/* Floating accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl opacity-20 blur-2xl" />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-3xl opacity-15 blur-2xl" />
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* FEATURES GRID */}
        {/* ----------------------------------------------------------------- */}
        <section className="py-24 bg-gradient-to-b from-purple-50/50 to-white px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] mb-4">
                Why Kids <span className="text-gradient-purple">Love</span> CodeMaster
              </h2>
              <p className="text-[#64648B] text-lg max-w-xl mx-auto font-medium">
                Everything you need to go from zero to coding hero
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  emoji: '💻',
                  title: 'Write Real Code',
                  desc: 'No drag-and-drop toys. Write actual Python code in a real compiler that runs instantly.',
                  color: 'purple',
                },
                {
                  emoji: '🏆',
                  title: 'Earn Badges',
                  desc: 'Complete challenges to unlock badges and build your coding trophy collection.',
                  color: 'orange',
                },
                {
                  emoji: '📊',
                  title: 'Track Progress',
                  desc: 'See your streak, solved problems, and topic mastery at a glance on your dashboard.',
                  color: 'teal',
                },
                {
                  emoji: '📱',
                  title: 'Code Anywhere',
                  desc: 'Works on any device — phone, tablet, or laptop. Even works offline!',
                  color: 'pink',
                },
                {
                  emoji: '🧠',
                  title: 'Learn by Doing',
                  desc: 'Concepts, MCQs, and coding problems in each lesson. Practice makes perfect!',
                  color: 'blue',
                },
                {
                  emoji: '🔥',
                  title: 'Stay Motivated',
                  desc: 'Daily streaks, achievements, and encouraging feedback keep you going strong.',
                  color: 'orange',
                },
              ].map((feature) => {
                const colorMap: Record<string, string> = {
                  purple: 'bg-purple-50 border-purple-100 hover:border-purple-300',
                  orange: 'bg-orange-50 border-orange-100 hover:border-orange-300',
                  teal: 'bg-teal-50 border-teal-100 hover:border-teal-300',
                  pink: 'bg-pink-50 border-pink-100 hover:border-pink-300',
                  blue: 'bg-blue-50 border-blue-100 hover:border-blue-300',
                };
                const iconBgMap: Record<string, string> = {
                  purple: 'bg-purple-100',
                  orange: 'bg-orange-100',
                  teal: 'bg-teal-100',
                  pink: 'bg-pink-100',
                  blue: 'bg-blue-100',
                };
                return (
                  <div
                    key={feature.title}
                    className={`${colorMap[feature.color]} border-2 rounded-3xl p-6 sm:p-8 transition-all card-hover`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${iconBgMap[feature.color]} flex items-center justify-center text-3xl mb-5`}>
                      {feature.emoji}
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#64648B] leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* HOW IT WORKS */}
        {/* ----------------------------------------------------------------- */}
        <section className="py-24 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] mb-4">
                Start Coding in <span className="text-gradient-blue">4 Easy Steps</span>
              </h2>
              <p className="text-[#64648B] text-lg font-medium">
                From sign-up to your first badge in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', emoji: '📝', title: 'Sign Up Free', desc: 'Create your account in seconds. No credit card needed.' },
                { step: '2', emoji: '📚', title: 'Pick a Course', desc: 'Choose from Python, JavaScript, and more coming soon.' },
                { step: '3', emoji: '💻', title: 'Code & Learn', desc: 'Read concepts, solve MCQs, and write real code.' },
                { step: '4', emoji: '🏆', title: 'Earn Badges', desc: 'Complete topics to earn badges and build your streak.' },
              ].map((item, idx) => (
                <div key={item.step} className="relative text-center">
                  {/* Connection line */}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-purple-200 z-0" />
                  )}
                  
                  <div className="relative z-10">
                    {/* Step number circle */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                      <span className="text-3xl">{item.emoji}</span>
                    </div>
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                      Step {item.step}
                    </div>
                    <h3 className="text-base font-bold text-[#1A1A2E] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#64648B]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* FOR SCHOOLS SECTION */}
        {/* ----------------------------------------------------------------- */}
        <section className="bg-gradient-to-b from-purple-50 to-white py-24 border-y border-purple-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200 mb-6">
                  🏫 For Schools
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-[#1A1A2E]">
                  Zero Friction <span className="text-gradient-purple">Onboarding</span>
                </h2>
                <p className="text-[#64648B] text-lg mb-8 leading-relaxed">
                  Empower your students with the best coding platform in less than 30 seconds. 
                  Upload your class roster via CSV, and we&apos;ll automatically provision standard DPDP-compliant accounts.
                </p>

                <ul className="space-y-4">
                  {[
                    "No individual student sign-ups required",
                    "Automated DPDP age-gated consent tracking",
                    "Teacher dashboard with bulk-export reports",
                    "Works instantly offline on low-end devices"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start text-[#1A1A2E]">
                      <CheckCircle className="h-6 w-6 text-teal-500 mr-3 shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/auth?mode=signin"
                  className="inline-flex items-center mt-10 px-6 py-3 bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.97]"
                >
                  Go To School Dashboard →
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-8 border-2 border-purple-100 relative shadow-xl shadow-purple-500/5">
                <div className="absolute -top-6 -right-6 h-20 w-20 bg-purple-400 rounded-full blur-3xl opacity-15" />
                <div className="flex items-center justify-center h-20 w-20 bg-purple-100 text-purple-600 rounded-2xl mb-6 border border-purple-200">
                  <UploadCloud className="h-10 w-10" />
                </div>
                <div className="font-mono text-sm text-[#64648B] bg-gray-50 p-6 rounded-2xl border border-gray-200 overflow-x-auto">
                  <div className="text-[#9E9EB8] mb-2"># students.csv</div>
                  <div><span className="text-purple-600 font-bold">Name</span>, <span className="text-teal-600 font-bold">Contact</span>, <span className="text-orange-600 font-bold">Age</span></div>
                  <div className="mt-2 text-[#64648B]">
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
        {/* CTA SECTION */}
        {/* ----------------------------------------------------------------- */}
        <section className="py-24 px-4 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1A1A2E] mb-6">
              Ready to Start Your <span className="text-gradient-purple">Coding Journey</span>?
            </h2>
            <p className="text-lg text-[#64648B] mb-10 font-medium">
              Join thousands of young coders learning to build real programs. It&apos;s free!
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center h-16 px-10 text-xl rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.97]"
            >
              Start Learning Free 🚀
            </Link>
          </div>
        </section>
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ----------------------------------------------------------------- */}
      <footer className="py-12 text-center border-t border-gray-100 bg-gray-50">
        <p className="text-[#9E9EB8] text-sm font-medium">
          Built with ❤️ by Sai Vardhan — CodeMaster v1.0
        </p>
      </footer>
    </div>
  );
}
