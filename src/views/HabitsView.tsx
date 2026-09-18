import React, { useMemo, useState } from 'react';
import { Plus, Flame, Trophy, Search, Archive, Sparkles } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useToast } from '../context/ToastContext';
import { Habit } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import {
  calculateBestStreak,
  calculateCurrentStreak,
  isHabitCompletedForDate,
  isHabitScheduledForDate,
} from '../utils/habitUtils';
import { Button } from '../components/ui/Button';
import { Card, EmptyState } from '../components/ui/Card';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { HabitHistoryModal } from '../components/habits/HabitHistoryModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const HabitsView: React.FC = () => {
  const { habits, habitLogs, addHabit, editHabit, removeHabit, archiveHabit, toggleHabitCompletion } =
    useHabits();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // History modal
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);

  // Deletion confirm
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Stats
  const activeHabits = useMemo(() => habits.filter((h) => h.isActive), [habits]);
  const archivedHabits = useMemo(() => habits.filter((h) => !h.isActive), [habits]);

  const scheduledToday = activeHabits.filter((h) => isHabitScheduledForDate(h, todayStr));
  const completedToday = scheduledToday.filter((h) => isHabitCompletedForDate(h.id, todayStr, habitLogs));

  const maxCurrentStreak = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    return Math.max(...activeHabits.map((h) => calculateCurrentStreak(h, habitLogs)), 0);
  }, [activeHabits, habitLogs]);

  // Filtered displayed habits
  const displayedHabits = useMemo(() => {
    let list = habits;
    if (activeTab === 'active') list = activeHabits;
    if (activeTab === 'archived') list = archivedHabits;

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          (h.description && h.description.toLowerCase().includes(query))
      );
    }

    return list;
  }, [habits, activeTab, activeHabits, archivedHabits, searchQuery]);

  const handleToggleToday = (habitId: string) => {
    const isDone = toggleHabitCompletion(habitId, todayStr);
    const h = habits.find((item) => item.id === habitId);
    showToast(
      isDone ? `"${h?.name}" marked complete for today!` : `"${h?.name}" marked incomplete`,
      isDone ? 'success' : 'info'
    );
  };

  const handleToggleArchive = (habitId: string, currentActive: boolean) => {
    archiveHabit(habitId, !currentActive);
    showToast(currentActive ? 'Habit archived' : 'Habit restored to active', 'info');
  };

  const handleConfirmDelete = () => {
    if (!habitToDelete) return;
    removeHabit(habitToDelete);
    setHabitToDelete(null);
    showToast('Habit and all associated logs deleted', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Habits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track daily rituals, build momentum, and celebrate long-term streaks.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingHabit(null);
            setIsFormModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Habits
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeHabits.length}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Completed Today
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {completedToday.length} / {scheduledToday.length}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Top Active Streak
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {maxCurrentStreak} days
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active ({activeHabits.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Archived ({archivedHabits.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({habits.length})
          </button>
        </div>

        <div className="relative flex items-center w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search habits..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Habits Grid */}
      {displayedHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={habitLogs}
              onToggleToday={handleToggleToday}
              onOpenHistory={(h) => setHistoryHabit(h)}
              onEdit={(h) => {
                setEditingHabit(h);
                setIsFormModalOpen(true);
              }}
              onDelete={(id) => setHabitToDelete(id)}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Flame className="w-8 h-8" />}
          title={searchQuery ? 'No habits found' : 'No habits here'}
          description={
            searchQuery
              ? 'Try a different search query.'
              : activeTab === 'archived'
              ? 'You have not archived any habits.'
              : 'Add habits like Reading, Hydration, Exercise, or Meditation to start building consistency.'
          }
          action={
            activeTab !== 'archived' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingHabit(null);
                  setIsFormModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create Habit</span>
              </Button>
            )
          }
        />
      )}

      {/* Habit Form Modal */}
      <HabitFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialHabit={editingHabit}
        onSubmit={(habitData) => {
          if (editingHabit) {
            editHabit(editingHabit.id, habitData);
            showToast('Habit updated', 'success');
          } else {
            addHabit(habitData);
            showToast('Habit created', 'success');
          }
        }}
      />

      {/* Habit Month History Modal */}
      <HabitHistoryModal
        habit={historyHabit}
        logs={habitLogs}
        isOpen={Boolean(historyHabit)}
        onClose={() => setHistoryHabit(null)}
        onToggleDate={(habitId, dateStr) => {
          toggleHabitCompletion(habitId, dateStr);
        }}
      />

      {/* Delete Habit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(habitToDelete)}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Habit"
        message="Are you sure you want to permanently delete this habit and all its historical streak logs? This cannot be undone."
        confirmText="Delete Habit"
        isDestructive={true}
      />
    </div>
  );
};
