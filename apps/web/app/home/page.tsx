// =============================================================================
// Home Page — Post-Authentication Landing Page
// =============================================================================
// This is where users land after signing in successfully.
// The AuthProvider in layout.tsx redirects here on SIGNED_IN event.
//
// Currently a placeholder — will be replaced with the actual dashboard
// (course list, progress tracker, etc.) in Phase 3.
// =============================================================================

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to CodeMaster</h1>
        <p className="text-zinc-400">You are signed in! 🚀</p>
        <p className="mt-8 text-sm text-zinc-500">
          Python Loops topic coming in Phase 3...
        </p>
      </div>
    </div>
  );
}
