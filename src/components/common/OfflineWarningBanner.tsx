import { WifiOff } from 'lucide-react';
import { useOfflineStatus } from '@/hooks';

/**
 * Banner that shows when the app is offline
 * Appears at the top of the screen
 */
export function OfflineWarningBanner() {
  const isOffline = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div role="alert" className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 flex items-center justify-center gap-2 animate-slide-up">
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
    </div>
  );
}
