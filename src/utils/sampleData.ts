import { Habit, HabitLog, Task } from '../types';
import { addDays, getTodayDateString } from './dateUtils';
import { generateId } from '../services/storageService';

export function getSampleData(): { tasks: Task[]; habits: Habit[]; habitLogs: HabitLog[] } {
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const tomorrow = addDays(today, 1);
  const inThreeDays = addDays(today, 3);

  const tasks: Task[] = [
    {
      id: generateId(),
      title: 'Review quarterly goals and roadmap',
      description: 'Check milestones and update task priorities for next week.',
      dueDate: today,
      dueTime: '10:00',
      priority: 'high',
      category: 'Work',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Buy fresh groceries & produce',
      description: 'Spinach, olive oil, berries, Greek yogurt, almonds.',
      dueDate: today,
      dueTime: '17:30',
      priority: 'medium',
      category: 'Personal',
      status: 'completed',
      completedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Prepare presentation slides for team sync',
      description: 'Summarize user research feedback and metrics.',
      dueDate: tomorrow,
      dueTime: '14:00',
      priority: 'high',
      category: 'Work',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Annual dental checkup & cleaning',
      description: 'Appointment with Dr. Miller.',
      dueDate: inThreeDays,
      dueTime: '09:30',
      priority: 'low',
      category: 'Health',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Organize workspace & backup files',
      description: 'Clean physical desk and run cloud backup of important assets.',
      dueDate: yesterday,
      dueTime: '18:00',
      priority: 'low',
      category: 'Home',
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const habits: Habit[] = [
    {
      id: 'sample-habit-1',
      name: 'Morning Hydration',
      description: 'Drink 500ml water right after waking up.',
      icon: 'Droplets',
      color: '#06b6d4',
      frequency: 'daily',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      target: 1,
      targetUnit: 'glass',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-habit-2',
      name: 'Read 20 Pages',
      description: 'Read non-fiction or educational book before bed.',
      icon: 'BookOpen',
      color: '#6366f1',
      frequency: 'daily',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      target: 20,
      targetUnit: 'pages',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-habit-3',
      name: 'Strength & Cardio Training',
      description: '45 mins structured workout session.',
      icon: 'Dumbbell',
      color: '#10b981',
      frequency: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      target: 45,
      targetUnit: 'mins',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-habit-4',
      name: 'Mindfulness Meditation',
      description: '10 minutes of breathwork and mindful focus.',
      icon: 'Sparkles',
      color: '#a855f7',
      frequency: 'daily',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      target: 10,
      targetUnit: 'mins',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Generate 14 days of realistic logs
  const habitLogs: HabitLog[] = [];
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, -i);
    // Habit 1 (Hydration): completed almost every day (12 out of 14)
    if (i !== 3 && i !== 9) {
      habitLogs.push({
        id: generateId(),
        habitId: 'sample-habit-1',
        date: d,
        completed: true,
        completedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }

    // Habit 2 (Reading): completed 10 out of 14
    if (i !== 1 && i !== 5 && i !== 8) {
      habitLogs.push({
        id: generateId(),
        habitId: 'sample-habit-2',
        date: d,
        completed: true,
        completedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }

    // Habit 3 (Workout): Mon/Wed/Fri
    const dayOfWeek = new Date(d + 'T12:00:00').getDay();
    if ([1, 3, 5].includes(dayOfWeek) && i !== 7) {
      habitLogs.push({
        id: generateId(),
        habitId: 'sample-habit-3',
        date: d,
        completed: true,
        completedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }

    // Habit 4 (Meditation):
    if (i <= 5) {
      habitLogs.push({
        id: generateId(),
        habitId: 'sample-habit-4',
        date: d,
        completed: true,
        completedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }
  }

  return { tasks, habits, habitLogs };
}
