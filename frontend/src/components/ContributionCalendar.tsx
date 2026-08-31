'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, Zap, CheckCircle2 } from 'lucide-react';

interface MonthData {
  name: string; // e.g. "August"
  year: number;
  totalDays: number;
  weeks: (DayItem | null)[][]; // 7 rows (Sun..Sat) x weeks in month
  totalActivities: number;
}

interface DayItem {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  dayOfWeek: number; // 0..6
  count: number;
  isToday: boolean;
}

export default function ContributionCalendar({ username }: { username?: string }) {
  const [activities, setActivities] = useState<{ [dateStr: string]: number }>({});
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; dayNumber: number } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const storageKey = `flicko_activity_${username || 'user'}`;
    let saved: Record<string, number> = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      saved = {};
    }

    const todayStr = new Date().toISOString().split('T')[0];
    saved[todayStr] = (saved[todayStr] || 0) + 1; // Mark today's login
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

  // Generate the last 5 full calendar months strictly aligned to their dates
  const generateMonths = (): MonthData[] => {
    const months: MonthData[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    for (let mOffset = 4; mOffset >= 0; mOffset--) {
      const d = new Date(now.getFullYear(), now.getMonth() - mOffset, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthName = fullMonthNames[monthIdx];
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

      // Build 7 rows x weeks grid strictly for this month
      const weekCols: (DayItem | null)[][] = [];
      let currentWeek: (DayItem | null)[] = new Array(7).fill(null);
      let totalActivities = 0;

      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dayDate = new Date(year, monthIdx, dayNum);
        const dayOfWeek = dayDate.getDay(); // 0 = Sun, 6 = Sat
        const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const count = activities[dateStr] || 0;
        totalActivities += count;

        currentWeek[dayOfWeek] = {
          date: dateStr,
          dayNumber: dayNum,
          dayOfWeek,
          count,
          isToday: dateStr === todayStr,
        };

        // If Saturday or last day of month, push week column and start next
        if (dayOfWeek === 6 || dayNum === daysInMonth) {
          weekCols.push(currentWeek);
          currentWeek = new Array(7).fill(null);
        }
      }

      months.push({
        name: monthName,
        year,
        totalDays: daysInMonth,
        weeks: weekCols,
        totalActivities,
      });
    }

    return months;
  };

  const months = generateMonths();

  // Calculate Streak
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

    Object.keys(activities).forEach(() => {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    });

    return {
      current: Math.max(currentStreak, 1),
      max: Math.max(maxStreak, 1),
      total: Object.keys(activities).length,
    };
  };

  const streak = calculateStreak();

  const getColorClass = (day: DayItem | null, monthName: string) => {
    if (!day) return 'bg-transparent border-transparent cursor-default';
    if (selectedMonth !== 'all' && selectedMonth !== monthName) {
      return 'bg-slate-900/40 opacity-20';
    }
    if (day.count >= 5) return 'bg-emerald-400 shadow-sm shadow-emerald-400/40';
    if (day.count >= 3) return 'bg-emerald-500';
    if (day.count >= 2) return 'bg-emerald-600';
    if (day.count >= 1) return 'bg-emerald-800/90';
    if (day.isToday) return 'bg-slate-700 border border-emerald-500/60 animate-pulse';
    return 'bg-slate-800/70 hover:bg-slate-700';
  };

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
            <p className="text-xs text-slate-400">Track your daily streak, weekly blocks, and monthly milestones</p>
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

      {/* Month Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold text-xs flex items-center space-x-1 pr-1">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Select Month:</span>
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
        {months.map((m) => (
          <button
            key={m.name}
            onClick={() => setSelectedMonth(m.name === selectedMonth ? 'all' : m.name)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedMonth === m.name
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{m.name}</span>
            {m.totalActivities > 0 && (
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
                {m.totalActivities}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Calendar Grid with Grouped Month Blocks & Week Names */}
      <div className="space-y-2">
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="inline-flex min-w-[820px] items-start">
            {/* Full Day of Week Labels on Left (Row Headers) */}
            <div className="flex flex-col justify-between text-xs font-semibold text-slate-400 pr-5 select-none h-[182px] pt-14">
              {fullDayLabels.map((dayLabel) => (
                <span key={dayLabel} className="text-[11px] font-mono leading-none">
                  {dayLabel}
                </span>
              ))}
            </div>

            {/* Individual Enclosed Month Cards with Week Names on Columns */}
            <div className="flex items-start gap-4">
              {months.map((month) => (
                <div
                  key={month.name}
                  className={`bg-[#0d111a] border rounded-xl p-3.5 flex flex-col space-y-2.5 transition shadow-lg ${
                    selectedMonth === month.name
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/40'
                      : 'border-slate-800/90'
                  }`}
                >
                  {/* Month Header Label */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs font-bold font-mono">
                    <span className="text-sky-400 font-extrabold text-xs tracking-wide">{month.name}</span>
                    <span className="text-[10px] text-slate-500">{month.totalDays} days</span>
                  </div>

                  {/* Week Names Header Row */}
                  <div className="flex gap-2 text-center text-[10px] font-mono font-bold text-slate-400 pb-0.5">
                    {month.weeks.map((_, wIdx) => (
                      <div key={wIdx} className="w-5 text-center text-slate-400 truncate">
                        W{wIdx + 1}
                      </div>
                    ))}
                  </div>

                  {/* Month's Own Date Grid (7 Rows of Day Blocks) */}
                  <div className="flex gap-2">
                    {month.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-2">
                        {week.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            onMouseEnter={() =>
                              day && setHoveredDay({ date: day.date, count: day.count, dayNumber: day.dayNumber })
                            }
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-5 h-5 rounded-md transition-all duration-150 flex items-center justify-center text-[10px] font-mono select-none ${getColorClass(
                              day,
                              month.name
                            )} ${day ? 'text-slate-300 hover:text-white font-semibold' : ''}`}
                          >
                            {day ? day.dayNumber : ''}
                          </div>
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
              <span className="text-slate-500 font-mono text-[11px]">Hover over any date block or click a month tab above</span>
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
