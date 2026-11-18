import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

describe('useOfflineStatus', () => {
  beforeEach(() => {
    // Default to online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  it('returns false when online', () => {
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);
  });

  it('returns true when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(true);
  });

  it('updates when going offline', () => {
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(true);
  });

  it('updates when going online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(false);
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOfflineStatus());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    removeSpy.mockRestore();
  });
});
