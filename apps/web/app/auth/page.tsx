// =============================================================================
// Auth Page — Sign Up / Sign In Route (/auth)
// =============================================================================
// This page renders the AuthForm component for user authentication.
// It reads the ?mode=signin query param to toggle between sign-up and sign-in.
//
// Routes:
//   /auth            → Sign Up form (default)
//   /auth?mode=signin → Sign In form
//
// The AuthForm component handles all auth logic (OTP, password, social OAuth).
// After successful authentication, the AuthProvider in layout.tsx listens for
// the SIGNED_IN event and redirects the user to /home.
// =============================================================================

import AuthForm from '@/components/AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}