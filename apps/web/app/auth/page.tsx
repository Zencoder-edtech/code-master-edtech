// =============================================================================
// Auth Page — Sign Up / Sign In Route (/auth)
// =============================================================================
// This page renders the AuthForm component for user authentication.
// It reads the ?mode=signin query param to toggle between sign-up and sign-in.
//
// Routes:
//   /auth            → Sign Up form (default)
//   /auth?mode=signin → Sign In form
// =============================================================================

import AuthForm from '@/components/AuthForm';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const isSignUp = mode !== 'signin';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <AuthForm isSignUp={isSignUp} />
    </div>
  );
}