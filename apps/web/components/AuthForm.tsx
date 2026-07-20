// =============================================================================
// Auth Form — Redesigned for Kids (Light, Colorful)
// =============================================================================
// Bright, inviting authentication form with purple accents,
// large inputs, and playful design elements.
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (error) {
        setMessage(error.message);
      } else {
        router.refresh();
        router.push('/home');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.refresh();
        router.push('/home');
      }
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
      setMessage('OTP sent to your phone! 📱');
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
      router.refresh();
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
    <div className="w-full max-w-md mx-auto animate-bounce-in">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-8 sm:p-10 relative overflow-hidden">
        {/* Decorative top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
            <span className="text-2xl font-black text-white">CM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">
            {isSignUp ? 'Join CodeMaster! 🚀' : 'Welcome Back! 👋'}
          </h1>
          <p className="text-sm text-[#9E9EB8] font-medium">
            {isSignUp
              ? 'Start your coding adventure today'
              : 'Continue your coding journey'}
          </p>
        </div>

        {step === 'input' ? (
          <>
            {/* Email & Password Form */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">✉️</span>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#1A1A2E] placeholder-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium"
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#1A1A2E] placeholder-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium"
                />
              </div>
              <button
                onClick={handleEmailAuth}
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  isSignUp ? 'Create Account ✨' : 'Sign In ✨'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={() => handleSocial('google')}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-4 mb-6 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-[#1A1A2E] active:scale-[0.98]"
            >
              {/* Google icon */}
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Continue with Google
            </button>

            {/* Phone divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold">📱 Phone Login</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">+91</span>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#1A1A2E] placeholder-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium"
                />
              </div>
              <button
                onClick={handleSendPhoneOtp}
                disabled={loading || !phone}
                className="w-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? 'Sending OTP…' : 'Send OTP 📲'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* OTP Verification Step */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📱</div>
              <p className="text-sm text-[#64648B] font-medium">
                Enter the 6-digit code sent to your phone
              </p>
            </div>
            <div className="mb-6">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-6 py-5 text-center text-3xl bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 text-[#1A1A2E] tracking-[0.5em] font-bold transition-all"
                placeholder="• • • • • •"
              />
            </div>
            <button
              onClick={handleVerifyPhoneOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-5 rounded-2xl font-bold text-base shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify OTP ✓'}
            </button>
            
            <button
              onClick={() => {
                setStep('input');
                setOtp('');
                setMessage('');
              }}
              className="w-full mt-4 text-purple-500 hover:text-purple-700 transition-colors font-semibold text-sm py-2"
            >
              ← Back to login options
            </button>
          </>
        )}

        {/* Error/Success Message */}
        {message && (
          <div className={`mt-6 p-3 rounded-xl text-center text-sm font-semibold ${
            message.includes('sent') || message.includes('success')
              ? 'bg-teal-50 text-teal-700 border border-teal-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Toggle between Sign Up and Sign In */}
        <p className="text-center text-sm text-[#9E9EB8] mt-6 font-medium">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a
            href={isSignUp ? '/auth?mode=signin' : '/auth'}
            className="text-purple-600 hover:text-purple-800 font-bold transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </a>
        </p>
      </div>
    </div>
  );
}