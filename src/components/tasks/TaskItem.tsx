import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task } from '../../types';
import { isTaskOverdue } from '../../utils/taskUtils';
import { formatFriendlyDate, getTodayDateString } from '../../utils/dateUtils';
import { Badge } from '../ui/Badge';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isCompleted = task.status === 'completed';
  const isOverdue = isTaskOverdue(task, getTodayDateString());

  const priorityBadgeVariant = {
    high: 'danger' as const,
    medium: 'warning' as const,
    low: 'neutral' as const,
  }[task.priority];

  return (
    <div
      className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-150 ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
          : isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/60 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Accessible Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as completed`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              onClick={() => onToggle(task.id)}
              className={`text-sm font-semibold cursor-pointer transition-all ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label={`Edit ${task.title}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description preview or expander */}
          {task.description && (
            <p
              className={`text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 ${
                isCompleted ? 'line-through opacity-70' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Metadata tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Priority */}
            <Badge variant={priorityBadgeVariant}>
              <span className="capitalize">{task.priority}</span>
            </Badge>

            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{task.category}</span>
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isOverdue
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  {formatFriendlyDate(task.dueDate)}
                  {isOverdue ? ' (Overdue)' : ''}
                </span>
              </span>
            )}

            {/* Due time */}
            {task.dueTime && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{task.dueTime}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
