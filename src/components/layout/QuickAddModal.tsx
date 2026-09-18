import React from 'react';
import { CheckSquare, Flame, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: () => void;
  onSelectHabit: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onSelectHabit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New"
      description="What would you like to plan today?"
      maxWidth="sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <button
          onClick={() => {
            onClose();
            onSelectTask();
          }}
          className="flex flex-col items-start p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
            Add Task
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            One-time or dated to-do item with priority and due time.
          </span>
        </button>

        <button
          onClick={() => {
            onClose();
            onSelectHabit();
          }}
          className="flex flex-col items-start p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
            Add Habit
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Recurring routine to track daily streaks and consistency.
          </span>
        </button>
      </div>
    </Modal>
  );
};
