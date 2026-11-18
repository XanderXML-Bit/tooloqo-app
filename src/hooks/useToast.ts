import { useCallback } from 'react';
import { showToast, type ToastType } from '@/components/common/Toast';

/**
 * Hook for showing toast notifications
 * Provides a convenient interface to the toast system
 */
export function useToast() {
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    showToast(message, type);
  }, []);

  const success = useCallback((message: string) => {
    showToast(message, 'success');
  }, []);

  const error = useCallback((message: string) => {
    showToast(message, 'error');
  }, []);

  const info = useCallback((message: string) => {
    showToast(message, 'info');
  }, []);

  return {
    toast,
    success,
    error,
    info,
  };
}
