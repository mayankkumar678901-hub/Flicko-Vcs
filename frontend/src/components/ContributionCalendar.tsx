'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, Zap, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface DayActivity {
  date: string;
  count: number;
  isToday: boolean;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  monthName: string; // e.g. "Aug"
  monthIndex: number; // 0-11
}

export default function ContributionCalendar({ username }: { username?: string }) {
  const [activities, setActivities] = useState<{ [dateStr: string]: number }>({});
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate 20 weeks (140 days) of calendar history
  const generateDays = (): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const totalDays = 20 * 7; // 20 weeks = 140 days
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activities[dateStr] || 0;
      days.push({
        date: dateStr,
        count,
        isToday: dateStr === todayStr,
        dayOfWeek: d.getDay(),
        monthName: monthNames[d.getMonth()],
        monthIndex: d.getMonth(),
      });
    }
    return days;
  };

  const days = generateDays();

  // Group into 20 columns of 7 days (weeks)
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Determine which month starts on each week column for the Month Header
  const weekMonthHeaders: { text: string; colIndex: number }[] = [];
  let lastMonth = '';
  weeks.forEach((week, wIdx) => {
    const firstDayMonth = week[0]?.monthName;
    if (firstDayMonth && firstDayMonth !== lastMonth) {
      weekMonthHeaders.push({ text: firstDayMonth, colIndex: wIdx });
      lastMonth = firstDayMonth;
    }
  });

  // Calculate Monthly Breakdown stats
  const monthlyStats: { [month: string]: number } = {};
  days.forEach((day) => {
    monthlyStats[day.monthName] = (monthlyStats[day.monthName] || 0) + (day.count > 0 ? day.count : 0);
  });

  // Calculate Streaks
  const calculateStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    let isCurrentStreakActive = Boolean(activities[todayStr]);

    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      if (activities[str] && activities[str] > 0) {
        if (isCurrentStreakActive) currentStreak++;
      } else {
        if (i === 0) continue;
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

  const getColorClass = (count: number, isToday: boolean, monthName: string) => {
    if (selectedMonth !== 'all' && selectedMonth !== monthName) {
      return 'bg-slate-900/40 opacity-30';
    }
    if (count >= 5) return 'bg-emerald-400 shadow-sm shadow-emerald-400/40';
    if (count >= 3) return 'bg-emerald-500';
    if (count >= 2) return 'bg-emerald-600';
    if (count >= 1) return 'bg-emerald-800/90';
    if (isToday) return 'bg-slate-700 border border-emerald-500/50 animate-pulse';
    return 'bg-slate-800/60 hover:bg-slate-700/80';
  };

  return (
    <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header & Streak Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Monthly Progress & Login Activity Tracker</h3>
            <p className="text-[11px] text-slate-400">Track your daily logins and repository activity by month</p>
          </div>
        </div>

        {/* Streak & Active Days Badges */}
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

      {/* Month Name Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] flex items-center space-x-1 pr-1">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Months:</span>
        </span>
        <button
          onClick={() => setSelectedMonth('all')}
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
            selectedMonth === 'all'
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Months
        </button>
        {Object.keys(monthlyStats).map((mName) => (
          <button
            key={mName}
            onClick={() => setSelectedMonth(mName === selectedMonth ? 'all' : mName)}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition flex items-center space-x-1 ${
              selectedMonth === mName
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{mName}</span>
            {monthlyStats[mName] > 0 && (
              <span className="text-[10px] bg-black/30 px-1.5 rounded-full font-mono font-bold">
                {monthlyStats[mName]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Interactive Calendar Heatmap Grid with Month Names */}
      <div className="space-y-1">
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-[620px]">
            {/* Month Names Labels Row */}
            <div className="flex text-[11px] font-mono text-slate-400 mb-1.5 pl-7">
              {weeks.map((week, wIdx) => {
                const header = weekMonthHeaders.find((h) => h.colIndex === wIdx);
                return (
                  <div key={wIdx} className="w-4 mr-1 text-center font-bold text-sky-300 truncate">
                    {header ? header.text : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid with Day of Week labels (Mon, Wed, Fri) */}
            <div className="flex">
              {/* Day Labels on left */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 pr-2 select-none h-[110px] py-0.5">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* 20 Columns of Weeks */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer ${getColorClass(
                          day.count,
                          day.isToday,
                          day.monthName
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            {hoveredDay ? (
              <span className="text-emerald-300 font-mono font-medium">
                📅 {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}: <strong>{hoveredDay.count} logins / activities</strong>
              </span>
            ) : (
              <span className="text-slate-500 font-mono">Hover over any day square or click a month name above to highlight</span>
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
