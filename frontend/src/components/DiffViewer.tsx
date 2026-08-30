'use client';

import React from 'react';
import { FileDiff } from '@/lib/api';
import { FileCode, Plus, Minus } from 'lucide-react';

interface DiffViewerProps {
  diffs: FileDiff[];
}

export default function DiffViewer({ diffs }: DiffViewerProps) {
  if (!diffs || diffs.length === 0) {
    return (
      <div className="p-6 text-center text-github-muted bg-github-card border border-github-border rounded-md">
        No file changes found in this commit.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diffs.map((diff, index) => {
        const lines = diff.diffText.split('\n');

        return (
          <div key={index} className="border border-github-border rounded-md bg-github-card overflow-hidden">
            {/* Header */}
            <div className="bg-github-bg px-4 py-2.5 border-b border-github-border flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-github-blue" />
                <span className="font-semibold text-white">{diff.newPath || diff.oldPath}</span>
                <span className="text-github-muted capitalize">({diff.status})</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 flex items-center">
                  <Plus className="w-3 h-3 mr-0.5" /> {diff.additions}
                </span>
                <span className="text-red-400 flex items-center">
                  <Minus className="w-3 h-3 mr-0.5" /> {diff.deletions}
                </span>
              </div>
            </div>

            {/* Line-by-line Diff */}
            <div className="overflow-x-auto text-xs font-mono bg-[#0d1117]">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {lines.map((line, idx) => {
                    let bgClass = '';
                    let textClass = 'text-github-text';

                    if (line.startsWith('+') && !line.startsWith('+++')) {
                      bgClass = 'bg-green-950/40 bg-opacity-30 border-l-2 border-green-500';
                      textClass = 'text-green-300';
                    } else if (line.startsWith('-') && !line.startsWith('---')) {
                      bgClass = 'bg-red-950/40 bg-opacity-30 border-l-2 border-red-500';
                      textClass = 'text-red-300';
                    } else if (line.startsWith('@@')) {
                      bgClass = 'bg-github-border/30 text-github-blue';
                    }

                    return (
                      <tr key={idx} className={`${bgClass} hover:brightness-110`}>
                        <td className="w-8 select-none text-center pr-2 text-github-muted opacity-50 font-bold">
                          {line.startsWith('+') ? '+' : line.startsWith('-') ? '-' : ''}
                        </td>
                        <td className={`whitespace-pre font-mono py-0.5 px-2 ${textClass}`}>
                          {line || ' '}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
