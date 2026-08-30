'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FolderPlus } from 'lucide-react';

export default function NewRepoPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-github-border">
        <FolderPlus className="w-6 h-6 text-github-blue" />
        <h1 className="text-xl font-bold text-white">Create a New Repository</h1>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-github-card border border-github-border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-github-text mb-1">
            Repository Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. my-awesome-project"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-github-bg border border-github-border text-github-text rounded p-2 text-sm focus:outline-none focus:border-github-blue"
          />
          <p className="text-[11px] text-github-muted mt-1">
            Great repository names are short and memorable.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-github-text mb-1">
            Description <span className="text-github-muted font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Short description of your repository"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-github-bg border border-github-border text-github-text rounded p-2 text-sm focus:outline-none focus:border-github-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-github-text mb-1">
            Default Branch Name
          </label>
          <input
            type="text"
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
            className="w-full bg-github-bg border border-github-border text-github-text rounded p-2 text-sm focus:outline-none focus:border-github-blue"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="privacy"
              checked={!isPrivate}
              onChange={() => setIsPrivate(false)}
              className="mt-1"
            />
            <div>
              <span className="text-sm font-semibold text-white">Public</span>
              <p className="text-xs text-github-muted">Anyone on the internet can see this repository.</p>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="privacy"
              checked={isPrivate}
              onChange={() => setIsPrivate(true)}
              className="mt-1"
            />
            <div>
              <span className="text-sm font-semibold text-white">Private</span>
              <p className="text-xs text-github-muted">You choose who can see and commit to this repository.</p>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-github-border">
          <button
            type="submit"
            disabled={loading}
            className="bg-github-accent text-white px-5 py-2 rounded text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Initializing Repository...' : 'Create Repository'}
          </button>
        </div>
      </form>
    </div>
  );
}
