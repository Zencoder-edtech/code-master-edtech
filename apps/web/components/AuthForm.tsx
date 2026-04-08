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

export default function AuthForm({ isSignUp = true }: { isSignUp?: boolean }) {
  // Initialize Supabase browser client and Next.js router
  const supabase = createClient();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // State Management
  // step:            Controls which form section is visible (input → otp → password)
  // emailOrPhone:    The user's email or phone number input
  // otp:             The 6-digit one-time password entered by the user
  // password/confirm: Password fields for sign-up flow only
  // loading:         Disables buttons while API calls are in progress
  // message:         Displays success or error feedback to the user
  // ---------------------------------------------------------------------------
  const [step, setStep] = useState<'input' | 'otp' | 'password'>('input');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Step 1: Send OTP to user's email or phone
  // Detects whether input is email (contains @) or phone number.
  // For phone, prepends +91 (India country code).
  // shouldCreateUser: true for sign-up, false for sign-in (existing users only).
  // ---------------------------------------------------------------------------
  const handleSendOtp = async () => {
    setLoading(true);
    setMessage('');

    const isEmail = emailOrPhone.includes('@');

    // Supabase types require separate calls for email vs phone OTP
    const { error } = isEmail
      ? await supabase.auth.signInWithOtp({
          email: emailOrPhone,
          options: {
            shouldCreateUser: isSignUp,
            emailRedirectTo: `${window.location.origin}/home`,
          },
        })
      : await supabase.auth.signInWithOtp({
          phone: `+91${emailOrPhone}`,
          options: {
            shouldCreateUser: isSignUp,
          },
        });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('OTP sent! Check your email (phone SMS coming later)');
      setStep('otp');
    }
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Step 2: Verify the OTP code entered by the user
  // On success:
  //   - Sign Up → moves to password step (Step 3)
  //   - Sign In → redirects to /home immediately
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage('');

    const isEmail = emailOrPhone.includes('@');

    // Supabase types require separate verify calls for email vs phone
    const { error } = isEmail
      ? await supabase.auth.verifyOtp({
          email: emailOrPhone,
          token: otp,
          type: 'email',
        })
      : await supabase.auth.verifyOtp({
          phone: `+91${emailOrPhone}`,
          token: otp,
          type: 'sms',
        });

    if (error) {
      setMessage(error.message);
    } else if (isSignUp) {
      // Sign Up: ask user to create a password after OTP verification
      setStep('password');
    } else {
      // Sign In: OTP verified, redirect to home
      router.push('/home');
    }
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Step 3 (Sign Up only): Set a password for the new account
  // Uses supabase.auth.updateUser() since the user is already authenticated
  // after OTP verification. Validates password match before calling API.
  // ---------------------------------------------------------------------------
  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      router.push('/home');
    }
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Social OAuth: Google / Facebook sign-in
  // Redirects user to the provider's login page. After auth, Supabase
  // redirects back to /home via the redirectTo option.
  // ---------------------------------------------------------------------------
  const handleSocial = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/home` },
    });
  };

  // ---------------------------------------------------------------------------
  // Render — Multi-step form UI
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-zinc-900">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h1>

      {/* Social OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => handleSocial('google')}
          className="flex items-center justify-center gap-3 border border-gray-300 rounded-2xl py-4 hover:bg-gray-50 text-lg font-medium text-zinc-700"
        >
          <span className="text-2xl">G</span> Google
        </button>
        <button
          onClick={() => handleSocial('facebook')}
          className="flex items-center justify-center gap-3 border border-gray-300 rounded-2xl py-4 hover:bg-gray-50 text-lg font-medium text-zinc-700"
        >
          <span className="text-2xl">f</span> Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="text-center text-sm text-gray-500 mb-6">
        or continue with email / phone
      </div>

      {/* Step 1: Email/Phone Input */}
      {step === 'input' && (
        <>
          <input
            type="text"
            placeholder="Email or Phone (9876543210)"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="w-full px-6 py-5 border border-gray-300 rounded-2xl mb-6 text-lg text-zinc-900"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading || !emailOrPhone}
            className="w-full bg-black text-white py-5 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
          >
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <>
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
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-black text-white py-5 rounded-2xl font-semibold text-lg"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </>
      )}

      {/* Step 3: Password Creation (Sign Up only) */}
      {step === 'password' && (
        <>
          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-5 border border-gray-300 rounded-2xl mb-4 text-zinc-900"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-6 py-5 border border-gray-300 rounded-2xl mb-8 text-zinc-900"
          />
          <button
            onClick={handleSetPassword}
            disabled={loading || password.length < 6}
            className="w-full bg-black text-white py-5 rounded-2xl font-semibold text-lg"
          >
            {loading ? 'Creating account…' : 'Complete Sign Up'}
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