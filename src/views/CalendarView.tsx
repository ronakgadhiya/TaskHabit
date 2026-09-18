import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Calendar as CalendarIcon,
  Check,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import {
  addDays,
  formatFriendlyDate,
  formatFullDate,
  getTodayDateString,
  toDateString,
} from '../utils/dateUtils';
import { isHabitCompletedForDate, isHabitScheduledForDate } from '../utils/habitUtils';
import { Button } from '../components/ui/Button';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { TaskItem } from '../components/tasks/TaskItem';
import { HabitIcon } from '../components/habits/HabitIcon';
import { Task } from '../types';

export const CalendarView: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, editTask, removeTask } = useTasks();
  const { habits, habitLogs, toggleHabitCompletion } = useHabits();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Compute month cells
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Start of week: 1 (Mon) or 0 (Sun)
  const startOfWeek = settings.startOfWeek;
  let firstDayOffset = firstDay.getDay() - startOfWeek;
  if (firstDayOffset < 0) firstDayOffset += 7;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setViewDate(new Date());
    setSelectedDate(todayStr);
  };

  // Selected date's tasks and habits
  const selectedDateTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === selectedDate),
    [tasks, selectedDate]
  );

  const selectedDateHabits = useMemo(
    () => habits.filter((h) => h.isActive && isHabitScheduledForDate(h, selectedDate)),
    [habits, selectedDate]
  );

  const weekdayHeaders =
    startOfWeek === 1
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Unified schedule of deadlines, events, and habit consistency.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on large) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{monthLabel}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Habits</span>
              </div>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            {weekdayHeaders.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Month Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[72px] sm:min-h-[88px] rounded-xl bg-slate-50/40 dark:bg-slate-800/20" />
            ))}

            {/* Real Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = toDateString(dateObj);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
              const dayHabits = habits.filter((h) => h.isActive && isHabitScheduledForDate(h, dateStr));
              const dayHabitsDone = dayHabits.filter((h) => isHabitCompletedForDate(h.id, dateStr, habitLogs));

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[72px] sm:min-h-[88px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500 shadow-xs'
                      : isToday
                      ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>

                  {/* Indicator Pills */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded truncate">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        <span>{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    )}
                    {dayHabits.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded truncate">
                        <Flame className="w-2.5 h-2.5 shrink-0 text-amber-500" />
                        <span>{dayHabitsDone.length}/{dayHabits.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                  Schedule Details
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formatFriendlyDate(selectedDate)}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Task</span>
              </Button>
            </div>

            {/* Tasks for this day */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tasks ({selectedDateTasks.length})</span>
              </h4>

              {selectedDateTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskStatus}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDelete={(id) => removeTask(id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No tasks scheduled for {formatFriendlyDate(selectedDate)}.
                </p>
              )}
            </div>

            {/* Habits for this day */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Habits ({selectedDateHabits.length})</span>
              </h4>

              {selectedDateHabits.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateHabits.map((habit) => {
                    const isDone = isHabitCompletedForDate(habit.id, selectedDate, habitLogs);
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: habit.color ?? '#6366f1' }}
                          >
                            <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {habit.name}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'border border-slate-300 dark:border-slate-600 text-slate-400 hover:border-emerald-500'
                          }`}
                          aria-label={`Toggle habit ${habit.name}`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No habits scheduled for this day of week.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal with predefined selected date */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialTask={editingTask || ({ dueDate: selectedDate, priority: 'medium', status: 'pending' } as any)}
        onSubmit={(taskData) => {
          if (editingTask) {
            editTask(editingTask.id, taskData);
            showToast('Task updated', 'success');
          } else {
            addTask(taskData);
            showToast('Task scheduled', 'success');
          }
        }}
      />
    </div>
  );
};
