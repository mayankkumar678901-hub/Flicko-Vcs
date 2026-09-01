'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Check, X, ShieldAlert } from 'lucide-react';

function saveKnownAccount(username: string, email: string) {
  try {
    const list: Array<{ username: string; email: string }> = JSON.parse(
      localStorage.getItem('flicko_known_accounts') || '[]'
    );
    const idx = list.findIndex(
      (a) => a.username.toLowerCase() === username.toLowerCase() || a.email.toLowerCase() === email.toLowerCase()
    );
    if (idx >= 0) {
      list[idx] = { username, email };
    } else {
      list.push({ username, email });
    }
    localStorage.setItem('flicko_known_accounts', JSON.stringify(list));
  } catch {}
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Real-time password criteria
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[?_@!#$%^&*()+\-=\[\]{};':"\\|,.<>\/~`]/.test(password);
  const isStrong = hasMinLength && hasLetter && hasNumber && hasSpecial;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('vcs_token', res.data.token);
      saveKnownAccount(username, email);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          {/* Official Flicko Logo */}
          <div className="relative w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-xl shadow-purple-500/25 border-2 border-purple-500/30 p-0.5 bg-[#0a0d14]">
            <img
              src="/logo.png"
              alt="Flicko Logo"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your Flicko account</h1>
          <p className="text-slate-400 text-xs">Join Flicko to host repositories and run live web apps</p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl text-center leading-relaxed flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex"
                className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2.5 pl-9 rounded-xl text-sm focus:outline-none focus:border-sky-400 font-mono"
              />
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2.5 pl-9 rounded-xl text-sm focus:outline-none focus:border-sky-400 font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password <span className="text-slate-500 font-normal">(8+ chars, numbers & symbols ?, _, @)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#0a0d14] border text-white p-2.5 pl-9 pr-10 rounded-xl text-sm focus:outline-none transition ${
                  password.length > 0
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

            {/* Real-time Password Strength Criteria */}
            {password.length > 0 && (
              <div className="mt-2.5 p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-semibold pb-1 border-b border-slate-800 text-slate-300">
                  <span>Password Strength</span>
                  <span className={isStrong ? 'text-emerald-400 flex items-center space-x-1' : 'text-amber-400'}>
                    {isStrong ? 'Strong Password' : 'Incomplete'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasLetter ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasLetter ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Letters (a-z, A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Numbers (0-9)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Symbols (?, _, @, !)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm Password
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
                    ? confirmPassword === password
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
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-bold text-xs hover:brightness-110 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Already have an account?{' '}
          <Link href="/login" className="text-sky-400 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
