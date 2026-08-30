'use client';

import React, { useState } from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BranchSelectorProps {
  owner: string;
  repo: string;
  branches: string[];
  currentBranch: string;
}

export default function BranchSelector({ owner, repo, branches, currentBranch }: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (branch: string) => {
    setIsOpen(false);
    router.push(`/${owner}/${repo}?ref=${branch}`);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-github-card border border-github-border text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-github-border transition"
      >
        <GitBranch className="w-3.5 h-3.5 text-github-muted" />
        <span>{currentBranch}</span>
        <ChevronDown className="w-3.5 h-3.5 text-github-muted" />
      </button>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-github-card border border-github-border ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu">
            <div className="px-3 py-1.5 text-[11px] font-bold text-github-muted border-b border-github-border uppercase tracking-wider">
              Switch Branches
            </div>
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => handleSelect(branch)}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-github-bg transition flex items-center justify-between ${
                  branch === currentBranch ? 'font-bold text-github-blue bg-github-bg/50' : 'text-github-text'
                }`}
              >
                <span>{branch}</span>
                {branch === currentBranch && <span className="text-github-blue text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
