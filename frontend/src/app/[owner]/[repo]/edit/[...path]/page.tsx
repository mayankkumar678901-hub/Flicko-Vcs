'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FileEdit, GitCommit, Sparkles, Check, ArrowLeft } from 'lucide-react';

export default function FileEditPage({
  params,
}: {
  params: { owner: string; repo: string; path: string[] };
}) {
  const refName = params.path[0];
  const initialFilePath = params.path.slice(1).join('/');

  const [filePath, setFilePath] = useState(initialFilePath);
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If editing existing file, fetch its initial content
    if (initialFilePath && initialFilePath !== 'new-file.txt') {
      api
        .get(`/git/${params.owner}/${params.repo}/blob?ref=${refName}&path=${encodeURIComponent(initialFilePath)}`)
        .then((res) => {
          setContent(res.data.content);
          setInitialContent(res.data.content);
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

  const handleAiGenerate = async () => {
    if (!filePath || content === undefined) return;
    setAiGenerating(true);

    try {
      const res = await api.post('/git/ai/commit-message', {
        path: filePath,
        content,
        oldContent: initialContent,
      });

      if (res.data.suggestion?.title) {
        setCommitMessage(res.data.suggestion.title);
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 2500);
      }
    } catch (err) {
      console.error('AI commit message generation error', err);
    } finally {
      setAiGenerating(false);
    }
  };

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
      <div className="flex items-center space-x-3 text-sm font-semibold text-slate-300 pb-2 border-b border-slate-800">
        <Link
          href={`/${params.owner}/${params.repo}?ref=${refName}`}
          className="p-1.5 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <FileEdit className="w-5 h-5 text-sky-400" />
        <span className="text-white">Edit / Create File in {params.repo}</span>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleCommit} className="space-y-4">
        {/* File Path input */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-3 flex items-center space-x-2 text-sm shadow-md">
          <span className="text-slate-400 font-mono">{params.repo} /</span>
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
            className="flex-1 bg-[#0a0d14] border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-sm focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Code Editor Textarea */}
        <div className="border border-slate-800 rounded-xl bg-[#0a0d14] overflow-hidden shadow-xl">
          <div className="bg-[#121722] px-4 py-2.5 border-b border-slate-800 text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Editor Window</span>
            <span className="text-xs text-slate-500 font-mono">{content.split('\n').length} lines</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading file editor...</div>
          ) : (
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#0a0d14] text-slate-200 font-mono p-4 text-sm focus:outline-none resize-y"
              placeholder="Write or paste code here..."
            />
          )}
        </div>

        {/* Commit Message Box with AI Assistant */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>Commit changes</span>
            </div>

            {/* AI Generate Button */}
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiGenerating}
              className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:brightness-110 shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
            >
              {aiSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Generated!</span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                  <span>{aiGenerating ? 'Analyzing code...' : '✨ AI Generate Commit'}</span>
                </>
              )}
            </button>
          </div>

          <input
            type="text"
            required
            placeholder="Commit message summary (e.g. feat(app): add user task list)"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:border-sky-400 font-mono"
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Link
              href={`/${params.owner}/${params.repo}?ref=${refName}`}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:brightness-110 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Committing...' : `Commit changes to ${refName}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
