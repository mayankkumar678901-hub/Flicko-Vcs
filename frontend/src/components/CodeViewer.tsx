'use client';

import React from 'react';
import { Copy, Check, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface CodeViewerProps {
  content: string;
  filePath: string;
  owner: string;
  repo: string;
  refName: string;
}

export default function CodeViewer({ content, filePath, owner, repo, refName }: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const lines = content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-github-border rounded-md bg-github-card overflow-hidden my-4">
      <div className="bg-github-bg px-4 py-2 text-xs border-b border-github-border flex items-center justify-between">
        <div className="flex items-center space-x-3 text-github-muted font-mono">
          <span>{lines.length} lines</span>
          <span>•</span>
          <span>{new Blob([content]).size} bytes</span>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/${owner}/${repo}/edit/${refName}/${filePath}`}
            className="flex items-center space-x-1 text-xs bg-github-card border border-github-border px-2.5 py-1 rounded hover:bg-github-border text-github-text"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs bg-github-card border border-github-border px-2.5 py-1 rounded hover:bg-github-border text-github-text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto text-sm font-mono p-4 bg-[#0d1117]">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-github-card">
                <td className="w-12 select-none text-right pr-4 text-github-muted opacity-50 text-xs">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-github-text pl-2">
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
