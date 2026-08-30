'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FileEdit, GitCommit } from 'lucide-react';

export default function FileEditPage({
  params,
}: {
  params: { owner: string; repo: string; path: string[] };
}) {
  const refName = params.path[0];
  const initialFilePath = params.path.slice(1).join('/');

  const [filePath, setFilePath] = useState(initialFilePath);
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If editing existing file, fetch its initial content
    if (initialFilePath && initialFilePath !== 'new-file.txt') {
      api
        .get(`/git/${params.owner}/${params.repo}/blob?ref=${refName}&path=${encodeURIComponent(initialFilePath)}`)
        .then((res) => {
          setContent(res.data.content);
          setCommitMessage(`Update ${initialFilePath}`);
        })
        .catch(() => {
          setCommitMessage(`Create ${initialFilePath}`);
        })
        .finally(() => setLoading(false));
    } else {
      setCommitMessage(`Create ${filePath || 'file'}`);
      setLoading(false);
    }
  }, [params.owner, params.repo, refName, initialFilePath]);

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/git/${params.owner}/${params.repo}/contents`, {
        path: filePath,
        content,
        commitMessage,
        branch: refName,
      });

      router.push(`/${params.owner}/${params.repo}/blob/${refName}/${filePath}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to commit file changes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center space-x-2 text-sm font-semibold text-github-text pb-2 border-b border-github-border">
        <FileEdit className="w-5 h-5 text-github-blue" />
        <span className="text-white">Edit / Create File in {params.repo}</span>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleCommit} className="space-y-4">
        {/* File Path input */}
        <div className="bg-github-card border border-github-border rounded-md p-3 flex items-center space-x-2 text-sm">
          <span className="text-github-muted font-mono">{params.repo} /</span>
          <input
            type="text"
            required
            value={filePath}
            onChange={(e) => {
              setFilePath(e.target.value);
              if (!commitMessage || commitMessage.startsWith('Update') || commitMessage.startsWith('Create')) {
                setCommitMessage(`Update ${e.target.value}`);
              }
            }}
            placeholder="filename.ext"
            className="flex-1 bg-github-bg border border-github-border text-white px-2 py-1 rounded font-mono text-sm focus:outline-none focus:border-github-blue"
          />
        </div>

        {/* Code Editor Textarea */}
        <div className="border border-github-border rounded-md bg-[#0d1117] overflow-hidden">
          <div className="bg-github-card px-4 py-2 border-b border-github-border text-xs text-github-muted font-semibold">
            Edit file content
          </div>
          {loading ? (
            <div className="p-8 text-center text-github-muted text-sm">Loading file editor...</div>
          ) : (
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#0d1117] text-github-text font-mono p-4 text-sm focus:outline-none resize-y"
              placeholder="Write or paste code here..."
            />
          )}
        </div>

        {/* Commit Message Box */}
        <div className="bg-github-card border border-github-border rounded-md p-4 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <GitCommit className="w-4 h-4 text-github-accent" />
            <span>Commit changes</span>
          </div>
          <input
            type="text"
            required
            placeholder="Commit message summary"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full bg-github-bg border border-github-border text-white p-2 rounded text-sm focus:outline-none focus:border-github-blue"
          />
          <div className="flex justify-end space-x-3 pt-2">
            <Link
              href={`/${params.owner}/${params.repo}?ref=${refName}`}
              className="px-4 py-2 text-xs font-semibold text-github-muted hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-github-accent text-white px-4 py-2 rounded text-xs font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Committing...' : `Commit changes to ${refName}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
