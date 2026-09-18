import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, Circle, Flame, ArrowRight, X } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { Modal } from '../ui/Modal';
import { HabitIcon } from '../habits/HabitIcon';
import { formatFriendlyDate } from '../../utils/dateUtils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const cleanQuery = query.trim().toLowerCase();

  const matchedTasks = cleanQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQuery) ||
          (t.description && t.description.toLowerCase().includes(cleanQuery)) ||
          (t.category && t.category.toLowerCase().includes(cleanQuery))
      ).slice(0, 5)
    : [];

  const matchedHabits = cleanQuery
    ? habits.filter(
        (h) =>
          h.name.toLowerCase().includes(cleanQuery) ||
          (h.description && h.description.toLowerCase().includes(cleanQuery))
      ).slice(0, 5)
    : [];

  const handleSelectTask = (taskId: string) => {
    onClose();
    navigate(`/tasks?search=${encodeURIComponent(query)}`);
  };

  const handleSelectHabit = (habitId: string) => {
    onClose();
    navigate('/habits');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Search" maxWidth="lg">
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, habits, categories... (or press Esc to close)"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {cleanQuery ? (
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
            {/* Tasks section */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tasks ({matchedTasks.length})
              </div>
              {matchedTasks.length > 0 ? (
                <div className="space-y-1.5">
                  {matchedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleSelectTask(task.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            task.status === 'completed'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {task.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">
                        {task.dueDate ? formatFriendlyDate(task.dueDate) : 'No date'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-1">No tasks matching "{query}"</p>
              )}
            </div>

            {/* Habits section */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Habits ({matchedHabits.length})
              </div>
              {matchedHabits.length > 0 ? (
                <div className="space-y-1.5">
                  {matchedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => handleSelectHabit(habit.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${habit.color ?? '#6366f1'}25`, color: habit.color ?? '#6366f1' }}
                        >
                          <HabitIcon name={habit.icon} className="w-4 h-4" />
                        </div>
                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                          {habit.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                          {habit.frequency}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-1">No habits matching "{query}"</p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Start typing to quickly search your tasks and habits.
          </div>
        )}
      </div>
    </Modal>
  );
};
