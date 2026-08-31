'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check, Edit3, Lock } from 'lucide-react';
import Link from 'next/link';
import { api, User } from '@/lib/api';

interface CodeViewerProps {
  content: string;
  filePath: string;
  owner: string;
  repo: string;
  refName: string;
}

export default function CodeViewer({ content, filePath, owner, repo, refName }: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [repoOwnerId, setRepoOwnerId] = useState<string | null>(null);
  const lines = content.split('\n');

  useEffect(() => {
    // Check logged in user and repo owner
    const token = localStorage.getItem('vcs_token');
    if (token) {
      api.get('/auth/me').then((res) => setCurrentUser(res.data.user)).catch(() => {});
    }
    api.get(`/repos/${owner}/${repo}`).then((res) => setRepoOwnerId(res.data.repo.owner.id)).catch(() => {});
  }, [owner, repo]);

  const isOwner = currentUser && repoOwnerId && currentUser.id === repoOwnerId;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-800 rounded-xl bg-[#121722] overflow-hidden my-4 shadow-xl">
      <div className="bg-[#0a0d14] px-4 py-2.5 text-xs border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-slate-400 font-mono">
          <span>{lines.length} lines</span>
          <span>•</span>
          <span>{new Blob([content]).size} bytes</span>
        </div>
        <div className="flex items-center space-x-2">
          {isOwner ? (
            <Link
              href={`/${owner}/${repo}/edit/${refName}/${filePath}`}
              className="flex items-center space-x-1 text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-700 text-white font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          ) : (
            <span
              className="flex items-center space-x-1 text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-500 font-medium cursor-not-allowed"
              title="Only repository owner can edit files"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-700 text-white font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto text-sm font-mono p-4 bg-[#05070a]">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50">
                <td className="w-12 select-none text-right pr-4 text-slate-600 text-xs">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-200 pl-2">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
