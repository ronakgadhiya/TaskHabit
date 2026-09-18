import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { APP_NAME } from '../../constants';
import { useSettings } from '../../context/SettingsContext';
import { PWAInstallButton } from '../ui/PWAInstallButton';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenQuickAdd }) => {
  const { settings, setTheme, resolvedTheme } = useSettings();

  const cycleTheme = () => {
    if (settings.theme === 'light') setTheme('dark');
    else if (settings.theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                Tasks & Habits
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-md hidden sm:flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search tasks, habits, categories...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* In-App PWA Install */}
          <PWAInstallButton variant="compact" />

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer relative"
            title={`Theme: ${settings.theme} (click to cycle)`}
            aria-label="Toggle color theme"
          >
            {settings.theme === 'system' ? (
              <Laptop className="w-4 h-4" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Quick Add Header Button */}
          <button
            onClick={onOpenQuickAdd}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
