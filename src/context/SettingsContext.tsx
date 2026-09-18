import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../services/storageService';
import { AppSettings, ThemeMode } from '../types';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Sync theme changes with DOM
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'dark') {
        isDark = true;
      } else if (settings.theme === 'light') {
        isDark = false;
      } else {
        // System preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen to system changes if theme is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  };

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setTheme, resolvedTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
