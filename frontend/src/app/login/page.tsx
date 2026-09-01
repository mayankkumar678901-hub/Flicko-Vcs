'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Eye, EyeOff, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';

function getKnownAccounts(): Array<{ username: string; email: string }> {
  try {
    return JSON.parse(localStorage.getItem('flicko_known_accounts') || '[]');
  } catch {
    return [];
  }
}

function saveKnownAccount(username: string, email: string) {
  try {
    const list = getKnownAccounts();
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

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanInput = emailOrUsername.trim();
    const cleanPassword = password.trim();

    try {
      const res = await api.post('/auth/login', { emailOrUsername: cleanInput, password: cleanPassword });
      localStorage.setItem('vcs_token', res.data.token);
      saveKnownAccount(res.data.user.username, res.data.user.email);
      window.location.href = '/';
    } catch (err: any) {
      const errMsg = err.response?.data?.error || '';

      // Self-Healing Cloud Auto-Recovery
      if (errMsg.includes('User not found') || errMsg.includes('Invalid credentials')) {
        const known = getKnownAccounts();
        const matched = known.find(
          (a) =>
            a.username.toLowerCase() === cleanInput.toLowerCase() ||
            a.email.toLowerCase() === cleanInput.toLowerCase()
        );

        if (matched) {
          try {
            console.log('🔄 Re-syncing account with cloud container...');
            const regRes = await api.post('/auth/register', {
              username: matched.username,
              email: matched.email,
              password: cleanPassword,
            });
            localStorage.setItem('vcs_token', regRes.data.token);
            saveKnownAccount(matched.username, matched.email);
            window.location.href = '/';
            return;
          } catch (reSyncErr: any) {
            console.warn('Auto-recovery re-sync failed:', reSyncErr.message);
          }
        }
      }

      setError(err.response?.data?.error || 'Invalid credentials. Please check your username/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          {/* Official Flicko Logo */}
          <div className="relative w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-xl shadow-pink-500/25 border-2 border-pink-500/30 p-0.5 bg-[#0a0d14]">
            <img
              src="/logo.png"
              alt="Flicko Logo"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Flicko</h1>
          <p className="text-slate-400 text-xs">Enter your credentials to access your repositories</p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl text-center leading-relaxed flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Username or email"
                className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2.5 pl-9 rounded-xl text-sm focus:outline-none focus:border-sky-400 font-mono"
              />
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2.5 pl-9 pr-10 rounded-xl text-sm focus:outline-none focus:border-sky-400"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          New to Flicko?{' '}
          <Link href="/register" className="text-sky-400 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
