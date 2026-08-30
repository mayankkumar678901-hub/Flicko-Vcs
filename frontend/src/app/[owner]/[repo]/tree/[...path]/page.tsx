'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, TreeItem } from '@/lib/api';
import FileTree from '@/components/FileTree';
import { Folder, ArrowLeft } from 'lucide-react';

export default function SubdirectoryTreePage({
  params,
}: {
  params: { owner: string; repo: string; path: string[] };
}) {
  const refName = params.path[0];
  const dirPath = params.path.slice(1).join('/');

  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/git/${params.owner}/${params.repo}/tree?ref=${refName}&path=${encodeURIComponent(dirPath)}`)
      .then((res) => setTree(res.data.tree))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.owner, params.repo, refName, dirPath]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm font-semibold text-github-text pb-2 border-b border-github-border">
        <Link href={`/${params.owner}/${params.repo}?ref=${refName}`} className="text-github-blue hover:underline">
          {params.repo}
        </Link>
        <span>/</span>
        <span className="text-white font-mono">{dirPath}</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-github-muted text-sm">Loading directory...</div>
      ) : (
        <FileTree
          owner={params.owner}
          repo={params.repo}
          refName={refName}
          items={tree}
          currentPath={dirPath}
        />
      )}
    </div>
  );
}
