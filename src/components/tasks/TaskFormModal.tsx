import React, { useEffect, useState } from 'react';
import { Task, TaskPriority } from '../../types';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../../constants';
import { getTodayDateString } from '../../utils/dateUtils';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState(TASK_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [reminder, setReminder] = useState('');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setDueDate(initialTask.dueDate ?? getTodayDateString());
      setDueTime(initialTask.dueTime ?? '');
      setPriority(initialTask.priority);
      if (initialTask.category && TASK_CATEGORIES.includes(initialTask.category)) {
        setCategory(initialTask.category);
        setIsCustomCategory(false);
      } else if (initialTask.category) {
        setIsCustomCategory(true);
        setCustomCategory(initialTask.category);
      } else {
        setCategory(TASK_CATEGORIES[0]);
        setIsCustomCategory(false);
      }
      setReminder(initialTask.reminder ?? '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setDueTime('');
      setPriority('medium');
      setCategory(TASK_CATEGORIES[0]);
      setIsCustomCategory(false);
      setCustomCategory('');
      setReminder('');
    }
    setErrors({});
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrors({ title: 'Task title is required.' });
      return;
    }

    if (trimmedTitle.length > 120) {
      setErrors({ title: 'Task title is too long (max 120 characters).' });
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      category: finalCategory || undefined,
      status: initialTask?.status ?? 'pending',
      completedAt: initialTask?.completedAt,
      reminder: reminder.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create New Task'}
      description="Plan your to-do items and stay on top of your schedule."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          placeholder="e.g. Complete quarterly report presentation"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          error={errors.title}
          autoFocus
          maxLength={120}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add extra context, checklist items, or helpful notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Input
            type="time"
            label="Due Time (Optional)"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TASK_PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Select
              label="Category"
              value={isCustomCategory ? '__custom__' : category}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomCategory(true);
                } else {
                  setIsCustomCategory(false);
                  setCategory(e.target.value);
                }
              }}
            >
              {TASK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__">+ Custom Category...</option>
            </Select>

            {isCustomCategory && (
              <div className="mt-2">
                <Input
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  maxLength={30}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
