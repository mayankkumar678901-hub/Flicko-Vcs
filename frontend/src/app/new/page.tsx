'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sparkles, FolderPlus, Wand2, Globe, Lock, ArrowRight, Gamepad2, User, CloudSun, Check, Cpu } from 'lucide-react';

const AI_TEMPLATES = [
  {
    title: 'Retro Cyberpunk Snake Game',
    icon: '🎮',
    prompt: 'A futuristic neon retro cyberpunk snake arcade game with score tracking, sound effects, and neon glow effects',
    defaultName: 'cybersnake-arcade'
  },
  {
    title: 'Glassmorphism Developer Portfolio',
    icon: '💼',
    prompt: 'A modern glassmorphism developer portfolio showcasing interactive project cards, skills cloud, and contact modal',
    defaultName: 'modern-dev-portfolio'
  },
  {
    title: 'Futuristic Live Weather Dashboard',
    icon: '🌤️',
    prompt: 'A futuristic live weather forecast app with atmospheric visual themes, city search, and 5-day weather metrics',
    defaultName: 'skypulse-weather'
  },
  {
    title: 'Interactive SaaS Control Center',
    icon: '⚡',
    prompt: 'A modern SaaS analytics control dashboard with live event streams, interactive cards, and responsive theme',
    defaultName: 'saas-control-center'
  }
];

export default function NewRepoPage() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('main');

  const [loading, setLoading] = useState(false);
  const [buildStep, setBuildStep] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSelectTemplate = (tpl: typeof AI_TEMPLATES[0]) => {
    setPrompt(tpl.prompt);
    setName(tpl.defaultName);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please provide a prompt or select a template for the AI to build.');
      return;
    }

    setError('');
    setLoading(true);
    setBuildStep('1. Synthesizing full-stack HTML5, CSS3 & JavaScript code...');

    try {
      setTimeout(() => setBuildStep('2. Initializing Git repository and file system...'), 700);
      setTimeout(() => setBuildStep('3. Generating structured Git commits & branch history...'), 1400);

      const res = await api.post('/repos/generate-ai', {
        prompt: prompt.trim(),
        name: name.trim() || undefined,
        isPrivate,
      });

      setBuildStep('4. Launching Live Sandbox...');
      const repo = res.data.repo;
      setTimeout(() => {
        router.push(`/${repo.owner.username}/${repo.name}`);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate AI repository. Please try again.');
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/repos', {
        name,
        description,
        isPrivate,
        defaultBranch,
      });

      const repo = res.data.repo;
      router.push(`/${repo.owner.username}/${repo.name}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create repository');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Create a New Repository</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Initialize a version-controlled code repository on Flicko
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#121722] border border-slate-800 rounded-xl">
        <button
          onClick={() => setMode('ai')}
          className={`py-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
            mode === 'ai'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>✨ AI One-Prompt Project Builder</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
        </button>

        <button
          onClick={() => setMode('manual')}
          className={`py-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
            mode === 'manual'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-sky-400" />
          <span>📁 Manual Blank Repository</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Mode 1: AI Instant Project Builder */}
      {mode === 'ai' ? (
        <form onSubmit={handleAiSubmit} className="bg-[#121722] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>What do you want to build? (AI Prompt)</span>
              </label>
              <span className="text-[11px] text-purple-300 font-mono">Zero code setup required</span>
            </div>

            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build an interactive retro arcade game with neon graphics and high score leaderboard..."
              className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-purple-400 font-sans shadow-inner placeholder-slate-500"
            />

            {/* Quick Inspiration Pills */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">⚡ Or pick a popular starter template:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                      prompt === tpl.prompt
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                        : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-lg shrink-0">{tpl.icon}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate text-white">{tpl.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{tpl.defaultName}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Repository Name <span className="text-slate-500 font-normal">(optional, auto-generated)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-cool-app"
                className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Repository Visibility
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    !isPrivate ? 'bg-slate-800 border-sky-400 text-white' : 'bg-[#0a0d14] border-slate-800 text-slate-400'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    isPrivate ? 'bg-slate-800 border-yellow-400 text-white' : 'bg-[#0a0d14] border-slate-800 text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Private</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading Animation & Progress Indicator */}
          {loading && (
            <div className="bg-[#0a0d14] border border-purple-500/40 rounded-xl p-4 text-center space-y-2 animate-in fade-in">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-purple-300 font-semibold">{buildStep}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl font-extrabold text-sm hover:brightness-110 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{loading ? 'Synthesizing with AI...' : '✨ Generate Code & Launch Repository'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* Mode 2: Manual Blank Repository Form */
        <form onSubmit={handleManualSubmit} className="bg-[#121722] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Repository Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. my-awesome-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Short description of your repository"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Branch Name
            </label>
            <input
              type="text"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/40 transition">
              <input
                type="radio"
                name="privacy"
                checked={!isPrivate}
                onChange={() => setIsPrivate(false)}
                className="mt-1"
              />
              <div>
                <span className="text-xs font-bold text-white flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public</span>
                </span>
                <p className="text-[11px] text-slate-400">Anyone on the internet can see this repository.</p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/40 transition">
              <input
                type="radio"
                name="privacy"
                checked={isPrivate}
                onChange={() => setIsPrivate(true)}
                className="mt-1"
              />
              <div>
                <span className="text-xs font-bold text-white flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Private</span>
                </span>
                <p className="text-[11px] text-slate-400">Only you can see and commit to this repository.</p>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Initializing Repository...' : 'Create Blank Repository'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
