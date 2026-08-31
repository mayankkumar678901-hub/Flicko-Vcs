'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, GitCommit, ChevronRight, Sparkles } from 'lucide-react';
import { CommitItem } from '@/lib/api';

interface TimeTravelSliderProps {
  commits: CommitItem[];
  selectedSha: string;
  onSelectCommit: (sha: string) => void;
}

export default function TimeTravelSlider({
  commits,
  selectedSha,
  onSelectCommit,
}: TimeTravelSliderProps) {
  // Sort chronological order (oldest to newest for slider)
  const chronological = [...commits].reverse();
  const total = chronological.length;

  const getIndex = () => {
    const idx = chronological.findIndex((c) => c.sha === selectedSha);
    return idx >= 0 ? idx : total - 1;
  };

  const [currentIndex, setCurrentIndex] = useState(getIndex());
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentIndex(getIndex());
  }, [selectedSha, commits]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= total - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          onSelectCommit(chronological[next].sha);
          return next;
        });
      }, 1200);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, total, chronological, onSelectCommit]);

  if (total <= 1) return null;

  const currentCommit = chronological[currentIndex] || chronological[total - 1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCurrentIndex(val);
    if (chronological[val]) {
      onSelectCommit(chronological[val].sha);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    const lastIdx = total - 1;
    setCurrentIndex(lastIdx);
    onSelectCommit(chronological[lastIdx].sha);
  };

  const handleTogglePlay = () => {
    if (currentIndex >= total - 1) {
      setCurrentIndex(0);
      onSelectCommit(chronological[0].sha);
    }
    setIsPlaying(!isPlaying);
  };

  const percent = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#121722] to-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 shadow-xl space-y-3">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Time-Travel History Slider</span>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-semibold text-[11px]">
            Snapshot {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Current Commit Details badge */}
        <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-emerald-400 font-bold">{currentCommit.shortSha}</span>
          <span className="text-slate-500">•</span>
          <span className="truncate max-w-[200px] sm:max-w-[260px] text-white font-medium">
            {currentCommit.message}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-slate-400">{new Date(currentCommit.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="flex items-center space-x-4 pt-1">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`p-2 rounded-lg text-white font-bold transition flex items-center justify-center shadow-md ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
          }`}
          title={isPlaying ? 'Pause Time Travel' : 'Auto-Play History'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
        </button>

        {/* Custom Range Slider */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={total - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #6366f1 ${percent}%, #1e293b ${percent}%)`,
            }}
          />
        </div>

        {/* Jump to Latest / Reset */}
        <button
          onClick={handleReset}
          disabled={currentIndex === total - 1}
          className="flex items-center space-x-1 text-xs bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition"
          title="Jump to Latest Commit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Latest</span>
        </button>
      </div>
    </div>
  );
}
