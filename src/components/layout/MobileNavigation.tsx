import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Flame, CalendarDays, Settings, Plus } from 'lucide-react';

interface MobileNavigationProps {
  onOpenQuickAdd: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onOpenQuickAdd }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around"
      aria-label="Mobile Navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Today</span>
      </NavLink>

      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <CheckSquare className="w-5 h-5" />
        <span className="text-[10px]">Tasks</span>
      </NavLink>

      {/* Center Floating Quick Add Button */}
      <button
        onClick={onOpenQuickAdd}
        className="w-12 h-12 -mt-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform cursor-pointer"
        aria-label="Quick Add task or habit"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <NavLink
        to="/habits"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px]">Habits</span>
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[10px]">Calendar</span>
      </NavLink>
    </nav>
  );
};
