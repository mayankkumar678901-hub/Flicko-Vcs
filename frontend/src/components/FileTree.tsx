'use client';

import React from 'react';
import Link from 'next/link';
import { Folder, FileText, Eye } from 'lucide-react';
import { TreeItem } from '@/lib/api';

interface FileTreeProps {
  owner: string;
  repo: string;
  refName: string;
  items: TreeItem[];
  currentPath: string;
  onPreviewFile?: (path: string) => void;
}

export default function FileTree({
  owner,
  repo,
  refName,
  items,
  currentPath,
  onPreviewFile,
}: FileTreeProps) {
  const getLink = (item: TreeItem) => {
    if (item.type === 'tree') {
      return `/${owner}/${repo}/tree/${refName}/${item.path}`;
    }
    return `/${owner}/${repo}/blob/${refName}/${item.path}`;
  };

  return (
    <div className="border border-slate-800 rounded-xl bg-[#121722] overflow-hidden my-4 shadow-xl">
      <div className="bg-[#0a0d14] px-4 py-2.5 text-xs text-slate-400 border-b border-slate-800 flex items-center justify-between font-mono">
        <span>Directory navigation</span>
        <span>{items.length} items</span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {items.map((item) => (
          <div
            key={item.path}
            className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-900/60 transition text-sm group"
          >
            <div className="flex items-center space-x-3">
              {item.type === 'tree' ? (
                <Folder className="w-4 h-4 text-sky-400 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <Link
                href={getLink(item)}
                className={`hover:underline font-mono text-xs ${
                  item.type === 'tree' ? 'font-semibold text-white' : 'text-slate-200 hover:text-sky-400'
                }`}
              >
                {item.name}
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {item.type === 'blob' && onPreviewFile && (
                <button
                  type="button"
                  onClick={() => onPreviewFile(item.path)}
                  className="hidden group-hover:flex items-center space-x-1 text-[11px] bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white px-2 py-0.5 rounded transition shadow"
                  title="Quick Preview in Sliding Window"
                >
                  <Eye className="w-3 h-3" />
                  <span>Sliding Window</span>
                </button>
              )}

              {item.size !== undefined && (
                <span className="text-xs text-slate-500 font-mono">{item.size} bytes</span>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-slate-500 text-sm font-mono">This directory is empty.</div>
        )}
      </div>
    </div>
  );
}
