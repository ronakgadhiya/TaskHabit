import React from 'react';
import {
  Flame,
  Trophy,
  Check,
  Calendar,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { Habit, HabitLog } from '../../types';
import {
  calculateBestStreak,
  calculateCurrentStreak,
  isHabitCompletedForDate,
  isHabitScheduledForDate,
} from '../../utils/habitUtils';
import { addDays, getTodayDateString } from '../../utils/dateUtils';
import { HabitIcon } from './HabitIcon';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onToggleToday: (habitId: string) => void;
  onOpenHistory: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onToggleArchive: (habitId: string, currentActive: boolean) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  logs,
  onToggleToday,
  onOpenHistory,
  onEdit,
  onDelete,
  onToggleArchive,
}) => {
  const today = getTodayDateString();
  const isScheduledToday = isHabitScheduledForDate(habit, today);
  const isCompletedToday = isHabitCompletedForDate(habit.id, today, logs);

  const currentStreak = calculateCurrentStreak(habit, logs);
  const bestStreak = calculateBestStreak(habit, logs);

  // Past 7 days preview (ending today)
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, -(6 - i));
    const isSched = isHabitScheduledForDate(habit, d);
    const isDone = isHabitCompletedForDate(habit.id, d, logs);
    const dayLabel = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
    return {
      date: d,
      isSched,
      isDone,
      dayLabel,
      isToday: d === today,
    };
  });

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-150 ${
        !habit.isActive
          ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div>
        {/* Top bar: Icon, Name, Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: habit.color ?? '#6366f1' }}
            >
              <HabitIcon name={habit.icon} className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {habit.name}
                </h3>
                {!habit.isActive && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {habit.frequency} • Target: {habit.target ?? 1} {habit.targetUnit ?? 'times'}
              </p>
            </div>
          </div>

          {/* Habit action buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onOpenHistory(habit)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="View month history"
              aria-label={`View history for ${habit.name}`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(habit)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Edit habit"
              aria-label={`Edit ${habit.name}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleArchive(habit.id, habit.isActive)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={habit.isActive ? 'Archive habit' : 'Restore habit'}
              aria-label={habit.isActive ? 'Archive habit' : 'Restore habit'}
            >
              {habit.isActive ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Delete habit"
              aria-label={`Delete ${habit.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Description */}
        {habit.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
            {habit.description}
          </p>
        )}

        {/* Streaks row */}
        <div className="flex items-center gap-4 py-2 border-y border-slate-100 dark:border-slate-800/80 mb-3">
          <div className="flex items-center gap-1.5">
            <Flame
              className={`w-4 h-4 ${
                currentStreak > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentStreak}
            </span>
            <span className="text-[11px] text-slate-400">day streak</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {bestStreak}
            </span>
            <span className="text-[11px] text-slate-400">best</span>
          </div>
        </div>

        {/* 7-day mini visual consistency dots */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-1">
            {past7Days.map((day) => {
              let dotBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
              if (!day.isSched) {
                dotBg = 'bg-transparent text-slate-300 dark:text-slate-700';
              } else if (day.isDone) {
                dotBg = 'bg-emerald-500 text-white font-bold shadow-2xs';
              }

              return (
                <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-slate-400 font-medium">{day.dayLabel}</span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${dotBg} ${
                      day.isToday ? 'ring-2 ring-indigo-500/50' : ''
                    }`}
                    title={`${day.date}: ${
                      !day.isSched ? 'Not scheduled' : day.isDone ? 'Completed' : 'Not completed'
                    }`}
                  >
                    {day.isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive completion action for Today */}
      {habit.isActive && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {isScheduledToday ? (
            <button
              onClick={() => onToggleToday(habit.id)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                isCompletedToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isCompletedToday ? 'Completed Today!' : 'Check In for Today'}</span>
            </button>
          ) : (
            <div className="py-2 text-center text-xs text-slate-400 italic">
              Not scheduled for today
            </div>
          )}
        </div>
      )}
    </div>
  );
};
