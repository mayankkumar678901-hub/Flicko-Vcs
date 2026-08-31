'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, Zap, CheckCircle2 } from 'lucide-react';

interface DayActivity {
  date: string;
  count: number;
  isToday: boolean;
}

export default function ContributionCalendar({ username }: { username?: string }) {
  const [activities, setActivities] = useState<{ [dateStr: string]: number }>({});
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    // Generate or fetch login and commit activity data from localStorage/session
    const storageKey = `flicko_activity_${username || 'user'}`;
    let saved: Record<string, number> = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      saved = {};
    }

    const todayStr = new Date().toISOString().split('T')[0];
    saved[todayStr] = (saved[todayStr] || 0) + 1; // Mark today's login!
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setActivities(saved);
  }, [username]);

  // Generate past 16 weeks of calendar days
  const generateDays = (): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const totalDays = 16 * 7; // 16 weeks = 112 days
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activities[dateStr] || 0;
      days.push({
        date: dateStr,
        count,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  };

  const days = generateDays();

  // Calculate Streak
  const calculateStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    let isCurrentStreakActive = Boolean(activities[todayStr]);

    // Check backwards from today
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      if (activities[str] && activities[str] > 0) {
        if (isCurrentStreakActive) currentStreak++;
      } else {
        if (i === 0) {
          // If not logged in today yet, check yesterday
          continue;
        }
        isCurrentStreakActive = false;
      }
    }

    days.forEach((day) => {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    return {
      current: Math.max(currentStreak, 1),
      max: Math.max(maxStreak, 1),
      total: Object.keys(activities).length,
    };
  };

  const streak = calculateStreak();

  const getColorClass = (count: number, isToday: boolean) => {
    if (count >= 5) return 'bg-emerald-400 shadow-sm shadow-emerald-400/40';
    if (count >= 3) return 'bg-emerald-500';
    if (count >= 2) return 'bg-emerald-600';
    if (count >= 1) return 'bg-emerald-800/80';
    if (isToday) return 'bg-slate-700 border border-emerald-500/50 animate-pulse';
    return 'bg-slate-800/60 hover:bg-slate-700/80';
  };

  // Group into 16 columns of 7 days (weeks)
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header & Streak Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Daily Login & Activity Progress Tracker</h3>
            <p className="text-[11px] text-slate-400">Track your daily streaks and development milestones</p>
          </div>
        </div>

        {/* Streak Metrics */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-bounce" />
            <span className="text-xs font-bold text-orange-300 font-mono">{streak.current} Days Streak</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 font-mono">{streak.total} Active Days</span>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Heatmap Grid */}
      <div className="space-y-2">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[500px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer ${getColorClass(
                      day.count,
                      day.isToday
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info & Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center space-x-2">
            {hoveredDay ? (
              <span className="text-emerald-300 font-mono font-medium">
                📅 {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: <strong>{hoveredDay.count} activities</strong>
              </span>
            ) : (
              <span className="text-slate-500 font-mono">Hover over any square to view daily stats</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[10px]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
