'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitBranch, Plus, User as UserIcon, LogOut, Code, Settings } from 'lucide-react';
import { User, api } from '@/lib/api';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vcs_token') : null;
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data.user))
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
    <nav className="bg-[#121722]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800/80 text-slate-200 px-6 py-3.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2.5 font-bold text-lg text-white group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#0a0d14] rounded-[7px] flex items-center justify-center">
              <Code className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent font-extrabold tracking-tight text-xl">
            Flicko
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mood Theme Switcher (Available to Everyone) */}
        <ThemeSwitcher />

        {user ? (
          <>
            <Link
              href="/new"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs px-3.5 py-1.5 rounded-lg hover:brightness-110 font-semibold shadow-md shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Repo</span>
            </Link>

            {/* User Profile & Settings link */}
            <Link
              href="/settings"
              className="flex items-center space-x-2 text-sm bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 px-3 py-1 rounded-full transition group"
              title="Profile & Settings"
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                alt={user.username}
                className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600"
              />
              <span className="font-semibold text-slate-200 text-xs group-hover:text-sky-400 transition">{user.username}</span>
            </Link>

            <Link
              href="/settings"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/50 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-3 text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white font-medium transition text-xs">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white px-3.5 py-1.5 rounded-lg hover:brightness-110 font-semibold shadow-md shadow-indigo-500/20 transition text-xs"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
