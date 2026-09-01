'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { KeyRound, Mail, Lock, Eye, EyeOff, Check, X, ShieldAlert, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [generatedCode, setGeneratedCode] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Strong password checks
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[?_@!#$%^&*()+\-=\[\]{};':"\\|,.<>\/~`]/.test(newPassword);
  const isStrong = hasMinLength && hasLetter && hasNumber && hasSpecial;

  // Step 1: Request Verification Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { emailOrUsername });
      setTargetEmail(res.data.email);
      setGeneratedCode(res.data.code);
      setOtp(res.data.code); // Auto-fill for convenience
      setSuccess(`Verification code sent! (Your code is: ${res.data.code})`);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification code. Please check your username/email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password & Auto Login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasLetter) {
      setError('Password must include at least one letter (a-z, A-Z).');
      return;
    }
    if (!hasNumber) {
      setError('Password must include at least one number (0-9).');
      return;
    }
    if (!hasSpecial) {
      setError('Password must include at least one special symbol (e.g. ?, _, @, !).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        emailOrUsername,
        otp,
        newPassword,
      });

      localStorage.setItem('vcs_token', res.data.token);
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 mx-auto shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {step === 'request' ? 'Forgot Password?' : 'Reset Your Password'}
          </h1>
          <p className="text-slate-400 text-xs">
            {step === 'request'
              ? 'Enter your registered email or username to receive a verification code'
              : `Enter the 6-digit verification code sent to ${targetEmail}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl text-center leading-relaxed flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl text-center leading-relaxed flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-semibold">{success}</span>
          </div>
        )}

        {/* Step 1: Request Code Form */}
        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username or Registered Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. mayank or user@example.com"
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2.5 pl-9 rounded-xl text-sm focus:outline-none focus:border-orange-400 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-2.5 rounded-xl font-bold text-xs hover:brightness-110 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Verifying account...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          /* Step 2: Enter OTP & Set New Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                6-Digit Verification Code (OTP)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#0a0d14] border border-slate-700 text-amber-300 text-center tracking-widest font-mono text-lg p-2 rounded-xl focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password <span className="text-slate-500 font-normal">(8+ chars, numbers & symbols ?, _, @)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#0a0d14] border text-white p-2.5 pl-9 pr-10 rounded-xl text-sm focus:outline-none transition ${
                    newPassword.length > 0
                      ? isStrong
                        ? 'border-emerald-500 focus:border-emerald-400'
                        : 'border-amber-500/70 focus:border-amber-400'
                      : 'border-slate-700 focus:border-sky-400'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-2.5 p-2 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 text-[10px]">
                  <div className="grid grid-cols-2 gap-1">
                    <div className={`flex items-center space-x-1 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${hasLetter ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {hasLetter ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Letters (a-z)</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Numbers (0-9)</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Symbols (?, _, @)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#0a0d14] border text-white p-2.5 pl-9 pr-10 rounded-xl text-sm focus:outline-none transition ${
                    confirmPassword.length > 0
                      ? confirmPassword === newPassword
                        ? 'border-emerald-500 focus:border-emerald-400'
                        : 'border-red-500/70 focus:border-red-400'
                      : 'border-slate-700 focus:border-sky-400'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Resetting password...' : 'Reset Password & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-1 flex items-center justify-center space-x-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Request Code</span>
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Remembered your password?{' '}
          <Link href="/login" className="text-sky-400 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
