// =============================================================================
// Auth Form — Multi-Step Authentication Component
// =============================================================================
// This is the main authentication UI component for CodeMaster.
// It supports both Sign Up and Sign In flows with multiple auth methods:
//
// Auth Methods:
//   1. Email/Phone OTP — sends a one-time password, then verifies
//   2. Google OAuth     — redirects to Google sign-in
//   3. Facebook OAuth   — redirects to Facebook sign-in
//
// Sign Up Flow (3 steps):
//   Step 1 (input):    Enter email or phone number → Send OTP
//   Step 2 (otp):      Enter the 6-digit OTP code → Verify
//   Step 3 (password): Create a password → Complete registration
//
// Sign In Flow (2 steps):
//   Step 1 (input):    Enter email or phone → Send OTP
//   Step 2 (otp):      Enter OTP → Redirects to /home
//
// After successful auth, the AuthProvider in layout.tsx detects the
// SIGNED_IN event and redirects the user to /home.
// =============================================================================

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/admin-auth';

const supabase = createClient();

export default function AuthForm({ isSignUp = true }: { isSignUp?: boolean }) {
  const router = useRouter();

  const [step, setStep] = useState<'input' | 'otp'>('input');
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Email + Password Auth
  // ---------------------------------------------------------------------------
  const handleEmailAuth = async () => {
    setLoading(true);
    setMessage('');

    // --- ADMIN INTERCEPTOR ---
    if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || email === 'polampallisaivardhan1423@gmail.com') {
      const result = await loginAdmin(email, password);
      if (result.success) {
        router.push('/admin');
      } else {
        setMessage(result.error || 'Invalid credentials');
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else router.push('/home');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push('/home');
    }
    
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Phone OTP Auth
  // ---------------------------------------------------------------------------
  const handleSendPhoneOtp = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
      options: { shouldCreateUser: isSignUp },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('OTP sent to your phone!');
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyPhoneOtp = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push('/home');
    }
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Social OAuth
  // ---------------------------------------------------------------------------
  const handleSocial = async (provider: 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/home` },
    });
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-zinc-900">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h1>

      {step === 'input' ? (
        <>
          {/* Email & Password Form */}
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl mb-4 text-zinc-900"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl mb-4 text-zinc-900"
            />
            <button
              onClick={handleEmailAuth}
              disabled={loading || !email || !password}
              className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
            >
              {loading ? 'Processing…' : (isSignUp ? 'Sign Up with Email' : 'Sign In with Email')}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mb-6">or continue with</div>

          {/* Google OAuth Button */}
          <button
            onClick={() => handleSocial('google')}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-2xl py-4 mb-6 hover:bg-gray-50 text-lg font-medium text-zinc-700"
          >
            <span className="text-2xl">G</span> Google
          </button>

          <div className="text-center text-sm text-gray-500 mb-6">or use phone number</div>

          {/* Phone Number Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Phone (9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-zinc-900"
            />
          </div>
          <button
            onClick={handleSendPhoneOtp}
            disabled={loading || !phone}
            className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
          >
            {loading ? 'Sending OTP…' : 'Login with OTP'}
          </button>
        </>
      ) : (
        <>
          {/* OTP Verification Step */}
          <div className="flex justify-center gap-4 mb-8">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-6 py-5 text-center text-2xl border-2 border-gray-300 rounded-2xl focus:border-black focus:outline-none text-zinc-900 tracking-[0.5em]"
              placeholder="123456"
            />
          </div>
          <button
            onClick={handleVerifyPhoneOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-black text-white py-5 rounded-2xl font-semibold text-lg"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
          
          <button
            onClick={() => {
              setStep('input');
              setOtp('');
              setMessage('');
            }}
            className="w-full mt-4 text-gray-500 hover:text-black transition-colors"
          >
            Back to login options
          </button>
        </>
      )}

      {/* Error/Success Message */}
      {message && (
        <p className="text-center text-red-500 mt-6 text-sm">{message}</p>
      )}

      {/* Toggle between Sign Up and Sign In */}
      <p className="text-center text-sm text-gray-500 mt-6">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <a
          href={isSignUp ? '/auth?mode=signin' : '/auth'}
          className="text-blue-600 hover:underline font-medium"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </a>
      </p>
    </div>
  );
}