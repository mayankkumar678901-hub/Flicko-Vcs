'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Repository, TreeItem, User, CommitItem } from '@/lib/api';
import BranchSelector from '@/components/BranchSelector';
import FileTree from '@/components/FileTree';
import ReadmeViewer from '@/components/ReadmeViewer';
import LivePreviewModal from '@/components/LivePreviewModal';
import TimeTravelSlider from '@/components/TimeTravelSlider';
import SlidingFileDrawer from '@/components/SlidingFileDrawer';
import { GitCommit, GitBranch, Plus, FileCode, Clock, Play, Sparkles, Lock, Trash2, AlertTriangle, X, LogIn } from 'lucide-react';

export default function RepoRootPage({ params }: { params: { owner: string; repo: string } }) {
  const router = useRouter();
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

  // Delete Repo Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleDeleteRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmName !== params.repo) {
      setDeleteError(`Please type "${params.repo}" to confirm deletion.`);
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/repos/${params.owner}/${params.repo}`);
      window.location.href = '/';
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Failed to delete repository');
      setDeleting(false);
    }
  };

  if (loading && !tree.length) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading repository...</div>;
  }

  if (!repoData) {
    return <div className="py-12 text-center text-red-400">Repository not found.</div>;
  }

  // Owner check (by ID or case-insensitive username)
  const isOwner = Boolean(
    currentUser && (
      (repoData.owner && currentUser.id === repoData.owner.id) ||
      (currentUser.username && currentUser.username.toLowerCase() === params.owner.toLowerCase())
    )
  );

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
            {!isOwner && currentUser && (
              <span className="text-[11px] border border-amber-500/30 bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center space-x-1 font-semibold">
                <Lock className="w-3 h-3" />
                <span>Read-Only Mode</span>
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

          {/* Add File / Sign In Controls */}
          {isOwner ? (
            <>
              <Link
                href={`/${params.owner}/${params.repo}/edit/${ref}/new-file.txt`}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:brightness-110 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add File</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 bg-slate-800/80 hover:bg-red-950/60 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 rounded-lg text-xs transition"
                title="Delete Repository"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : !currentUser ? (
            <Link
              href="/login"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-sky-500/20 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in to Edit & Add Files</span>
            </Link>
          ) : (
            <span
              className="flex items-center space-x-1 bg-slate-900 border border-slate-800 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed"
              title="Only the owner of this repository can add or edit files"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only</span>
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

      {/* Delete Repository Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-red-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Delete Repository</span>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError('');
                  setConfirmName('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-lg">
                {deleteError}
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                Are you sure you want to permanently delete <strong className="text-white font-mono">{params.repo}</strong>?
              </p>
              <p className="text-slate-400">
                This will delete all files, commit history, and branches associated with this repository. This action cannot be undone.
              </p>
            </div>

            <form onSubmit={handleDeleteRepo} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Type <strong className="text-white font-mono">{params.repo}</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={params.repo}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white p-2 rounded-lg text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || confirmName !== params.repo}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
