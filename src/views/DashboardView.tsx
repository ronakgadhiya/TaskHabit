import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useToast } from '../context/ToastContext';
import {
  formatFullDate,
  formatFriendlyDate,
  getTodayDateString,
  addDays,
} from '../utils/dateUtils';
import { calculateDailyProductivity } from '../utils/analyticsUtils';
import { isHabitCompletedForDate, isHabitScheduledForDate, calculateCurrentStreak } from '../utils/habitUtils';
import { Card, EmptyState, ProgressBar } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { HabitIcon } from '../components/habits/HabitIcon';
import { Task } from '../types';

export const DashboardView: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, editTask, removeTask } = useTasks();
  const { habits, habitLogs, toggleHabitCompletion } = useHabits();
  const { showToast } = useToast();

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const todayStr = getTodayDateString();
  const todayDateFormatted = formatFullDate(todayStr);

  // Filter tasks
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completed');
  const upcomingTasks = tasks.filter((t) => t.dueDate && t.dueDate > todayStr && t.status !== 'completed').slice(0, 4);

  // Filter habits for today
  const activeHabits = habits.filter((h) => h.isActive);
  const scheduledHabitsToday = activeHabits.filter((h) => isHabitScheduledForDate(h, todayStr));

  // Productivity calculation
  const productivity = calculateDailyProductivity(tasks, habits, habitLogs, todayStr);

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = quickTaskTitle.trim();
    if (!title) return;

    addTask({
      title,
      dueDate: todayStr,
      priority: 'medium',
      status: 'pending',
    });

    setQuickTaskTitle('');
    showToast('Task added for today', 'success');
  };

  const handleToggleHabit = (habitId: string) => {
    const done = toggleHabitCompletion(habitId, todayStr);
    const habit = habits.find((h) => h.id === habitId);
    showToast(
      done ? `Great job! "${habit?.name}" completed today.` : `"${habit?.name}" marked incomplete.`,
      done ? 'success' : 'info'
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Date Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            Today's Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {todayDateFormatted}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Task</span>
          </Button>
          <Link to="/habits">
            <Button variant="outline" size="sm">
              <Flame className="w-4 h-4 mr-1.5 text-amber-500" />
              <span>Habits</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue Tasks Alert if any */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                You have {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                Action pending items from earlier days to keep your slate clean.
              </p>
            </div>
          </div>
          <Link to="/tasks?filter=overdue">
            <Button variant="danger" size="sm">
              Review
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Productivity Score */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span>Daily Productivity</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {productivity.totalScore}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">score today</span>
            </div>
            <ProgressBar
              value={productivity.totalScore}
              colorClass="bg-gradient-to-r from-indigo-500 to-emerald-500"
              showPercentage={false}
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 leading-normal">
            Balanced 50% task completion + 50% habit execution formula.
          </p>
        </Card>

        {/* Tasks Today */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span>Today's Tasks</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {productivity.tasksCompleted}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                of {productivity.tasksTotal} completed
              </span>
            </div>
            <ProgressBar
              value={productivity.taskContribution}
              colorClass="bg-emerald-500"
              showPercentage={false}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
            <span>{productivity.tasksTotal - productivity.tasksCompleted} remaining</span>
            <Link to="/tasks" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Habits Today */}
        <Card className="flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span>Habit Consistency</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {productivity.habitsCompleted}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                of {productivity.habitsScheduled} rituals checked
              </span>
            </div>
            <ProgressBar
              value={productivity.habitContribution}
              colorClass="bg-amber-500"
              showPercentage={false}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
            <span>{productivity.habitsScheduled - productivity.habitsCompleted} pending</span>
            <Link to="/habits" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>Manage habits</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Task Inline Input Bar */}
      <form
        onSubmit={handleQuickTaskSubmit}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <div className="pl-2.5 text-slate-400">
          <Plus className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={quickTaskTitle}
          onChange={(e) => setQuickTaskTitle(e.target.value)}
          placeholder="Add a quick task for today... (press Enter)"
          className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!quickTaskTitle.trim()}
          className="rounded-xl"
        >
          Add
        </Button>
      </form>

      {/* Two Column Layout: Today's Tasks & Today's Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Tasks for Today</span>
              <span className="text-xs font-normal text-slate-500">({todayTasks.length})</span>
            </h2>
            <Link to="/tasks" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Go to Tasks
            </Link>
          </div>

          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskStatus}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDelete={(id) => {
                    removeTask(id);
                    showToast('Task removed', 'info');
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="No tasks scheduled for today"
              description="Enjoy your free time or add a new to-do above."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Task
                </Button>
              }
            />
          )}
        </div>

        {/* Right Column: Today's Habits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Habits for Today</span>
              <span className="text-xs font-normal text-slate-500">({scheduledHabitsToday.length})</span>
            </h2>
            <Link to="/habits" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Go to Habits
            </Link>
          </div>

          {scheduledHabitsToday.length > 0 ? (
            <div className="space-y-3">
              {scheduledHabitsToday.map((habit) => {
                const isCompleted = isHabitCompletedForDate(habit.id, todayStr, habitLogs);
                const streak = calculateCurrentStreak(habit, habitLogs);

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: habit.color ?? '#6366f1' }}
                      >
                        <HabitIcon name={habit.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {habit.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                            <Flame className="w-3.5 h-3.5" />
                            {streak}d
                          </span>
                          <span>•</span>
                          <span>Target: {habit.target ?? 1} {habit.targetUnit ?? 'times'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-slate-300 dark:text-slate-600 hover:text-emerald-500'
                      }`}
                      aria-label={`Toggle ${habit.name}`}
                    >
                      {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Check className="w-4 h-4 opacity-40 hover:opacity-100" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Flame className="w-8 h-8" />}
              title="No habits scheduled for today"
              description="Build routines that repeat daily or on specific days."
              action={
                <Link to="/habits">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Habit
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Upcoming Tasks Section (Next few days) */}
      {upcomingTasks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Upcoming Tasks</span>
            </h3>
            <Link to="/tasks?filter=upcoming" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View upcoming ({upcomingTasks.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1 block">
                    {t.dueDate ? formatFriendlyDate(t.dueDate) : ''}
                  </span>
                  <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    {t.title}
                  </h5>
                </div>
                {t.category && (
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {t.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal for creation/editing */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialTask={editingTask}
        onSubmit={(taskData) => {
          if (editingTask) {
            editTask(editingTask.id, taskData);
            showToast('Task updated', 'success');
          } else {
            addTask(taskData);
            showToast('Task created', 'success');
          }
        }}
      />
    </div>
  );
};
