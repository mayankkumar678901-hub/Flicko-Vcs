'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, FileDiff } from '@/lib/api';
import DiffViewer from '@/components/DiffViewer';
import { GitCommit, ArrowLeft, Plus, Minus, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CommitDetailPage({ params }: { params: { owner: string; repo: string; sha: string } }) {
  const [commit, setCommit] = useState<any>(null);
  const [diffs, setDiffs] = useState<FileDiff[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiCard, setShowAiCard] = useState(false);

  useEffect(() => {
    api
      .get(`/git/${params.owner}/${params.repo}/commit/${params.sha}`)
      .then((res) => {
        setCommit(res.data.commit);
        setDiffs(res.data.diffs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.owner, params.repo, params.sha]);

  const handleExplainWithAi = async () => {
    setShowAiCard(true);
    if (aiExplanation) return;

    setAiLoading(true);
    try {
      const res = await api.get(`/git/${params.owner}/${params.repo}/ai/explain/${params.sha}`);
      setAiExplanation(res.data.explanation);
    } catch (err) {
      console.error('Failed to get AI explanation', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading commit diffs...</div>;
  }

  if (!commit) {
    return <div className="py-12 text-center text-red-400">Commit details not found.</div>;
  }

  const totalAdditions = diffs.reduce((acc, d) => acc + d.additions, 0);
  const totalDeletions = diffs.reduce((acc, d) => acc + d.deletions, 0);

  return (
    <div className="space-y-6">
      {/* Header & Commit summary card */}
      <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/${params.owner}/${params.repo}/commits`}
              className="p-1.5 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-white leading-tight font-mono">{commit.message}</h1>
          </div>

          {/* AI Explain Button */}
          <button
            onClick={handleExplainWithAi}
            className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-3.5 py-1.5 rounded-lg font-bold hover:brightness-110 shadow-md shadow-indigo-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Explain with AI</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">{commit.authorName}</span>
            <span>committed on {new Date(commit.date).toLocaleString()}</span>
          </div>
          <div className="font-mono text-sky-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg select-all">
            commit {commit.sha}
          </div>
        </div>
      </div>

      {/* AI Explanation Banner Card */}
      {showAiCard && (
        <div className="bg-gradient-to-br from-slate-900 via-[#121722] to-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white text-sm">AI Commit Analysis & Code Review</span>
            </div>
            {aiExplanation && (
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  aiExplanation.impactLevel === 'high'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : aiExplanation.impactLevel === 'medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {aiExplanation.impactLevel} impact
              </span>
            )}
          </div>

          {aiLoading ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Analyzing diffs and generating natural language summary...</p>
            </div>
          ) : aiExplanation ? (
            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed text-slate-200 font-medium">{aiExplanation.summary}</p>

              <div>
                <span className="font-bold text-white block mb-1.5">Key File Changes:</span>
                <ul className="space-y-1 pl-4 list-disc text-slate-300">
                  {aiExplanation.keyChanges.map((change: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: change.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                  ))}
                </ul>
              </div>

              {aiExplanation.suggestions && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="font-bold text-sky-400 block mb-1.5 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Reviewer Checkpoints:</span>
                  </span>
                  <ul className="space-y-1 pl-4 list-disc text-slate-400">
                    {aiExplanation.suggestions.map((sug: string, i: number) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Diffs Summary Bar */}
      <div className="flex items-center justify-between text-sm text-slate-300 px-1">
        <span className="font-semibold">Showing {diffs.length} changed files</span>
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="text-emerald-400 font-bold">+{totalAdditions} additions</span>
          <span className="text-red-400 font-bold">-{totalDeletions} deletions</span>
        </div>
      </div>

      {/* Structured Diff Viewer */}
      <DiffViewer diffs={diffs} />
    </div>
  );
}
