import React, { createContext, useContext, useState } from 'react';
import {
  createHabit,
  deleteHabit,
  getHabitLogs,
  getHabits,
  toggleHabitLog,
  updateHabit,
} from '../services/storageService';
import { Habit, HabitLog } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface HabitContextValue {
  habits: Habit[];
  habitLogs: HabitLog[];
  addHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Habit;
  editHabit: (id: string, updates: Partial<Habit>) => Habit | null;
  removeHabit: (id: string) => boolean;
  archiveHabit: (id: string, isActive: boolean) => Habit | null;
  toggleHabitCompletion: (habitId: string, dateStr?: string) => boolean;
  refreshHabits: () => void;
}

const HabitContext = createContext<HabitContextValue | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => getHabitLogs());

  const refreshHabits = () => {
    setHabits(getHabits());
    setHabitLogs(getHabitLogs());
  };

  const addHabit = (data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHabit = createHabit(data);
    setHabits((prev) => [newHabit, ...prev]);
    return newHabit;
  };

  const editHabit = (id: string, updates: Partial<Habit>) => {
    const updated = updateHabit(id, updates);
    if (updated) {
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    }
    return updated;
  };

  const removeHabit = (id: string) => {
    const success = deleteHabit(id);
    if (success) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setHabitLogs((prev) => prev.filter((l) => l.habitId !== id));
    }
    return success;
  };

  const archiveHabit = (id: string, isActive: boolean) => {
    return editHabit(id, { isActive });
  };

  const toggleHabitCompletion = (habitId: string, dateStr?: string) => {
    const targetDate = dateStr ?? getTodayDateString();
    const { completed, logs } = toggleHabitLog(habitId, targetDate);
    setHabitLogs(logs);
    return completed;
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        habitLogs,
        addHabit,
        editHabit,
        removeHabit,
        archiveHabit,
        toggleHabitCompletion,
        refreshHabits,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export function useHabits(): HabitContextValue {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
