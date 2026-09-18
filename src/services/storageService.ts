import { DEFAULT_SETTINGS, SCHEMA_VERSION, STORAGE_KEYS } from '../constants';
import { AppSettings, BackupData, Habit, HabitLog, Task } from '../types';

/**
 * Safe localStorage wrapper that handles quota errors and corruptions.
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[TaskHabit Storage] Error parsing key "${key}":`, error);
    return defaultValue;
  }
}

export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[TaskHabit Storage] Storage quota exceeded or error writing "${key}":`, error);
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[TaskHabit Storage] Error removing key "${key}":`, error);
  }
}

// Generate unique stable IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/* ==================== TASKS ==================== */

export function getTasks(): Task[] {
  const tasks = safeGetItem<Task[]>(STORAGE_KEYS.TASKS, []);
  if (!Array.isArray(tasks)) return [];
  return tasks;
}

export function saveTasks(tasks: Task[]): boolean {
  return safeSetItem(STORAGE_KEYS.TASKS, tasks);
}

export function getTask(id: string): Task | undefined {
  const tasks = getTasks();
  return tasks.find((t) => t.id === id);
}

export function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const now = new Date().toISOString();
  const newTask: Task = {
    ...taskData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  const tasks = getTasks();
  saveTasks([newTask, ...tasks]);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated: Task = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  saveTasks(tasks);
  return updated;
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  return saveTasks(filtered);
}

/* ==================== HABITS ==================== */

export function getHabits(): Habit[] {
  const habits = safeGetItem<Habit[]>(STORAGE_KEYS.HABITS, []);
  if (!Array.isArray(habits)) return [];
  return habits;
}

export function saveHabits(habits: Habit[]): boolean {
  return safeSetItem(STORAGE_KEYS.HABITS, habits);
}

export function getHabit(id: string): Habit | undefined {
  const habits = getHabits();
  return habits.find((h) => h.id === id);
}

export function createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Habit {
  const now = new Date().toISOString();
  const newHabit: Habit = {
    ...habitData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  const habits = getHabits();
  saveHabits([newHabit, ...habits]);
  return newHabit;
}

export function updateHabit(id: string, updates: Partial<Habit>): Habit | null {
  const habits = getHabits();
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) return null;

  const updated: Habit = {
    ...habits[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  habits[index] = updated;
  saveHabits(habits);
  return updated;
}

export function deleteHabit(id: string): boolean {
  const habits = getHabits();
  const filtered = habits.filter((h) => h.id !== id);
  if (filtered.length === habits.length) return false;
  // Also clean up logs for this habit
  const logs = getHabitLogs().filter((l) => l.habitId !== id);
  saveHabitLogs(logs);
  return saveHabits(filtered);
}

/* ==================== HABIT LOGS ==================== */

export function getHabitLogs(): HabitLog[] {
  const logs = safeGetItem<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
  if (!Array.isArray(logs)) return [];
  return logs;
}

export function saveHabitLogs(logs: HabitLog[]): boolean {
  return safeSetItem(STORAGE_KEYS.HABIT_LOGS, logs);
}

/**
 * Toggle or set habit completion on a specific date.
 */
export function toggleHabitLog(habitId: string, dateStr: string): { completed: boolean; logs: HabitLog[] } {
  const logs = getHabitLogs();
  const existingIndex = logs.findIndex((l) => l.habitId === habitId && l.date === dateStr);

  if (existingIndex >= 0) {
    const wasCompleted = logs[existingIndex].completed;
    const newStatus = !wasCompleted;
    logs[existingIndex] = {
      ...logs[existingIndex],
      completed: newStatus,
      completedAt: newStatus ? new Date().toISOString() : undefined,
    };
    saveHabitLogs(logs);
    return { completed: newStatus, logs };
  } else {
    // Create new log entry
    const newLog: HabitLog = {
      id: generateId(),
      habitId,
      date: dateStr,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    const updatedLogs = [newLog, ...logs];
    saveHabitLogs(updatedLogs);
    return { completed: true, logs: updatedLogs };
  }
}

/* ==================== SETTINGS ==================== */

export function getSettings(): AppSettings {
  const settings = safeGetItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export function saveSettings(settings: AppSettings): boolean {
  return safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

/* ==================== EXPORT & IMPORT ==================== */

export function exportData(): string {
  const data: BackupData = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: getTasks(),
    habits: getHabits(),
    habitLogs: getHabitLogs(),
    settings: getSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export interface ImportValidationResult {
  valid: boolean;
  error?: string;
  data?: BackupData;
}

export function validateImportData(rawJson: string): ImportValidationResult {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File does not contain a valid JSON object.' };
    }

    if (!Array.isArray(parsed.tasks)) {
      return { valid: false, error: 'Backup is missing a valid tasks array.' };
    }

    if (!Array.isArray(parsed.habits)) {
      return { valid: false, error: 'Backup is missing a valid habits array.' };
    }

    if (!Array.isArray(parsed.habitLogs)) {
      return { valid: false, error: 'Backup is missing a valid habitLogs array.' };
    }

    // Basic structural sanitation
    const sanitizedTasks: Task[] = parsed.tasks.filter(
      (t: unknown): t is Task =>
        Boolean(t && typeof t === 'object' && 'id' in t && 'title' in t)
    );

    const sanitizedHabits: Habit[] = parsed.habits.filter(
      (h: unknown): h is Habit =>
        Boolean(h && typeof h === 'object' && 'id' in h && 'name' in h)
    );

    const sanitizedLogs: HabitLog[] = parsed.habitLogs.filter(
      (l: unknown): l is HabitLog =>
        Boolean(l && typeof l === 'object' && 'habitId' in l && 'date' in l)
    );

    const sanitizedSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}),
    };

    const validData: BackupData = {
      schemaVersion: Number(parsed.schemaVersion) || SCHEMA_VERSION,
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      tasks: sanitizedTasks,
      habits: sanitizedHabits,
      habitLogs: sanitizedLogs,
      settings: sanitizedSettings,
    };

    return { valid: true, data: validData };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Invalid JSON formatting.' };
  }
}

export function importData(backup: BackupData): boolean {
  const successTasks = saveTasks(backup.tasks);
  const successHabits = saveHabits(backup.habits);
  const successLogs = saveHabitLogs(backup.habitLogs);
  const successSettings = saveSettings(backup.settings);
  return successTasks && successHabits && successLogs && successSettings;
}

export function clearAllData(): void {
  safeRemoveItem(STORAGE_KEYS.TASKS);
  safeRemoveItem(STORAGE_KEYS.HABITS);
  safeRemoveItem(STORAGE_KEYS.HABIT_LOGS);
  safeRemoveItem(STORAGE_KEYS.SETTINGS);
  safeRemoveItem(STORAGE_KEYS.ONBOARDING);
}
