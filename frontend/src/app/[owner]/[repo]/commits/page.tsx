'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, CommitItem } from '@/lib/api';
import { GitCommit, Clock, User, ArrowLeft } from 'lucide-react';

export default function CommitHistoryPage({ params }: { params: { owner: string; repo: string } }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'main';

  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/git/${params.owner}/${params.repo}/commits?ref=${ref}`)
      .then((res) => setCommits(res.data.commits))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.owner, params.repo, ref]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-github-border">
        <div className="flex items-center space-x-3">
          <Link
            href={`/${params.owner}/${params.repo}?ref=${ref}`}
            className="p-1.5 bg-github-card border border-github-border rounded hover:bg-github-border text-github-muted hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-github-accent" />
            <span>Commit History ({ref})</span>
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-github-muted text-sm">Loading commit history...</div>
      ) : commits.length === 0 ? (
        <div className="py-12 text-center text-github-muted bg-github-card border border-github-border rounded-md">
          No commits found on branch '{ref}'.
        </div>
      ) : (
        <div className="border border-github-border rounded-md bg-github-card overflow-hidden divide-y divide-github-border">
          {commits.map((commit) => (
            <div key={commit.sha} className="p-4 flex items-center justify-between hover:bg-github-bg transition">
              <div className="flex items-start space-x-3">
                <GitCommit className="w-5 h-5 text-github-blue mt-0.5 flex-shrink-0" />
                <div>
                  <Link
                    href={`/${params.owner}/${params.repo}/commit/${commit.sha}`}
                    className="font-semibold text-white hover:text-github-blue text-sm line-clamp-1"
                  >
                    {commit.message}
                  </Link>
                  <div className="flex items-center space-x-2 text-xs text-github-muted mt-1">
                    <span className="font-medium text-github-text">{commit.authorName}</span>
                    <span>committed on</span>
                    <span>{new Date(commit.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/${params.owner}/${params.repo}/commit/${commit.sha}`}
                className="font-mono text-xs bg-github-bg border border-github-border px-2.5 py-1 rounded text-github-blue hover:underline"
              >
                {commit.shortSha}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
