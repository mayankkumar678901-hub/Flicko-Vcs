'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ExternalLink, Copy, Check, FileText, Edit3, Code } from 'lucide-react';
import { api } from '@/lib/api';

interface SlidingFileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  refName: string;
  filePath: string | null;
}

export default function SlidingFileDrawer({
  isOpen,
  onClose,
  owner,
  repo,
  refName,
  filePath,
}: SlidingFileDrawerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && filePath) {
      loadFile();
    }
  }, [isOpen, filePath, owner, repo, refName]);

  const loadFile = async () => {
    if (!filePath) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.get(
        `/git/${owner}/${repo}/blob?ref=${refName}&path=${encodeURIComponent(filePath)}`
      );
      setContent(res.data.content);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load file preview');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !filePath) return null;

  const lines = content.split('\n');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sliding Window Drawer */}
      <div className="relative w-full max-w-2xl bg-[#0f141f] border-l border-slate-700/80 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="bg-[#0a0d14] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="font-mono text-xs text-white font-bold truncate">{filePath}</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
              {refName}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/${owner}/${repo}/blob/${refName}/${filePath}`}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
              title="Open in Full Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 rounded-lg transition"
              title="Close Sliding Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action / Meta Bar */}
        <div className="bg-[#121722] px-5 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{lines.length} lines • {new Blob([content]).size} bytes</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded transition text-xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <Link
              href={`/${owner}/${repo}/edit/${refName}/${filePath}`}
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded transition text-xs font-semibold"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit File</span>
            </Link>
          </div>
        </div>

        {/* Code Content Window */}
        <div className="flex-1 overflow-auto p-4 bg-[#05070a] font-mono text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Loading file content...</p>
            </div>
          ) : error ? (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="w-10 select-none text-right pr-4 text-slate-600 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre font-mono text-slate-200 pl-2">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
