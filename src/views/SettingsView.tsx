import React, { useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Laptop,
  Download,
  Upload,
  Trash2,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useToast } from '../context/ToastContext';
import { clearAllData, exportData, importData, validateImportData } from '../services/storageService';
import { getSampleData } from '../utils/sampleData';
import { getTodayDateString } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PWAInstallButton } from '../components/ui/PWAInstallButton';
import { APP_NAME, APP_TAGLINE, SCHEMA_VERSION } from '../constants';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, setTheme } = useSettings();
  const { refreshTasks } = useTasks();
  const { refreshHabits } = useHabits();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSampleDataModalOpen, setIsSampleDataModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const jsonString = exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `taskhabit-backup-${getTodayDateString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Backup downloaded successfully', 'success');
    } catch (err) {
      showToast('Failed to export backup', 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateImportData(content);

      if (!validation.valid || !validation.data) {
        setImportError(validation.error || 'Invalid backup file format.');
        showToast('Backup file invalid', 'error');
        return;
      }

      setImportError(null);
      const success = importData(validation.data);
      if (success) {
        refreshTasks();
        refreshHabits();
        updateSettings(validation.data.settings);
        showToast('Data imported successfully!', 'success');
      } else {
        showToast('Failed to save imported data', 'error');
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleLoadSampleData = () => {
    const { tasks, habits, habitLogs } = getSampleData();
    const backup = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tasks,
      habits,
      habitLogs,
      settings,
    };
    importData(backup);
    refreshTasks();
    refreshHabits();
    setIsSampleDataModalOpen(false);
    showToast('Sample tasks & habits loaded successfully!', 'success');
  };

  const handleClearAll = () => {
    clearAllData();
    refreshTasks();
    refreshHabits();
    setIsClearModalOpen(false);
    showToast('All local application data has been wiped', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your preferences, manage offline backups, and review privacy settings.
        </p>
      </div>

      {/* App Appearance */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance & Theme</h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((themeOption) => {
            const isSelected = settings.theme === themeOption.id;
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id as any)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{themeOption.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Regional & Schedule Preferences */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Schedule & Calendar</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Start of Week
            </label>
            <select
              value={settings.startOfWeek}
              onChange={(e) => updateSettings({ startOfWeek: Number(e.target.value) as 0 | 1 })}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={1}>Monday (Standard)</option>
              <option value={0}>Sunday</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Backup & Restore */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Backup & Data Portability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your data as a clean JSON backup file or restore from a previously exported backup.
            </p>
          </div>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5 text-indigo-500" />
            <span>Export Backup (JSON)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1.5 text-emerald-500" />
            <span>Import Backup</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSampleDataModalOpen(true)}
            className="text-slate-600 dark:text-slate-300"
          >
            <Database className="w-4 h-4 mr-1.5 text-amber-500" />
            <span>Load Sample Data</span>
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Wipe Data */}
      <Card className="p-5 border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 space-y-3">
        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">Danger Zone</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Permanently delete all tasks, habits, streak logs, and preferences stored in this browser.
        </p>
        <div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsClearModalOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Reset All Data</span>
          </Button>
        </div>
      </Card>

      {/* App Information & Privacy Guarantee */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {APP_NAME} v1.0.0
            </h4>
            <p className="text-xs text-slate-500">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Offline-First Architecture — Zero external tracking or telemetry</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Schema version: {SCHEMA_VERSION} • Storage engine: Browser LocalStorage
          </p>
        </div>
      </Card>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="Reset All Data?"
        message="This will permanently delete all your tasks, habits, and history logs from this browser. This action cannot be reversed."
        confirmText="Yes, Wipe All Data"
        isDestructive={true}
      />

      {/* Confirm Load Sample Data Dialog */}
      <ConfirmDialog
        isOpen={isSampleDataModalOpen}
        onClose={() => setIsSampleDataModalOpen(false)}
        onConfirm={handleLoadSampleData}
        title="Load Sample Data?"
        message="This will add realistic sample tasks and habits (with 14 days of history) to help test and explore TaskHabit."
        confirmText="Load Sample Workspace"
        isDestructive={false}
      />
    </div>
  );
};
