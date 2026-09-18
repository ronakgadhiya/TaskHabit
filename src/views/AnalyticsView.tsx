import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Flame,
  Trophy,
  Info,
  Calendar,
  Layers,
  PieChart,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useSettings } from '../context/SettingsContext';
import { getTodayDateString } from '../utils/dateUtils';
import { calculateHabitStats, getWeeklyActivity } from '../utils/analyticsUtils';
import { calculateTaskStats } from '../utils/taskUtils';
import { calculateBestStreak, calculateCurrentStreak } from '../utils/habitUtils';
import { Card, ProgressBar } from '../components/ui/Card';
import { HabitIcon } from '../components/habits/HabitIcon';

export const AnalyticsView: React.FC = () => {
  const { tasks } = useTasks();
  const { habits, habitLogs } = useHabits();
  const { settings } = useSettings();

  const todayStr = getTodayDateString();

  const taskStats = useMemo(() => calculateTaskStats(tasks, todayStr), [tasks, todayStr]);
  const habitStats = useMemo(() => calculateHabitStats(habits, habitLogs, todayStr), [habits, habitLogs, todayStr]);

  // 7-day weekly activity
  const weeklyActivity = useMemo(
    () => getWeeklyActivity(tasks, habits, habitLogs, todayStr, settings.startOfWeek),
    [tasks, habits, habitLogs, todayStr, settings.startOfWeek]
  );

  // Category breakdown for tasks
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      const cat = t.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  // Priority breakdown
  const priorityStats = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'high').length;
    const medium = tasks.filter((t) => t.priority === 'medium').length;
    const low = tasks.filter((t) => t.priority === 'low').length;
    return { high, medium, low };
  }, [tasks]);

  // Ranked habits by streak
  const rankedHabits = useMemo(() => {
    return habits
      .filter((h) => h.isActive)
      .map((h) => ({
        habit: h,
        currentStreak: calculateCurrentStreak(h, habitLogs),
        bestStreak: calculateBestStreak(h, habitLogs),
      }))
      .sort((a, b) => b.currentStreak - a.currentStreak || b.bestStreak - a.bestStreak);
  }, [habits, habitLogs]);

  // Average weekly productivity score
  const avgWeeklyScore = useMemo(() => {
    if (weeklyActivity.length === 0) return 0;
    const sum = weeklyActivity.reduce((acc, curr) => acc + curr.productivityScore, 0);
    return Math.round(sum / weeklyActivity.length);
  }, [weeklyActivity]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Real, transparent productivity data calculated exclusively from your local activity.
        </p>
      </div>

      {/* Top 4 KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Weekly Average</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {avgWeeklyScore}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Productivity over 7 days</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {taskStats.completionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {taskStats.completed} of {taskStats.total} completed
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Habit Execution</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {habitStats.averageCompletion}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">30-day consistency rate</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Active Habits</span>
            <Trophy className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {habitStats.activeCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Routines currently tracked</p>
        </Card>
      </div>

      {/* 7-Day Visual Productivity Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Weekly Activity & Productivity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily composite scores for the current week.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
            Avg: {avgWeeklyScore}%
          </span>
        </div>

        {/* CSS-based Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          {weeklyActivity.map((day) => {
            const isToday = day.date === todayStr;
            const barHeight = Math.max(8, day.productivityScore);

            return (
              <div key={day.date} className="flex flex-col items-center justify-end h-full group">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition mb-1">
                  {day.productivityScore}%
                </span>
                <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm'
                        : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-indigo-500 group-hover:to-indigo-400'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className={`text-[11px] font-semibold block ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-[9px] text-slate-400 block">{day.shortDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two columns: Streaks Leaderboard & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Streaks Leaderboard */}
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Habit Streaks Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-400">Current / Best</span>
          </div>

          {rankedHabits.length > 0 ? (
            <div className="space-y-3">
              {rankedHabits.map((item, index) => (
                <div
                  key={item.habit.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-4 text-center">
                      #{index + 1}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: item.habit.color ?? '#6366f1' }}
                    >
                      <HabitIcon name={item.habit.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.habit.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-bold">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      {item.currentStreak}d
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <Trophy className="w-3.5 h-3.5" />
                      {item.bestStreak}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No active habits found. Create a habit to start tracking streaks.
            </p>
          )}
        </Card>

        {/* Task Breakdown (Priority & Categories) */}
        <Card className="p-5 space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Task Priorities & Categories</span>
            </h3>
          </div>

          {/* Priority breakdown */}
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
              Priority Distribution
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                <span className="text-rose-600 dark:text-rose-400 font-bold block text-base">
                  {priorityStats.high}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">High</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                <span className="text-amber-600 dark:text-amber-400 font-bold block text-base">
                  {priorityStats.medium}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Medium</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-bold block text-base">
                  {priorityStats.low}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Low</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
              Tasks by Category
            </span>
            {categoryStats.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {categoryStats.map(([cat, count]) => {
                  const pct = taskStats.total > 0 ? Math.round((count / taskStats.total) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>{cat}</span>
                        <span className="font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No tasks created yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Transparent Calculation Documentation Card */}
      <Card className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              Transparent Calculation Formula
            </h4>
            <p className="leading-relaxed">
              <strong>Daily Productivity Score</strong> is computed objectively without inflated metrics:
              50% from tasks scheduled for that date (<code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">completedTasks / totalTasks</code>) + 50% from active habits scheduled for that day (<code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">completedHabits / scheduledHabits</code>). Streaks are counted exclusively across actual scheduled occurrences.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
