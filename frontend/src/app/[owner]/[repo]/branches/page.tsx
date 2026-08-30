'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { GitBranch, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function BranchesPage({ params }: { params: { owner: string; repo: string } }) {
  const [branches, setBranches] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBranches();
  }, [params.owner, params.repo]);

  const fetchBranches = () => {
    setLoading(true);
    api
      .get(`/git/${params.owner}/${params.repo}/branches`)
      .then((res) => {
        setBranches(res.data.branches.all);
        setCurrent(res.data.branches.current);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName) return;
    setError('');
    setCreating(true);

    try {
      await api.post(`/git/${params.owner}/${params.repo}/branches`, {
        name: newBranchName,
        startPoint: 'HEAD',
      });
      setNewBranchName('');
      fetchBranches();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create branch');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (!confirm(`Are you sure you want to delete branch '${branchName}'?`)) return;

    try {
      await api.delete(`/git/${params.owner}/${params.repo}/branches/${branchName}`);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete branch');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      <div className="flex items-center space-x-3 pb-4 border-b border-github-border">
        <Link
          href={`/${params.owner}/${params.repo}`}
          className="p-1.5 bg-github-card border border-github-border rounded hover:bg-github-border text-github-muted hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-github-blue" />
          <span>Branches</span>
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded">
          {error}
        </div>
      )}

      {/* Create Branch Box */}
      <form onSubmit={handleCreateBranch} className="bg-github-card border border-github-border rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-white">Create New Branch</label>
        <div className="flex space-x-2">
          <input
            type="text"
            required
            placeholder="New branch name (e.g. feature/login)"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            className="flex-1 bg-github-bg border border-github-border text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:border-github-blue font-mono"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-github-accent text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-opacity-90 transition flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Creating...' : 'Create Branch'}</span>
          </button>
        </div>
      </form>

      {/* Branch List Table */}
      {loading ? (
        <div className="py-12 text-center text-github-muted text-sm">Loading branches...</div>
      ) : (
        <div className="border border-github-border rounded-md bg-github-card overflow-hidden divide-y divide-github-border">
          {branches.map((b) => (
            <div key={b} className="p-4 flex items-center justify-between hover:bg-github-bg transition">
              <div className="flex items-center space-x-3 font-mono text-sm">
                <GitBranch className="w-4 h-4 text-github-muted" />
                <Link
                  href={`/${params.owner}/${params.repo}?ref=${b}`}
                  className="font-bold text-white hover:text-github-blue"
                >
                  {b}
                </Link>
                {b === current && (
                  <span className="text-[10px] bg-github-blue/20 text-github-blue px-2 py-0.5 rounded-full font-sans font-semibold">
                    default
                  </span>
                )}
              </div>

              {b !== 'main' && b !== 'master' && (
                <button
                  onClick={() => handleDeleteBranch(b)}
                  className="p-1.5 text-github-muted hover:text-red-400 rounded transition"
                  title="Delete branch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
