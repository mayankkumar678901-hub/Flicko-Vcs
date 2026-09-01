'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme, MOOD_THEMES, MoodTheme } from '@/context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, currentThemeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 transition group shadow-sm"
        title="Change Mood Theme"
      >
        <span className="text-sm">{currentThemeConfig.emoji}</span>
        <span className="hidden sm:inline group-hover:text-sky-300 transition">{currentThemeConfig.name}</span>
        <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition" />
      </button>

      {/* Mood Theme Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#121722] border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Choose Your Mood</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">7 Themes</span>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {MOOD_THEMES.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition group ${
                    isSelected
                      ? 'bg-slate-800/90 border border-sky-500/50 shadow-md'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner"
                      style={{ backgroundColor: t.previewBg }}
                    >
                      {t.emoji}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                          {t.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{t.tagline}</p>
                    </div>
                  </div>

                  {/* Color dots & check indicator */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex -space-x-1">
                      {t.previewColors.map((col, idx) => (
                        <div
                          key={idx}
                          className="w-2.5 h-2.5 rounded-full border border-slate-900"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
