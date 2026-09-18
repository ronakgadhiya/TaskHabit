import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Button } from './Button';

export const PWAInstallButton: React.FC<{ variant?: 'button' | 'compact' | 'nav' }> = ({
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
          title="Install TaskHabit as an offline app"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <Button
        variant="primary"
        size="sm"
        onClick={install}
        className="text-xs"
        title="Install TaskHabit as an offline app"
      >
        <Download className="w-4 h-4 mr-1" />
        Install App
      </Button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Add to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">1.</span>
                  Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">2.</span>
                  Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">3.</span>
                  Confirm with <strong>Add</strong> to launch TaskHabit directly from your phone.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full"
              >
                Got it
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
