'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FolderPlus, Globe, Lock, GitBranch } from 'lucide-react';

export default function NewRepoPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('main');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <FolderPlus className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create a New Repository</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            A repository contains all project files, including the revision history.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#121722] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
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
          <p className="text-[11px] text-slate-500 mt-1">
            Great repository names are short and memorable.
          </p>
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
          <div className="relative">
            <input
              type="text"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-xl p-2.5 pl-9 text-xs focus:outline-none focus:border-sky-400 font-mono"
            />
            <GitBranch className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          </div>
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
            {loading ? 'Initializing Repository...' : 'Create Repository'}
          </button>
        </div>
      </form>
    </div>
  );
}
