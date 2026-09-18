import { Task, TaskFilterType, TaskPriority, TaskSortType } from '../types';
import { getTodayDateString, isPast, isToday } from './dateUtils';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Checks whether a task is overdue (past due date, not completed).
 */
export function isTaskOverdue(task: Task, todayStr: string = getTodayDateString()): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  return task.dueDate < todayStr;
}

/**
 * Filters tasks deterministically without mutating the input array.
 */
export function filterTasks(
  tasks: Task[],
  filterType: TaskFilterType,
  priorityFilter: 'all' | TaskPriority = 'all',
  categoryFilter: string = 'all',
  searchQuery: string = ''
): Task[] {
  const todayStr = getTodayDateString();
  const query = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    // 1. Status / Date Filter
    if (filterType === 'today') {
      if (task.dueDate !== todayStr) return false;
    } else if (filterType === 'upcoming') {
      if (!task.dueDate || task.dueDate <= todayStr || task.status === 'completed') return false;
    } else if (filterType === 'completed') {
      if (task.status !== 'completed') return false;
    } else if (filterType === 'overdue') {
      if (!isTaskOverdue(task, todayStr)) return false;
    }

    // 2. Priority Filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      if (!task.category || task.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    // 4. Search Filter
    if (query) {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description ? task.description.toLowerCase().includes(query) : false;
      const matchCategory = task.category ? task.category.toLowerCase().includes(query) : false;
      if (!matchTitle && !matchDesc && !matchCategory) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts tasks without mutating the original array.
 */
export function sortTasks(tasks: Task[], sortType: TaskSortType): Task[] {
  const copy = [...tasks];

  switch (sortType) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    case 'dueDate':
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        if (a.dueDate === b.dueDate) {
          // tiebreak by dueTime or priority
          const timeA = a.dueTime ?? '23:59';
          const timeB = b.dueTime ?? '23:59';
          return timeA.localeCompare(timeB);
        }
        return a.dueDate.localeCompare(b.dueDate);
      });

    case 'priority':
      return copy.sort((a, b) => {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
        return a.title.localeCompare(b.title);
      });

    case 'alphabetical':
      return copy.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return copy;
  }
}

/**
 * Calculates Task Statistics.
 */
export function calculateTaskStats(tasks: Task[], todayStr: string = getTodayDateString()) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = total - completed;
  const overdue = tasks.filter((t) => isTaskOverdue(t, todayStr)).length;
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const todayCompletionRate = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

  return {
    total,
    completed,
    pending,
    overdue,
    todayTotal: todayTasks.length,
    todayCompleted,
    completionRate,
    todayCompletionRate,
  };
}
