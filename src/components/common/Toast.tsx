import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    iconClass: 'text-success',
    bgClass: 'bg-success/10 border-success/25',
    glowClass: 'shadow-[0_4px_24px_rgba(34,197,94,0.2)]',
    progressColor: 'bg-success',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-error',
    bgClass: 'bg-error/10 border-error/25',
    glowClass: 'shadow-[0_4px_24px_rgba(239,68,68,0.2)]',
    progressColor: 'bg-error',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-accent-500',
    bgClass: 'bg-accent-500/10 border-accent-500/25',
    glowClass: 'shadow-[0_4px_24px_rgba(251,191,36,0.2)]',
    progressColor: 'bg-accent-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-primary-500',
    bgClass: 'bg-primary-500/10 border-primary-500/25',
    glowClass: 'shadow-[0_4px_24px_rgba(51,120,255,0.2)]',
    progressColor: 'bg-primary-500',
  },
};

const TOAST_DURATION = 4000;

/**
 * Individual toast with Precision Tools styling
 * Features: type-specific colors, glow effects, progress indicator
 */
function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-center gap-3 px-4 py-3.5 rounded-xl',
        'border backdrop-blur-md',
        'transition-all duration-200',
        '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
        config.bgClass,
        config.glowClass,
        isExiting
          ? 'opacity-0 translate-y-2 scale-95'
          : 'animate-slide-up'
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'shrink-0 p-1.5 rounded-lg',
          toast.type === 'success' && 'bg-success/15',
          toast.type === 'error' && 'bg-error/15',
          toast.type === 'warning' && 'bg-accent-500/15',
          toast.type === 'info' && 'bg-primary-500/15'
        )}
      >
        <Icon className={cn('w-4 h-4', config.iconClass)} strokeWidth={2} />
      </div>

      {/* Message */}
      <p className="text-sm text-text-primary font-medium flex-1 tracking-tight">
        {toast.message}
      </p>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className={cn(
          'p-1.5 rounded-lg shrink-0',
          'text-text-tertiary hover:text-text-primary',
          'hover:bg-white/10 active:scale-95',
          'transition-all duration-150'
        )}
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            config.progressColor,
            'animate-toast-progress'
          )}
          style={{
            animationDuration: `${TOAST_DURATION}ms`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Toast container - renders all active toasts
 * Positioned above bottom nav with safe area support
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<ToastData>) => {
      setToasts((prev) => [...prev, event.detail]);
    };

    window.addEventListener('tooloqo_toast', handleToast as EventListener);
    return () => {
      window.removeEventListener('tooloqo_toast', handleToast as EventListener);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50',
        'flex flex-col gap-2',
        'pointer-events-none',
        'max-w-lg mx-auto'
      )}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  );
}

/**
 * Helper function to show toast
 * Usage: showToast('File saved successfully', 'success')
 */
let toastId = 0;
// eslint-disable-next-line react-refresh/only-export-components
export function showToast(message: string, type: ToastType = 'info') {
  const id = `toast-${++toastId}`;
  const event = new CustomEvent('tooloqo_toast', {
    detail: { id, message, type },
  });
  window.dispatchEvent(event);
}
