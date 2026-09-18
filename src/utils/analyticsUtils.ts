import { Habit, HabitLog, ProductivitySummary, Task } from '../types';
import { addDays, getTodayDateString, getWeekDays } from './dateUtils';
import { isHabitCompletedForDate, isHabitScheduledForDate } from './habitUtils';

/**
 * Calculates daily productivity score with a transparent, fully documented formula:
 *
 * Formula:
 * - Task Contribution: (Completed Tasks for Today / Total Tasks for Today) * 100
 * - Habit Contribution: (Completed Habits for Today / Scheduled Habits for Today) * 100
 * - Combined Daily Score: 50% Task weight + 50% Habit weight when both exist.
 *   If only tasks exist, 100% Task weight.
 *   If only habits exist, 100% Habit weight.
 *   If no items scheduled, score is 0 with an empty day flag.
 */
export function calculateDailyProductivity(
  tasks: Task[],
  habits: Habit[],
  logs: HabitLog[],
  dateStr: string = getTodayDateString()
): ProductivitySummary {
  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const tasksTotal = dayTasks.length;
  const tasksCompleted = dayTasks.filter((t) => t.status === 'completed').length;

  const scheduledHabits = habits.filter((h) => h.isActive && isHabitScheduledForDate(h, dateStr));
  const habitsScheduled = scheduledHabits.length;
  const habitsCompleted = scheduledHabits.filter((h) => isHabitCompletedForDate(h.id, dateStr, logs)).length;

  const taskContribution = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const habitContribution = habitsScheduled > 0 ? Math.round((habitsCompleted / habitsScheduled) * 100) : 0;

  let totalScore = 0;
  if (tasksTotal > 0 && habitsScheduled > 0) {
    totalScore = Math.round(taskContribution * 0.5 + habitContribution * 0.5);
  } else if (tasksTotal > 0) {
    totalScore = taskContribution;
  } else if (habitsScheduled > 0) {
    totalScore = habitContribution;
  } else {
    totalScore = 0;
  }

  return {
    taskContribution,
    habitContribution,
    totalScore,
    tasksTotal,
    tasksCompleted,
    habitsScheduled,
    habitsCompleted,
  };
}

export interface DayActivityData {
  date: string;
  dayName: string;
  shortDate: string;
  tasksTotal: number;
  tasksCompleted: number;
  habitsScheduled: number;
  habitsCompleted: number;
  productivityScore: number;
}

/**
 * Generates activity data for a given week.
 */
export function getWeeklyActivity(
  tasks: Task[],
  habits: Habit[],
  logs: HabitLog[],
  referenceDate: string = getTodayDateString(),
  startOfWeek: 0 | 1 = 1
): DayActivityData[] {
  const weekDays = getWeekDays(referenceDate, startOfWeek);

  return weekDays.map((dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    const summary = calculateDailyProductivity(tasks, habits, logs, dateStr);

    return {
      date: dateStr,
      dayName,
      shortDate,
      tasksTotal: summary.tasksTotal,
      tasksCompleted: summary.tasksCompleted,
      habitsScheduled: summary.habitsScheduled,
      habitsCompleted: summary.habitsCompleted,
      productivityScore: summary.totalScore,
    };
  });
}

/**
 * Calculates overall habits statistics.
 */
export function calculateHabitStats(habits: Habit[], logs: HabitLog[], todayStr: string = getTodayDateString()) {
  const activeHabits = habits.filter((h) => h.isActive);
  const archivedHabits = habits.filter((h) => !h.isActive);

  // Calculate completion rate over the last 30 days for each active habit
  let totalCompletionSum = 0;
  activeHabits.forEach((h) => {
    let scheduled = 0;
    let completed = 0;
    for (let i = 0; i < 30; i++) {
      const d = addDays(todayStr, -i);
      if (isHabitScheduledForDate(h, d)) {
        scheduled++;
        if (isHabitCompletedForDate(h.id, d, logs)) {
          completed++;
        }
      }
    }
    if (scheduled > 0) {
      totalCompletionSum += (completed / scheduled) * 100;
    }
  });

  const averageCompletion = activeHabits.length > 0 ? Math.round(totalCompletionSum / activeHabits.length) : 0;

  return {
    totalHabits: habits.length,
    activeCount: activeHabits.length,
    archivedCount: archivedHabits.length,
    averageCompletion,
  };
}
