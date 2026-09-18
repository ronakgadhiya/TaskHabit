import { Habit, HabitLog } from '../types';
import { addDays, getDayOfWeek, getTodayDateString, parseDateString, toDateString } from './dateUtils';

/**
 * Determines whether a habit is scheduled to occur on a given date (YYYY-MM-DD).
 */
export function isHabitScheduledForDate(habit: Habit, dateStr: string): boolean {
  if (!habit.isActive && habit.createdAt && dateStr > toDateString(new Date(habit.updatedAt))) {
    // If habit is archived, it's not scheduled for dates after it was archived/deactivated
    return false;
  }

  // If date is before habit creation date (by day), not scheduled
  const habitCreationDay = habit.createdAt ? toDateString(new Date(habit.createdAt)) : '2000-01-01';
  if (dateStr < habitCreationDay) {
    return false;
  }

  if (habit.frequency === 'daily') {
    return true;
  }

  // Weekly or Custom days
  const dow = getDayOfWeek(dateStr); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
    return habit.daysOfWeek.includes(dow);
  }

  return true;
}

/**
 * Checks whether a habit log exists and is marked completed on dateStr.
 */
export function isHabitCompletedForDate(habitId: string, dateStr: string, logs: HabitLog[]): boolean {
  const log = logs.find((l) => l.habitId === habitId && l.date === dateStr);
  return Boolean(log && log.completed);
}

/**
 * Calculates the current streak of scheduled occurrences completed consecutively.
 * Understands custom frequency (e.g. Mon/Wed/Fri).
 */
export function calculateCurrentStreak(
  habit: Habit,
  logs: HabitLog[],
  referenceDate: string = getTodayDateString()
): number {
  const habitCreationDay = habit.createdAt ? toDateString(new Date(habit.createdAt)) : '2000-01-01';

  // Check today's scheduled and completion status
  const isScheduledToday = isHabitScheduledForDate(habit, referenceDate);
  const isCompletedToday = isHabitCompletedForDate(habit.id, referenceDate, logs);

  let currentStreak = 0;
  let checkDate: string;

  if (isScheduledToday && isCompletedToday) {
    // Today counts as +1, then walk backwards
    currentStreak = 1;
    checkDate = addDays(referenceDate, -1);
  } else {
    // If today is scheduled but not yet completed, user still has time today.
    // Check if the previous scheduled occurrences are intact.
    checkDate = addDays(referenceDate, -1);
  }

  // Walk back up to 365 days or until habit creation
  let daysChecked = 0;
  const maxDays = 365;

  while (daysChecked < maxDays && checkDate >= habitCreationDay) {
    if (isHabitScheduledForDate(habit, checkDate)) {
      if (isHabitCompletedForDate(habit.id, checkDate, logs)) {
        currentStreak++;
      } else {
        // Encountered a missed scheduled occurrence -> streak breaks
        break;
      }
    }
    checkDate = addDays(checkDate, -1);
    daysChecked++;
  }

  return currentStreak;
}

/**
 * Calculates the best (longest) streak across historical logs for a habit.
 */
export function calculateBestStreak(
  habit: Habit,
  logs: HabitLog[],
  referenceDate: string = getTodayDateString()
): number {
  const habitCreationDay = habit.createdAt ? toDateString(new Date(habit.createdAt)) : '2000-01-01';
  let bestStreak = 0;
  let runningStreak = 0;

  // Walk forward from habitCreationDay to referenceDate
  let cur = habitCreationDay;
  const maxDays = 730; // 2 years back max
  let count = 0;

  // Start from creation day or 365 days ago, whichever is later
  const earliestAllowed = addDays(referenceDate, -365);
  if (cur < earliestAllowed) {
    cur = earliestAllowed;
  }

  while (cur <= referenceDate && count < maxDays) {
    if (isHabitScheduledForDate(habit, cur)) {
      if (isHabitCompletedForDate(habit.id, cur, logs)) {
        runningStreak++;
        if (runningStreak > bestStreak) {
          bestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
    }
    cur = addDays(cur, 1);
    count++;
  }

  return Math.max(bestStreak, calculateCurrentStreak(habit, logs, referenceDate));
}

/**
 * Calculates completion percentage over the last N days (default: 30 days).
 */
export function calculateCompletionRate(
  habit: Habit,
  logs: HabitLog[],
  rangeDays: number = 30,
  referenceDate: string = getTodayDateString()
): number {
  let scheduledCount = 0;
  let completedCount = 0;

  for (let i = 0; i < rangeDays; i++) {
    const d = addDays(referenceDate, -i);
    if (isHabitScheduledForDate(habit, d)) {
      scheduledCount++;
      if (isHabitCompletedForDate(habit.id, d, logs)) {
        completedCount++;
      }
    }
  }

  if (scheduledCount === 0) return 0;
  return Math.round((completedCount / scheduledCount) * 100);
}

/**
 * Get habit status summary for a range of dates.
 */
export function getHabitLogsForPeriod(
  habitId: string,
  startDateStr: string,
  endDateStr: string,
  logs: HabitLog[]
): HabitLog[] {
  return logs.filter(
    (l) => l.habitId === habitId && l.date >= startDateStr && l.date <= endDateStr
  );
}
