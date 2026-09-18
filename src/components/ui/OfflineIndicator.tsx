import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-16 sm:bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-xs text-white px-3.5 py-2 text-xs font-semibold shadow-lg shadow-amber-500/20"
      role="status"
    >
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — All data is saved locally in your browser</span>
    </div>
  );
};
