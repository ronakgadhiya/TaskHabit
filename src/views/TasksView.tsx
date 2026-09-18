import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { Task, TaskFilterType, TaskPriority, TaskSortType } from '../types';
import { calculateTaskStats, filterTasks, sortTasks } from '../utils/taskUtils';
import { getTodayDateString } from '../utils/dateUtils';
import { Button } from '../components/ui/Button';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/Card';

export const TasksView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tasks, addTask, editTask, removeTask, toggleTaskStatus, clearCompletedTasks } = useTasks();
  const { showToast } = useToast();

  const urlFilter = searchParams.get('filter') as TaskFilterType | null;
  const urlSearch = searchParams.get('search') || '';

  const [filterType, setFilterType] = useState<TaskFilterType>(
    urlFilter && ['all', 'today', 'upcoming', 'completed', 'overdue'].includes(urlFilter)
      ? urlFilter
      : 'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortType, setSortType] = useState<TaskSortType>('dueDate');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Deletion confirm
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isClearCompletedOpen, setIsClearCompletedOpen] = useState(false);

  const todayStr = getTodayDateString();
  const stats = useMemo(() => calculateTaskStats(tasks, todayStr), [tasks, todayStr]);

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered and sorted tasks
  const displayedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filterType, priorityFilter, categoryFilter, searchQuery);
    return sortTasks(filtered, sortType);
  }, [tasks, filterType, priorityFilter, categoryFilter, searchQuery, sortType]);

  const handleFilterChange = (newFilter: TaskFilterType) => {
    setFilterType(newFilter);
    setSearchParams((prev) => {
      if (newFilter === 'all') prev.delete('filter');
      else prev.set('filter', newFilter);
      return prev;
    });
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    removeTask(taskToDelete);
    setTaskToDelete(null);
    showToast('Task deleted successfully', 'info');
  };

  const handleConfirmClearCompleted = () => {
    clearCompletedTasks();
    setIsClearCompletedOpen(false);
    showToast('Completed tasks cleared', 'info');
  };

  const tabs: { id: TaskFilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'today', label: 'Today', count: stats.todayTotal },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'overdue', label: 'Overdue', count: stats.overdue },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.completed} of {stats.total} completed ({stats.completionRate}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.completed > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearCompletedOpen(true)}
              className="text-slate-500 hover:text-rose-600"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>Clear Done</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setIsFormModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const isSelected = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : tab.id === 'overdue' && tab.count > 0
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | TaskPriority)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as TaskSortType)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {displayedTasks.length > 0 ? (
        <div className="space-y-3">
          {displayedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTaskStatus}
              onEdit={(t) => {
                setEditingTask(t);
                setIsFormModalOpen(true);
              }}
              onDelete={(id) => setTaskToDelete(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8" />}
          title={searchQuery || filterType !== 'all' ? 'No matching tasks found' : 'No tasks created yet'}
          description={
            searchQuery || filterType !== 'all'
              ? 'Try adjusting your search query, priority, or category filters.'
              : 'Add your first task to start organizing your to-do items.'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Task</span>
            </Button>
          }
        />
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialTask={editingTask}
        onSubmit={(taskData) => {
          if (editingTask) {
            editTask(editingTask.id, taskData);
            showToast('Task updated', 'success');
          } else {
            addTask(taskData);
            showToast('Task created', 'success');
          }
        }}
      />

      {/* Single Task Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        isDestructive={true}
      />

      {/* Clear Completed Tasks Confirm Dialog */}
      <ConfirmDialog
        isOpen={isClearCompletedOpen}
        onClose={() => setIsClearCompletedOpen(false)}
        onConfirm={handleConfirmClearCompleted}
        title="Clear Completed Tasks"
        message={`This will permanently remove ${stats.completed} completed ${
          stats.completed === 1 ? 'task' : 'tasks'
        }. Continue?`}
        confirmText="Clear All Completed"
        isDestructive={true}
      />
    </div>
  );
};
