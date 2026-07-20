// =============================================================================
// Auth Page — Light Theme with Gradient Background
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 blob-purple pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-64 h-64 blob-pink pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blob-purple pointer-events-none opacity-30" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-32 right-1/4 text-4xl animate-float-slow opacity-30 pointer-events-none">💻</div>
      <div className="absolute bottom-32 left-1/4 text-3xl animate-float opacity-20 pointer-events-none">🐍</div>
      <div className="absolute top-1/4 left-16 text-2xl animate-float-slow opacity-20 pointer-events-none" style={{ animationDelay: '1s' }}>⚡</div>

      <AuthForm isSignUp={isSignUp} />
    </div>
  );
}