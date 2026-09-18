import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Minus, Circle, Flame, Trophy, Percent } from 'lucide-react';
import { Habit, HabitLog } from '../../types';
import { calculateBestStreak, calculateCompletionRate, calculateCurrentStreak, isHabitCompletedForDate, isHabitScheduledForDate } from '../../utils/habitUtils';
import { Modal } from '../ui/Modal';
import { HabitIcon } from './HabitIcon';
import { parseDateString, toDateString } from '../../utils/dateUtils';

interface HabitHistoryModalProps {
  habit: Habit | null;
  logs: HabitLog[];
  isOpen: boolean;
  onClose: () => void;
  onToggleDate?: (habitId: string, dateStr: string) => void;
}

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({
  habit,
  logs,
  isOpen,
  onClose,
  onToggleDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  if (!habit) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0 - 11

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Compute stats
  const currentStreak = calculateCurrentStreak(habit, logs);
  const bestStreak = calculateBestStreak(habit, logs);
  const completionRate = calculateCompletionRate(habit, logs, 30);

  // Generate days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Day of week for 1st day (0 = Sunday, 1 = Monday). Let's use Monday as first day of week:
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const todayStr = toDateString(new Date());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${habit.name} History`} maxWidth="md">
      <div className="flex flex-col gap-4">
        {/* Habit quick summary header */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: habit.color ?? '#6366f1' }}
            >
              <HabitIcon name={habit.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {habit.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {habit.frequency} habit • Target: {habit.target ?? 1} {habit.targetUnit ?? 'times'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
              <span>{currentStreak}d</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-4 h-4" />
              <span>{bestStreak}d</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Percent className="w-3.5 h-3.5" />
              <span>{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{monthName}</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 rounded-xl" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateStr = toDateString(dateObj);
            const isToday = dateStr === todayStr;
            const isScheduled = isHabitScheduledForDate(habit, dateStr);
            const isCompleted = isHabitCompletedForDate(habit.id, dateStr, logs);
            const isFuture = dateStr > todayStr;

            let cellBg = 'bg-slate-50 dark:bg-slate-800/40 text-slate-400';
            let iconElement = null;

            if (!isScheduled) {
              cellBg = 'bg-transparent text-slate-300 dark:text-slate-600';
              iconElement = <Minus className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
            } else if (isCompleted) {
              cellBg = 'bg-emerald-500 text-white font-semibold shadow-xs';
              iconElement = <Check className="w-3.5 h-3.5 text-white stroke-[3]" />;
            } else if (isFuture) {
              cellBg = 'border border-dashed border-slate-200 dark:border-slate-800 text-slate-400';
              iconElement = <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
            } else {
              // Missed/scheduled in past
              cellBg = 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50';
              iconElement = <Circle className="w-3 h-3 text-rose-400" />;
            }

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (onToggleDate && !isFuture && isScheduled) {
                    onToggleDate(habit.id, dateStr);
                  }
                }}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all ${cellBg} ${
                  isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                } ${
                  !isFuture && isScheduled && onToggleDate
                    ? 'cursor-pointer hover:opacity-90 active:scale-95'
                    : ''
                }`}
                title={`${dateStr}: ${
                  !isScheduled
                    ? 'Not scheduled'
                    : isCompleted
                    ? 'Completed'
                    : isFuture
                    ? 'Scheduled'
                    : 'Missed (click to toggle)'
                }`}
              >
                <span className="text-[11px] leading-none mb-0.5">{dayNum}</span>
                <div>{iconElement}</div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
              <Circle className="w-2.5 h-2.5 text-rose-500" />
            </div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
              <Minus className="w-2.5 h-2.5 text-slate-400" />
            </div>
            <span>Not scheduled</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
