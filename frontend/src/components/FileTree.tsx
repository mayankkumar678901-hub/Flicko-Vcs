'use client';

import React from 'react';
import Link from 'next/link';
import { Folder, FileText } from 'lucide-react';
import { TreeItem } from '@/lib/api';

interface FileTreeProps {
  owner: string;
  repo: string;
  refName: string;
  items: TreeItem[];
  currentPath: string;
}

export default function FileTree({ owner, repo, refName, items, currentPath }: FileTreeProps) {
  const getLink = (item: TreeItem) => {
    if (item.type === 'tree') {
      return `/${owner}/${repo}/tree/${refName}/${item.path}`;
    }
    return `/${owner}/${repo}/blob/${refName}/${item.path}`;
  };

  return (
    <div className="border border-github-border rounded-md bg-github-card overflow-hidden my-4">
      <div className="bg-github-bg px-4 py-2 text-xs text-github-muted border-b border-github-border flex items-center justify-between font-mono">
        <span>Directory navigation</span>
        <span>{items.length} items</span>
      </div>

      <div className="divide-y divide-github-border">
        {items.map((item) => (
          <div key={item.path} className="px-4 py-2.5 flex items-center justify-between hover:bg-github-bg transition text-sm">
            <div className="flex items-center space-x-3">
              {item.type === 'tree' ? (
                <Folder className="w-4 h-4 text-github-blue flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-github-muted flex-shrink-0" />
              )}
              <Link
                href={getLink(item)}
                className={`hover:underline ${
                  item.type === 'tree' ? 'font-semibold text-white' : 'text-github-blue'
                }`}
              >
                {item.name}
              </Link>
            </div>
            {item.size !== undefined && (
              <span className="text-xs text-github-muted font-mono">{item.size} bytes</span>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-github-muted text-sm">This folder is empty.</div>
        )}
      </div>
    </div>
  );
}
