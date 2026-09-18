import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  CalendarDays,
  BarChart3,
  Settings,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/dateUtils';
import { isHabitCompletedForDate, isHabitScheduledForDate } from '../../utils/habitUtils';

interface SidebarProps {
  onOpenQuickAdd: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd }) => {
  const { tasks } = useTasks();
  const { habits, habitLogs } = useHabits();
  const today = getTodayDateString();

  const pendingTasksToday = tasks.filter((t) => t.dueDate === today && t.status === 'pending').length;
  const pendingHabitsToday = habits.filter(
    (h) => h.isActive && isHabitScheduledForDate(h, today) && !isHabitCompletedForDate(h.id, today, habitLogs)
  ).length;

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksToday > 0 ? pendingTasksToday : undefined },
    { to: '/habits', label: 'Habits', icon: Flame, badge: pendingHabitsToday > 0 ? pendingHabitsToday : undefined },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between py-6 px-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Prominent Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Add</span>
        </button>

        {/* Navigation List */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </div>
                {typeof link.badge === 'number' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Storage Badge */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="leading-tight">Private & Local Storage (Offline Ready)</span>
        </div>
      </div>
    </aside>
  );
};
