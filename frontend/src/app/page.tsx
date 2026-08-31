'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, BookMarked, Plus, GitBranch, Lock, Globe, Code, Sparkles, Play, Shield, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Repository, api, User } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vcs_token') : null;
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          fetchRepos('');
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const fetchRepos = (query: string) => {
    setLoading(true);
    api.get(`/repos?search=${encodeURIComponent(query)}`)
      .then((res) => setRepos(res.data.repos))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchRepos(val);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm">Loading Flicko...</p>
      </div>
    );
  }

  // 1. Logged-Out / Unregistered Visitor View: NO REPOSITORIES SHOWN
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-12 text-center">
        {/* Hero Section */}
        <div className="space-y-5">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Native Web Version Control System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Where Code Meets <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Intelligence</span>
          </h1>

          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Host Git repositories, generate automated AI commits, inspect line-by-line diffs, and test live web applications instantly in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              href="/register"
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 shadow-lg shadow-indigo-500/25 transition w-full sm:w-auto justify-center"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/login"
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition w-full sm:w-auto justify-center"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Flicko</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6 border-t border-slate-800/80">
          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="font-bold text-white text-sm">AI Commit Engine</h3>
            <p className="text-xs text-slate-400">
              Auto-generate structured conventional commit messages and natural language diff explanations.
            </p>
          </div>

          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Live Web Sandbox</h3>
            <p className="text-xs text-slate-400">
              Run HTML/CSS/JS repositories directly in isolated browser viewports without any local setup.
            </p>
          </div>

          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Owner RBAC Protection</h3>
            <p className="text-xs text-slate-400">
              Full control over your own repositories while visitors enjoy safe read-only browsing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged-In User View: SHOW REPOSITORIES & REPO MANAGER
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Explore Repositories</h1>
          <p className="text-slate-400 text-xs mt-1">
            Welcome back, <strong className="text-white">{user.username}</strong>! Manage codebases and run live web applications.
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Repository</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-[#121722] border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 shadow-md"
        />
      </div>

      {/* Repository List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading repositories...</div>
      ) : repos.length === 0 ? (
        <div className="text-center py-12 bg-[#121722] border border-slate-800 rounded-xl p-8 shadow-xl">
          <BookMarked className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No Repositories Found</h3>
          <p className="text-slate-400 text-xs mb-4">Be the first to create a version controlled repository.</p>
          <Link
            href="/new"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:brightness-110 shadow-md shadow-emerald-500/20"
          >
            Create Repository
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-[#121722] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/${repo.owner.username}/${repo.name}`}
                    className="text-sky-400 font-semibold hover:underline text-base flex items-center space-x-1.5"
                  >
                    <span>{repo.owner.username}</span>
                    <span className="text-slate-500 font-normal">/</span>
                    <span className="font-bold text-white group-hover:text-sky-300 transition">{repo.name}</span>
                  </Link>
                  <span className="flex items-center text-xs text-slate-400 border border-slate-700/80 bg-slate-900/60 px-2.5 py-0.5 rounded-full font-medium">
                    {repo.isPrivate ? (
                      <>
                        <Lock className="w-3 h-3 mr-1 text-yellow-400" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1 text-emerald-400" /> Public
                      </>
                    )}
                  </span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {repo.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-500 pt-3 border-t border-slate-800/80 font-mono">
                <span className="flex items-center space-x-1">
                  <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-slate-400">{repo.defaultBranch}</span>
                </span>
                <span>•</span>
                <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
