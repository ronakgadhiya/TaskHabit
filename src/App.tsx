import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { HabitProvider, useHabits } from './context/HabitContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { QuickAddModal } from './components/layout/QuickAddModal';
import { OnboardingModal } from './components/layout/OnboardingModal';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { HabitFormModal } from './components/habits/HabitFormModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { HabitsView } from './views/HabitsView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

// Sample data loader
import { getSampleData } from './utils/sampleData';
import { importData } from './services/storageService';
import { SCHEMA_VERSION, STORAGE_KEYS } from './constants';

const MainAppContent: React.FC = () => {
  const { addTask } = useTasks();
  const { addHabit, refreshHabits } = useHabits();
  const { refreshTasks } = useTasks();
  const { showToast } = useToast();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Check onboarding
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING) !== 'completed';
  });

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismissOnboarding = () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'completed');
    setIsOnboardingOpen(false);
  };

  const handleLoadSampleDataFromOnboarding = () => {
    const sample = getSampleData();
    importData({
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tasks: sample.tasks,
      habits: sample.habits,
      habitLogs: sample.habitLogs,
      settings: {
        theme: 'system',
        startOfWeek: 1,
        dateFormat: 'YYYY-MM-DD',
        soundEnabled: true,
        onboardingCompleted: true,
      },
    });
    refreshTasks();
    refreshHabits();
    handleDismissOnboarding();
    showToast('Sample workspace loaded!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* View Content Area */}
        <main
          id="main-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-full overflow-x-hidden"
        >
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/habits" element={<HabitsView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectTask={() => setIsTaskModalOpen(true)}
        onSelectHabit={() => setIsHabitModalOpen(true)}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={(taskData) => {
          addTask(taskData);
          showToast('Task added successfully', 'success');
        }}
      />

      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSubmit={(habitData) => {
          addHabit(habitData);
          showToast('Habit ritual created', 'success');
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onGetStarted={handleDismissOnboarding}
        onLoadSampleData={handleLoadSampleDataFromOnboarding}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ToastProvider>
          <TaskProvider>
            <HabitProvider>
              <MainAppContent />
            </HabitProvider>
          </TaskProvider>
        </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
