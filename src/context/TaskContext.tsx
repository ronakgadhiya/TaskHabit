import React, { createContext, useContext, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../services/storageService';
import { Task } from '../types';

interface TaskContextValue {
  tasks: Task[];
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  editTask: (id: string, updates: Partial<Task>) => Task | null;
  removeTask: (id: string) => boolean;
  toggleTaskStatus: (id: string) => Task | null;
  clearCompletedTasks: () => void;
  refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  const refreshTasks = () => {
    setTasks(getTasks());
  };

  const addTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = createTask(data);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const editTask = (id: string, updates: Partial<Task>) => {
    const updated = updateTask(id, updates);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    return updated;
  };

  const removeTask = (id: string) => {
    const success = deleteTask(id);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  };

  const toggleTaskStatus = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return null;

    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

    return editTask(id, {
      status: newStatus,
      completedAt,
    });
  };

  const clearCompletedTasks = () => {
    const activeOnly = tasks.filter((t) => t.status !== 'completed');
    activeOnly.forEach((t) => {});
    const completedIds = tasks.filter((t) => t.status === 'completed').map((t) => t.id);
    completedIds.forEach((id) => deleteTask(id));
    setTasks(activeOnly);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        editTask,
        removeTask,
        toggleTaskStatus,
        clearCompletedTasks,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
