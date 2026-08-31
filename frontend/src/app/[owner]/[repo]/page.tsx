'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, Repository, TreeItem, User, CommitItem } from '@/lib/api';
import BranchSelector from '@/components/BranchSelector';
import FileTree from '@/components/FileTree';
import ReadmeViewer from '@/components/ReadmeViewer';
import LivePreviewModal from '@/components/LivePreviewModal';
import TimeTravelSlider from '@/components/TimeTravelSlider';
import SlidingFileDrawer from '@/components/SlidingFileDrawer';
import { GitCommit, GitBranch, Plus, FileCode, Clock, Play, Sparkles, Lock, ShieldAlert } from 'lucide-react';

export default function RepoRootPage({ params }: { params: { owner: string; repo: string } }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'main';

  const [repoData, setRepoData] = useState<Repository | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [activeRef, setActiveRef] = useState<string>(ref);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWebPreview, setHasWebPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Sliding Drawer State
  const [drawerFilePath, setDrawerFilePath] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setActiveRef(ref);
    loadRepo(ref);
  }, [params.owner, params.repo, ref]);

  const loadRepo = async (currentRef: string) => {
    try {
      setLoading(true);
      const [repoRes, branchRes, treeRes, commitsRes] = await Promise.all([
        api.get(`/repos/${params.owner}/${params.repo}`),
        api.get(`/git/${params.owner}/${params.repo}/branches`),
        api.get(`/git/${params.owner}/${params.repo}/tree?ref=${currentRef}`),
        api.get(`/git/${params.owner}/${params.repo}/commits?ref=${currentRef}`).catch(() => ({ data: { commits: [] } })),
      ]);

      setRepoData(repoRes.data.repo);
      setBranches(branchRes.data.branches.all);
      setTree(treeRes.data.tree);
      setCommits(commitsRes.data.commits || []);

      // Fetch logged in user to check permissions
      const token = localStorage.getItem('vcs_token');
      if (token) {
        try {
          const meRes = await api.get('/auth/me');
          setCurrentUser(meRes.data.user);
        } catch {
          setCurrentUser(null);
        }
      }

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
          `/git/${params.owner}/${params.repo}/blob?ref=${currentRef}&path=${readmeItem.name}`
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
  };

  // Time Travel Handler
  const handleTimeTravelCommit = async (sha: string) => {
    setActiveRef(sha);
    try {
      const treeRes = await api.get(`/git/${params.owner}/${params.repo}/tree?ref=${sha}`);
      setTree(treeRes.data.tree);

      const hasHtml = treeRes.data.tree.some((item: TreeItem) =>
        item.name.toLowerCase().endsWith('.html')
      );
      setHasWebPreview(hasHtml);

      const readmeItem = treeRes.data.tree.find(
        (item: TreeItem) => item.name.toLowerCase() === 'readme.md'
      );
      if (readmeItem) {
        const blobRes = await api.get(
          `/git/${params.owner}/${params.repo}/blob?ref=${sha}&path=${readmeItem.name}`
        );
        setReadme(blobRes.data.content);
      } else {
        setReadme(null);
      }
    } catch (err) {
      console.error('Time travel fetch failed', err);
    }
  };

  const handleOpenDrawer = (filePath: string) => {
    setDrawerFilePath(filePath);
    setIsDrawerOpen(true);
  };

  if (loading && !tree.length) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading repository...</div>;
  }

  if (!repoData) {
    return <div className="py-12 text-center text-red-400">Repository not found.</div>;
  }

  const isOwner = currentUser && repoData.owner.id === currentUser.id;

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
            {!isOwner && (
              <span className="text-[11px] border border-amber-500/30 bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center space-x-1 font-semibold">
                <Lock className="w-3 h-3" />
                <span>Read-Only</span>
              </span>
            )}
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

          {isOwner ? (
            <Link
              href={`/${params.owner}/${params.repo}/edit/${ref}/new-file.txt`}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File</span>
            </Link>
          ) : (
            <span
              className="flex items-center space-x-1 bg-slate-900 border border-slate-800 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed"
              title="Only repository owner can add or edit files"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only Access</span>
            </span>
          )}
        </div>
      </div>

      {/* Time-Travel Commit History Slider */}
      {commits.length > 1 && (
        <TimeTravelSlider
          commits={commits}
          selectedSha={activeRef}
          onSelectCommit={handleTimeTravelCommit}
        />
      )}

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
        refName={activeRef}
        items={tree}
        currentPath=""
        onPreviewFile={handleOpenDrawer}
      />

      {/* README Viewer */}
      {readme && <ReadmeViewer content={readme} />}

      {/* Live Sandbox Preview Modal */}
      <LivePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        owner={params.owner}
        repo={params.repo}
        refName={activeRef}
        tree={tree}
      />

      {/* Sliding Window File Drawer */}
      <SlidingFileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        owner={params.owner}
        repo={params.repo}
        refName={activeRef}
        filePath={drawerFilePath}
      />
    </div>
  );
}
