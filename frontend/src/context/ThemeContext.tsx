'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type MoodTheme = 'midnight' | 'cyberpunk' | 'forest' | 'sunset' | 'ocean' | 'coffee' | 'light';

export interface ThemeConfig {
  id: MoodTheme;
  name: string;
  emoji: string;
  tagline: string;
  bgGradient: string;
  accentColor: string;
  previewBg: string;
  previewColors: string[];
}

export const MOOD_THEMES: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight Void',
    emoji: '🌌',
    tagline: 'Deep space focus & minimal distraction',
    bgGradient: 'theme-midnight',
    accentColor: '#38bdf8',
    previewBg: '#0a0d14',
    previewColors: ['#6366f1', '#38bdf8', '#10b981'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    emoji: '🌸',
    tagline: 'Vibrant neon pink, purple & high energy',
    bgGradient: 'theme-cyberpunk',
    accentColor: '#ec4899',
    previewBg: '#0f051d',
    previewColors: ['#ec4899', '#a855f7', '#06b6d4'],
  },
  {
    id: 'forest',
    name: 'Emerald Matrix',
    emoji: '🌲',
    tagline: 'Calm obsidian, mint green & hacker zen',
    bgGradient: 'theme-forest',
    accentColor: '#10b981',
    previewBg: '#05140d',
    previewColors: ['#10b981', '#34d399', '#059669'],
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    emoji: '🌅',
    tagline: 'Warm amber, radiant coral & evening glow',
    bgGradient: 'theme-sunset',
    accentColor: '#f97316',
    previewBg: '#180a0a',
    previewColors: ['#f97316', '#fbbf24', '#f43f5e'],
  },
  {
    id: 'ocean',
    name: 'Ocean Abyss',
    emoji: '🌊',
    tagline: 'Deep navy trench, cobalt blue & chill flow',
    bgGradient: 'theme-ocean',
    accentColor: '#0ea5e9',
    previewBg: '#04111d',
    previewColors: ['#0ea5e9', '#38bdf8', '#2563eb'],
  },
  {
    id: 'coffee',
    name: 'Cozy Mocha',
    emoji: '☕',
    tagline: 'Dark roast, warm caramel & late-night code',
    bgGradient: 'theme-coffee',
    accentColor: '#d97706',
    previewBg: '#150f0c',
    previewColors: ['#d97706', '#b45309', '#78350f'],
  },
  {
    id: 'light',
    name: 'Daylight Prism',
    emoji: '☀️',
    tagline: 'Crisp bright arctic & modern high contrast',
    bgGradient: 'theme-light',
    accentColor: '#0284c7',
    previewBg: '#f8fafc',
    previewColors: ['#0284c7', '#4f46e5', '#0f172a'],
  },
];

interface ThemeContextType {
  theme: MoodTheme;
  setTheme: (t: MoodTheme) => void;
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight',
  setTheme: () => {},
  currentThemeConfig: MOOD_THEMES[0],
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MoodTheme>('midnight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('flicko_mood_theme') as MoodTheme;
    if (saved && MOOD_THEMES.some((t) => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'midnight');
    }
  }, []);

  const setTheme = (newTheme: MoodTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('flicko_mood_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const currentThemeConfig = MOOD_THEMES.find((t) => t.id === theme) || MOOD_THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeConfig }}>
      <div className={`min-h-screen transition-colors duration-300 ${currentThemeConfig.bgGradient}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
