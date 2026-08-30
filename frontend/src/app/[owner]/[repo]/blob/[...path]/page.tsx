'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import CodeViewer from '@/components/CodeViewer';

export default function FileBlobPage({
  params,
}: {
  params: { owner: string; repo: string; path: string[] };
}) {
  const refName = params.path[0];
  const filePath = params.path.slice(1).join('/');

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/git/${params.owner}/${params.repo}/blob?ref=${refName}&path=${encodeURIComponent(filePath)}`)
      .then((res) => setContent(res.data.content))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load file'))
      .finally(() => setLoading(false));
  }, [params.owner, params.repo, refName, filePath]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb Header */}
      <div className="flex items-center space-x-2 text-sm font-semibold text-github-text pb-2 border-b border-github-border">
        <Link href={`/${params.owner}/${params.repo}?ref=${refName}`} className="text-github-blue hover:underline">
          {params.repo}
        </Link>
        <span>/</span>
        <span className="text-white font-mono">{filePath}</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-github-muted text-sm">Loading file content...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-400 bg-github-card border border-github-border rounded-md">
          {error}
        </div>
      ) : (
        <CodeViewer
          content={content}
          filePath={filePath}
          owner={params.owner}
          repo={params.repo}
          refName={refName}
        />
      )}
    </div>
  );
}
