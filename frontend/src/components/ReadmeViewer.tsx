'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen } from 'lucide-react';

interface ReadmeViewerProps {
  content: string;
}

export default function ReadmeViewer({ content }: ReadmeViewerProps) {
  return (
    <div className="border border-github-border rounded-md bg-github-card overflow-hidden my-6">
      <div className="bg-github-bg px-4 py-3 border-b border-github-border flex items-center space-x-2 text-sm font-semibold text-white">
        <BookOpen className="w-4 h-4 text-github-muted" />
        <span>README.md</span>
      </div>
      <div className="p-6 prose prose-invert max-w-none text-github-text text-sm leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
