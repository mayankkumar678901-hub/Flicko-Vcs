'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, Smartphone, Tablet, Monitor, ExternalLink, Sparkles } from 'lucide-react';
import { api, TreeItem } from '@/lib/api';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  refName: string;
  tree: TreeItem[];
}

export default function LivePreviewModal({
  isOpen,
  onClose,
  owner,
  repo,
  refName,
  tree,
}: LivePreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [htmlSrcDoc, setHtmlSrcDoc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadSandboxApp();
    }
  }, [isOpen, owner, repo, refName]);

  const loadSandboxApp = async () => {
    setLoading(true);
    setError('');

    try {
      // Find index.html or first html file
      const htmlFile = tree.find((t) => t.name.toLowerCase().endsWith('.html'));

      if (!htmlFile) {
        setError('No HTML file found in this repository to preview.');
        setLoading(false);
        return;
      }

      // Fetch HTML content
      const htmlRes = await api.get(
        `/git/${owner}/${repo}/blob?ref=${refName}&path=${encodeURIComponent(htmlFile.path)}`
      );
      let content = htmlRes.data.content;

      // Find CSS files in tree and inline them
      const cssFiles = tree.filter((t) => t.name.toLowerCase().endsWith('.css'));
      for (const cssFile of cssFiles) {
        try {
          const cssRes = await api.get(
            `/git/${owner}/${repo}/blob?ref=${refName}&path=${encodeURIComponent(cssFile.path)}`
          );
          content = content.replace(
            new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'gi'),
            `<style>\n${cssRes.data.content}\n</style>`
          );
        } catch (e) {
          console.warn('Failed to inline css', cssFile.name);
        }
      }

      // Find JS files in tree and inline them
      const jsFiles = tree.filter((t) => t.name.toLowerCase().endsWith('.js'));
      for (const jsFile of jsFiles) {
        try {
          const jsRes = await api.get(
            `/git/${owner}/${repo}/blob?ref=${refName}&path=${encodeURIComponent(jsFile.path)}`
          );
          content = content.replace(
            new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*>\\s*<\\/script>`, 'gi'),
            `<script>\n${jsRes.data.content}\n</script>`
          );
        } catch (e) {
          console.warn('Failed to inline js', jsFile.name);
        }
      }

      setHtmlSrcDoc(content);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load preview assets');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  if (!isOpen) return null;

  const getFrameWidth = () => {
    if (device === 'mobile') return 'max-w-[390px]';
    if (device === 'tablet') return 'max-w-[768px]';
    return 'max-w-full';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-[#121722] border border-slate-700/80 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="bg-[#0a0d14] px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">Live Sandbox Preview</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  {refName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Interactive live web preview for {repo}</p>
            </div>
          </div>

          {/* Device Size Selectors */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded text-xs transition flex items-center space-x-1 ${
                device === 'desktop' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded text-xs transition flex items-center space-x-1 ${
                device === 'tablet' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded text-xs transition flex items-center space-x-1 ${
                device === 'mobile' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition"
              title="Reload Preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800/80 hover:bg-red-900/60 border border-slate-700 text-slate-300 hover:text-red-300 rounded-lg transition"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sandbox Content Area */}
        <div className="flex-1 bg-[#05070a] p-4 flex items-center justify-center overflow-auto">
          {loading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-400">Compiling sandbox preview...</p>
            </div>
          ) : error ? (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-6 rounded-lg max-w-md text-center">
              <p className="text-sm font-semibold">{error}</p>
              <p className="text-xs text-slate-400 mt-2">
                Make sure your repository has an <code className="text-white">index.html</code> file.
              </p>
            </div>
          ) : (
            <div
              className={`w-full h-full ${getFrameWidth()} bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-slate-700`}
            >
              <iframe
                key={key}
                srcDoc={htmlSrcDoc}
                title="Sandbox Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
