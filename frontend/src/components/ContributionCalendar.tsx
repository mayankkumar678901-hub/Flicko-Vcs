'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, Zap, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface DayActivity {
  date: string;
  count: number;
  isToday: boolean;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  monthName: string; // e.g. "August"
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

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fullDayLabels = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Generate 18 weeks (126 days) of calendar history
  const generateDays = (): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const totalDays = 18 * 7; // 18 weeks = 126 days
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
        monthName: fullMonthNames[d.getMonth()],
        monthIndex: d.getMonth(),
      });
    }
    return days;
  };

  const days = generateDays();

  // Group into columns of 7 days (weeks)
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

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
      return 'bg-slate-900/40 opacity-20';
    }
    if (count >= 5) return 'bg-emerald-400 shadow-sm shadow-emerald-400/40';
    if (count >= 3) return 'bg-emerald-500';
    if (count >= 2) return 'bg-emerald-600';
    if (count >= 1) return 'bg-emerald-800/90';
    if (isToday) return 'bg-slate-700 border border-emerald-500/60 animate-pulse';
    return 'bg-slate-800/60 hover:bg-slate-700/80';
  };

  // Group weeks by month for clear gaps
  const monthsGrouped: { monthName: string; weeks: DayActivity[][] }[] = [];
  weeks.forEach((week) => {
    const primaryMonth = week[0]?.monthName || 'Month';
    const existing = monthsGrouped.find((m) => m.monthName === primaryMonth);
    if (existing) {
      existing.weeks.push(week);
    } else {
      monthsGrouped.push({ monthName: primaryMonth, weeks: [week] });
    }
  });

  return (
    <div className="bg-[#121722] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      {/* Header & Streak Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Daily Login & Progress Track Calendar</h3>
            <p className="text-xs text-slate-400">Track your daily streak, attendance, and repository milestones</p>
          </div>
        </div>

        {/* Streak & Active Days Badges */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-3.5 py-1.5 rounded-xl">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            <span className="text-xs font-extrabold text-orange-300 font-mono">{streak.current} Days Streak</span>
          </div>

          <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-extrabold text-indigo-300 font-mono">{streak.total} Active Days</span>
          </div>
        </div>
      </div>

      {/* Full Month Filter Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold text-xs flex items-center space-x-1 pr-1">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Filter by Month:</span>
        </span>
        <button
          onClick={() => setSelectedMonth('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
            selectedMonth === 'all'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Months
        </button>
        {Object.keys(monthlyStats).map((mName) => (
          <button
            key={mName}
            onClick={() => setSelectedMonth(mName === selectedMonth ? 'all' : mName)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedMonth === mName
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{mName}</span>
            {monthlyStats[mName] > 0 && (
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
                {monthlyStats[mName]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Interactive Spacious Calendar Heatmap Grid */}
      <div className="space-y-2">
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="inline-flex min-w-[700px]">
            {/* Full Day of Week Labels on Left */}
            <div className="flex flex-col justify-between text-xs font-semibold text-slate-400 pr-5 select-none h-[168px] pt-8">
              {fullDayLabels.map((dayLabel) => (
                <span key={dayLabel} className="text-[11px] font-mono leading-none">
                  {dayLabel}
                </span>
              ))}
            </div>

            {/* Months Container with Clear Gaps Between Months */}
            <div className="flex items-start gap-6">
              {monthsGrouped.map((mGroup) => (
                <div key={mGroup.monthName} className="flex flex-col space-y-2">
                  {/* Full Month Name Header */}
                  <div className="text-xs font-extrabold text-sky-400 font-mono tracking-wide">
                    {mGroup.monthName}
                  </div>

                  {/* Weeks in this Month */}
                  <div className="flex gap-2">
                    {mGroup.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-2">
                        {week.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-4 h-4 rounded-md transition-all duration-150 cursor-pointer shadow-sm ${getColorClass(
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
              ))}
            </div>
          </div>
        </div>

        {/* Footer info & Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            {hoveredDay ? (
              <span className="text-emerald-300 font-mono font-bold text-xs">
                📅 {new Date(hoveredDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}: <strong className="text-white">{hoveredDay.count} logins / activities</strong>
              </span>
            ) : (
              <span className="text-slate-500 font-mono text-[11px]">Hover over any square or click a month name above to highlight</span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-slate-800" />
            <div className="w-3 h-3 rounded bg-emerald-800" />
            <div className="w-3 h-3 rounded bg-emerald-600" />
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
