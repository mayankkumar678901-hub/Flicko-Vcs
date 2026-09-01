'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function SimpleCalendar({ username }: { username?: string }) {
  const [mounted, setMounted] = useState(false);
  const [activities, setActivities] = useState<{ [dateStr: string]: number }>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!mounted) {
    return (
      <div className="bg-[#121722] border border-slate-800 rounded-xl p-4 shadow-xl max-w-lg mx-auto text-center text-slate-500 text-xs">
        Loading calendar...
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current viewing month
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current viewing month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Previous Month & Next Month Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate login streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      if (activities[str] && activities[str] > 0) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return Math.max(streak, 1);
  };

  const streak = calculateStreak();

  // Generate day grid cells (with padding for first day)
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); // Empty placeholder for previous month days
  }
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      dateStr,
      isToday: dateStr === todayStr,
      hasLoggedIn: Boolean(activities[dateStr] && activities[dateStr] > 0),
    });
  }

  return (
    <div className="bg-[#121722] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl max-w-lg mx-auto space-y-3">
      {/* Header with Navigation & Streak */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Flame className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm flex items-center space-x-1.5">
              <span>{monthNames[month]} {year}</span>
            </h3>
            <p className="text-[10px] text-slate-400">Daily Login Progress</p>
          </div>
        </div>

        {/* Month Switcher & Streak Badge */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-lg text-orange-300 font-bold text-[11px]">
            <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
            <span>{streak}d Streak</span>
          </div>

          <div className="flex items-center space-x-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 hover:text-sky-300"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Columns (Sun - Sat) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[11px] font-semibold text-slate-400 pb-0.5">
        {dayNames.map((d) => (
          <div key={d} className="py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid (Compact Blocks) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-7 sm:h-8 rounded-lg" />;
          }

          return (
            <div
              key={cell.dateStr}
              className={`h-7 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[11px] font-semibold transition shadow-sm ${
                cell.hasLoggedIn
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20'
                  : cell.isToday
                  ? 'bg-slate-800 border border-sky-400 text-sky-300 font-bold'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-slate-800/80'
              }`}
              title={cell.hasLoggedIn ? `Logged in on ${cell.dateStr}` : cell.dateStr}
            >
              <span className="leading-none">{cell.day}</span>
              {cell.hasLoggedIn && (
                <div className="w-1 h-1 bg-white rounded-full mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Logged in</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full border border-sky-400" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
