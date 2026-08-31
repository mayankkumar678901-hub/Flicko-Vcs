'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, Repository, TreeItem } from '@/lib/api';
import BranchSelector from '@/components/BranchSelector';
import FileTree from '@/components/FileTree';
import ReadmeViewer from '@/components/ReadmeViewer';
import LivePreviewModal from '@/components/LivePreviewModal';
import { GitCommit, GitBranch, Plus, FileCode, Clock, Play, Sparkles } from 'lucide-react';

export default function RepoRootPage({ params }: { params: { owner: string; repo: string } }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'main';

  const [repoData, setRepoData] = useState<Repository | null>(null);
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWebPreview, setHasWebPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    async function loadRepo() {
      try {
        setLoading(true);
        const [repoRes, branchRes, treeRes] = await Promise.all([
          api.get(`/repos/${params.owner}/${params.repo}`),
          api.get(`/git/${params.owner}/${params.repo}/branches`),
          api.get(`/git/${params.owner}/${params.repo}/tree?ref=${ref}`),
        ]);

        setRepoData(repoRes.data.repo);
        setBranches(branchRes.data.branches.all);
        setTree(treeRes.data.tree);

        // Check if repo has HTML files to enable Live Preview
        const hasHtml = treeRes.data.tree.some((item: TreeItem) =>
          item.name.toLowerCase().endsWith('.html')
        );
        setHasWebPreview(hasHtml);

        // Check if README.md exists in root
        const readmeItem = treeRes.data.tree.find(
          (item: TreeItem) => item.name.toLowerCase() === 'readme.md'
        );
        if (readmeItem) {
          const blobRes = await api.get(
            `/git/${params.owner}/${params.repo}/blob?ref=${ref}&path=${readmeItem.name}`
          );
          setReadme(blobRes.data.content);
        } else {
          setReadme(null);
        }
      } catch (err) {
        console.error('Failed to load repo data', err);
      } finally {
        setLoading(false);
      }
    }

    loadRepo();
  }, [params.owner, params.repo, ref]);

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading repository...</div>;
  }

  if (!repoData) {
    return <div className="py-12 text-center text-red-400">Repository not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Repo Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5 text-lg">
            <Link href={`/${params.owner}/${params.repo}`} className="text-sky-400 font-bold hover:underline">
              {params.owner} / {params.repo}
            </Link>
            <span className="text-xs border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 rounded-full text-slate-300 capitalize font-medium">
              {repoData.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">{repoData.description || 'No description provided.'}</p>
        </div>

        <div className="flex items-center space-x-3">
          {hasWebPreview && (
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 shadow-md shadow-emerald-500/20 transition animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Live Web Preview</span>
            </button>
          )}

          <Link
            href={`/${params.owner}/${params.repo}/edit/${ref}/new-file.txt`}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File</span>
          </Link>
        </div>
      </div>

      {/* Bar: Branch Selector & Commits Link */}
      <div className="flex items-center justify-between">
        <BranchSelector
          owner={params.owner}
          repo={params.repo}
          branches={branches}
          currentBranch={ref}
        />

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <Link
            href={`/${params.owner}/${params.repo}/branches`}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition"
          >
            <GitBranch className="w-4 h-4 text-sky-400" />
            <span>{branches.length} Branches</span>
          </Link>
          <Link
            href={`/${params.owner}/${params.repo}/commits?ref=${ref}`}
            className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg transition font-semibold"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Commit Timeline</span>
          </Link>
        </div>
      </div>

      {/* Directory File Tree */}
      <FileTree
        owner={params.owner}
        repo={params.repo}
        refName={ref}
        items={tree}
        currentPath=""
      />

      {/* README Viewer */}
      {readme && <ReadmeViewer content={readme} />}

      {/* Live Sandbox Preview Modal */}
      <LivePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        owner={params.owner}
        repo={params.repo}
        refName={ref}
        tree={tree}
      />
    </div>
  );
}
