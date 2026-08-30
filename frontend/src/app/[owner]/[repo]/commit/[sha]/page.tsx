'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, FileDiff } from '@/lib/api';
import DiffViewer from '@/components/DiffViewer';
import { GitCommit, ArrowLeft, Plus, Minus } from 'lucide-react';

export default function CommitDetailPage({ params }: { params: { owner: string; repo: string; sha: string } }) {
  const [commit, setCommit] = useState<any>(null);
  const [diffs, setDiffs] = useState<FileDiff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/git/${params.owner}/${params.repo}/commit/${params.sha}`)
      .then((res) => {
        setCommit(res.data.commit);
        setDiffs(res.data.diffs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.owner, params.repo, params.sha]);

  if (loading) {
    return <div className="py-12 text-center text-github-muted text-sm">Loading commit diffs...</div>;
  }

  if (!commit) {
    return <div className="py-12 text-center text-red-400">Commit details not found.</div>;
  }

  const totalAdditions = diffs.reduce((acc, d) => acc + d.additions, 0);
  const totalDeletions = diffs.reduce((acc, d) => acc + d.deletions, 0);

  return (
    <div className="space-y-6">
      {/* Header & Commit summary card */}
      <div className="bg-github-card border border-github-border rounded-md p-5 space-y-3">
        <div className="flex items-center space-x-3">
          <Link
            href={`/${params.owner}/${params.repo}/commits`}
            className="p-1.5 bg-github-bg border border-github-border rounded hover:bg-github-border text-github-muted hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold text-white leading-tight">{commit.message}</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-github-muted border-t border-github-border/50 pt-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-github-text">{commit.authorName}</span>
            <span>committed on {new Date(commit.date).toLocaleString()}</span>
          </div>
          <div className="font-mono text-github-blue bg-github-bg border border-github-border px-2.5 py-0.5 rounded select-all">
            commit {commit.sha}
          </div>
        </div>
      </div>

      {/* Diffs Summary Bar */}
      <div className="flex items-center justify-between text-sm text-github-text">
        <span className="font-semibold">Showing {diffs.length} changed files</span>
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="text-green-400 font-bold">+{totalAdditions} additions</span>
          <span className="text-red-400 font-bold">-{totalDeletions} deletions</span>
        </div>
      </div>

      {/* Structured Diff Viewer */}
      <DiffViewer diffs={diffs} />
    </div>
  );
}
