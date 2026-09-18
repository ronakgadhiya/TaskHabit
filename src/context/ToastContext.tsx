import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { generateId } from '../services/storageService';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = generateId();
    const newToast: ToastMessage = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        id="toast-container"
        className="fixed bottom-16 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';
          let IconComponent = CheckCircle2;

          if (toast.type === 'error') {
            bg = 'bg-rose-600 text-white';
            IconComponent = AlertCircle;
          } else if (toast.type === 'info') {
            bg = 'bg-indigo-600 text-white';
            IconComponent = Info;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-white/10 text-sm font-medium transition-all transform translate-y-0 ${bg}`}
              role="alert"
            >
              <IconComponent className="w-5 h-5 shrink-0" />
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition p-0.5 rounded"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
