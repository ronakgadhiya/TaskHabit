import React, { useEffect, useState } from 'react';
import { HABIT_COLORS, HABIT_ICONS, WEEKDAYS } from '../../constants';
import { Habit, HabitFrequency } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { HabitIcon } from './HabitIcon';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialHabit?: Habit | null;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialHabit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0].hex);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [target, setTarget] = useState<number>(1);
  const [targetUnit, setTargetUnit] = useState<string>('times');
  const [reminder, setReminder] = useState('');
  const [errors, setErrors] = useState<{ name?: string; days?: string }>({});

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setDescription(initialHabit.description ?? '');
      setIcon(initialHabit.icon ?? HABIT_ICONS[0]);
      setColor(initialHabit.color ?? HABIT_COLORS[0].hex);
      setFrequency(initialHabit.frequency);
      setDaysOfWeek(initialHabit.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);
      setTarget(initialHabit.target ?? 1);
      setTargetUnit(initialHabit.targetUnit ?? 'times');
      setReminder(initialHabit.reminder ?? '');
    } else {
      setName('');
      setDescription('');
      setIcon(HABIT_ICONS[0]);
      setColor(HABIT_COLORS[0].hex);
      setFrequency('daily');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setTarget(1);
      setTargetUnit('times');
      setReminder('');
    }
    setErrors({});
  }, [initialHabit, isOpen]);

  const toggleDay = (dayIndex: number) => {
    setDaysOfWeek((prev) => {
      const exists = prev.includes(dayIndex);
      const next = exists ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex];
      if (errors.days && next.length > 0) {
        setErrors((e) => ({ ...e, days: undefined }));
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrors({ name: 'Habit name is required.' });
      return;
    }

    if (frequency !== 'daily' && daysOfWeek.length === 0) {
      setErrors({ days: 'Please select at least one day for this habit.' });
      return;
    }

    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
      icon,
      color,
      frequency,
      daysOfWeek: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : daysOfWeek,
      target: target > 0 ? target : 1,
      targetUnit: targetUnit.trim() || 'times',
      reminder: reminder.trim() || undefined,
      isActive: initialHabit?.isActive ?? true,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialHabit ? 'Edit Habit' : 'Create New Habit'}
      description="Design daily or weekly rituals to build lasting consistency."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Habit Name *"
          placeholder="e.g. Read 20 Pages, Morning Run, Daily Journal"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          autoFocus
          maxLength={80}
        />

        <Textarea
          label="Description or Purpose (Optional)"
          placeholder="Why does this habit matter? When will you practice it?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />

        {/* Icon & Color selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-8 sm:grid-cols-6 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              {HABIT_ICONS.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs scale-105'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <HabitIcon name={iconName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Accent Color
            </label>
            <div className="grid grid-cols-4 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              {HABIT_COLORS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'daily', label: 'Every Day' },
              { id: 'weekly', label: 'Specific Days' },
              { id: 'custom', label: 'Custom' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id as HabitFrequency)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                  frequency === f.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {frequency !== 'daily' && (
            <div className="mt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">
                Repeat on:
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((day) => {
                  const isSelected = daysOfWeek.includes(day.index);
                  return (
                    <button
                      key={day.index}
                      type="button"
                      onClick={() => toggleDay(day.index)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={day.full}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
              {errors.days && <p className="text-xs text-rose-500 mt-1">{errors.days}</p>}
            </div>
          )}
        </div>

        {/* Target */}
        <div className="grid grid-cols-2 gap-3.5">
          <Input
            type="number"
            min={1}
            max={1000}
            label="Daily Target"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
          />
          <Input
            label="Target Unit"
            placeholder="e.g. times, mins, pages"
            value={targetUnit}
            onChange={(e) => setTargetUnit(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {initialHabit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
