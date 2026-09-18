import { AppSettings, TaskPriority } from '../types';

export const APP_NAME = 'TaskHabit';
export const APP_TAGLINE = 'Plan your tasks. Build your habits. Stay consistent.';
export const APP_VERSION = '1.0.0';
export const SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  VERSION: 'taskhabit_schema_version',
  DATA: 'taskhabit_data_v1',
  SETTINGS: 'taskhabit_settings_v1',
  TASKS: 'taskhabit_tasks_v1',
  HABITS: 'taskhabit_habits_v1',
  HABIT_LOGS: 'taskhabit_habit_logs_v1',
  ONBOARDING: 'taskhabit_onboarding_v1',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  startOfWeek: 1, // Monday
  dateFormat: 'YYYY-MM-DD',
  soundEnabled: true,
  onboardingCompleted: false,
  userName: 'Productive Friend',
};

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string; bg: string }[] = [
  { value: 'high', label: 'High', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' },
  { value: 'low', label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' },
];

export const TASK_CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Learning',
  'Finance',
  'Home',
  'Projects',
  'General',
];

export const HABIT_ICONS = [
  'Flame',
  'Activity',
  'BookOpen',
  'Droplets',
  'Coffee',
  'Smile',
  'Sun',
  'Moon',
  'Dumbbell',
  'Brain',
  'Code',
  'Sparkles',
  'Heart',
  'Music',
  'Target',
  'Zap',
];

export const HABIT_COLORS = [
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-950/40' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500', lightBg: 'bg-rose-50 dark:bg-rose-950/40' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500', lightBg: 'bg-cyan-50 dark:bg-cyan-950/40' },
  { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-950/40' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-950/40' },
  { name: 'Orange', hex: '#f97316', bg: 'bg-orange-500', lightBg: 'bg-orange-50 dark:bg-orange-950/40' },
];

export const WEEKDAYS = [
  { index: 1, short: 'Mon', full: 'Monday' },
  { index: 2, short: 'Tue', full: 'Tuesday' },
  { index: 3, short: 'Wed', full: 'Wednesday' },
  { index: 4, short: 'Thu', full: 'Thursday' },
  { index: 5, short: 'Fri', full: 'Friday' },
  { index: 6, short: 'Sat', full: 'Saturday' },
  { index: 0, short: 'Sun', full: 'Sunday' },
];
