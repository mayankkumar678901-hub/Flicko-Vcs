'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitBranch, Plus, User as UserIcon, LogOut, Code } from 'lucide-react';
import { User, api } from '@/lib/api';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('vcs_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('vcs_token');
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vcs_token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-github-card border-b border-github-border text-github-text px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2 font-bold text-lg text-white hover:text-github-blue">
          <Code className="w-6 h-6 text-github-blue" />
          <span>Mini-VCS</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              href="/new"
              className="flex items-center space-x-1 bg-github-accent text-white text-xs px-3 py-1.5 rounded-md hover:bg-opacity-90 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Repo</span>
            </Link>
            <div className="flex items-center space-x-2 text-sm">
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                alt={user.username}
                className="w-7 h-7 rounded-full bg-github-border"
              />
              <span className="font-semibold text-gray-200">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-github-muted hover:text-white rounded-md transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-3 text-sm">
            <Link href="/login" className="text-github-muted hover:text-white">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-github-accent text-white px-3 py-1.5 rounded-md hover:bg-opacity-90 font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
