// =============================================================================
// Landing Page — Public Homepage (/)
// =============================================================================
// This is the first page users see when they visit CodeMaster.
// It displays the app name and a brief description.
//
// Currently a placeholder — will be replaced with a full landing page
// (hero section, feature cards, CTA buttons) in a later phase.
//
// Authenticated users are redirected to /home by the AuthProvider.
// =============================================================================

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 pb-4">
        CodeMaster EdTech
      </h1>
      <p className="mt-6 text-lg leading-8 text-zinc-400 text-center max-w-2xl">
        The ultimate platform for learning to code practically. Real compiler,
        MCQs, and hands-on projects designed for ages 10+ and university
        freshers.
      </p>
      <div className="mt-10 flex gap-4">
        <a
          href="/auth"
          className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-500 transition"
        >
          Get Started
        </a>
        <a
          href="/auth?mode=signin"
          className="rounded-2xl border border-zinc-700 px-8 py-4 text-lg font-semibold text-zinc-300 hover:bg-zinc-800 transition"
        >
          Sign In
        </a>
      </div>
    </main>
  );
}
