export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  category?: string;
  status: TaskStatus;
  completedAt?: string;
  reminder?: string;
  createdAt: string;
  updatedAt: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Lucide icon identifier
  color?: string; // Tailwind color or hex
  frequency: HabitFrequency;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  target?: number; // e.g. 1 or 30
  targetUnit?: string; // e.g. "times", "mins", "pages"
  reminder?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type DateFormatOption = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';

export interface AppSettings {
  theme: ThemeMode;
  startOfWeek: 0 | 1; // 0: Sunday, 1: Monday
  dateFormat: DateFormatOption;
  soundEnabled: boolean;
  onboardingCompleted: boolean;
  userName?: string;
}

export interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  settings: AppSettings;
}

export type TaskFilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
export type TaskSortType = 'newest' | 'oldest' | 'dueDate' | 'priority' | 'alphabetical';

export interface ProductivitySummary {
  taskContribution: number; // 0 - 100
  habitContribution: number; // 0 - 100
  totalScore: number; // 0 - 100
  tasksTotal: number;
  tasksCompleted: number;
  habitsScheduled: number;
  habitsCompleted: number;
}
