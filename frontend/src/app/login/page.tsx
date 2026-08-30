'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      localStorage.setItem('vcs_token', res.data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-github-card border border-github-border rounded-lg p-6 shadow-xl">
        <div className="text-center mb-6">
          <LogIn className="w-8 h-8 text-github-blue mx-auto mb-2" />
          <h2 className="text-xl font-bold text-white">Sign In to Flicko</h2>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-github-text mb-1">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full bg-github-bg border border-github-border text-github-text rounded p-2 text-sm focus:outline-none focus:border-github-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-github-text mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-github-bg border border-github-border text-github-text rounded p-2 text-sm focus:outline-none focus:border-github-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-github-accent text-white py-2 rounded text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-github-muted text-center mt-6">
          New to Flicko?{' '}
          <Link href="/register" className="text-github-blue hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
