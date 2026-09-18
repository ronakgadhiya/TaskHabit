import React from 'react';
import { CheckCircle2, Flame, Sparkles, ArrowRight, Database } from 'lucide-react';
import { Button } from '../ui/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onGetStarted: () => void;
  onLoadSampleData: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onGetStarted,
  onLoadSampleData,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Welcome to TaskHabit
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Plan your tasks. Build your habits. Stay consistent. Completely private, fast, and offline-first in your browser.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Tasks System</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage one-time priorities, due dates, categories, and reminders.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Habit Streaks</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily & custom schedules with true consecutive occurrence streak tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="flex-1 text-sm font-semibold"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLoadSampleData}
              className="text-sm font-semibold"
              title="Load starter tasks and habit streaks to test all features immediately"
            >
              <Database className="w-4 h-4 mr-1.5 text-slate-500" />
              <span>Load Sample Data</span>
            </Button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={onGetStarted}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Skip and start with blank workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
