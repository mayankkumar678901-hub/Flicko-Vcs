'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, BookMarked, Plus, GitBranch, Lock, Globe } from 'lucide-react';
import { Repository, api } from '@/lib/api';

export default function Dashboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepos('');
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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-github-border">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Explore Repositories</h1>
          <p className="text-github-muted text-sm mt-1">
            Discover projects, manage codebases, and track commit histories.
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center space-x-2 bg-github-accent text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Repository</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-github-muted absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-github-card border border-github-border text-github-text placeholder-github-muted rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-github-blue"
        />
      </div>

      {/* Repository List */}
      {loading ? (
        <div className="text-center py-12 text-github-muted text-sm">Loading repositories...</div>
      ) : repos.length === 0 ? (
        <div className="text-center py-12 bg-github-card border border-github-border rounded-md">
          <BookMarked className="w-10 h-10 text-github-muted mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No Repositories Found</h3>
          <p className="text-github-muted text-sm mb-4">Be the first to create a version controlled repository.</p>
          <Link
            href="/new"
            className="inline-block bg-github-accent text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-90"
          >
            Create Repository
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-github-card border border-github-border rounded-md p-4 hover:border-github-muted transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/${repo.owner.username}/${repo.name}`}
                    className="text-github-blue font-semibold hover:underline text-base flex items-center space-x-1.5"
                  >
                    <span>{repo.owner.username}</span>
                    <span className="text-github-muted font-normal">/</span>
                    <span className="font-bold text-white">{repo.name}</span>
                  </Link>
                  <span className="flex items-center text-xs text-github-muted border border-github-border px-2 py-0.5 rounded-full">
                    {repo.isPrivate ? (
                      <>
                        <Lock className="w-3 h-3 mr-1 text-yellow-400" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1 text-green-400" /> Public
                      </>
                    )}
                  </span>
                </div>
                <p className="text-github-muted text-xs line-clamp-2 mb-4">
                  {repo.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-github-muted pt-3 border-t border-github-border/50">
                <span className="flex items-center space-x-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{repo.defaultBranch}</span>
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
