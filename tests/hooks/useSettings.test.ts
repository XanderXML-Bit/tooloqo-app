import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '@/hooks/useSettings';

// Mock settingsStore
const mockSetTheme = vi.fn();

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    theme: 'system' as const,
    setTheme: mockSetTheme,
  }),
}));

vi.mock('@/services/storageService', () => ({
  invalidateSettingsCache: vi.fn(),
}));

describe('useSettings', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('returns theme from store', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.theme).toBe('system');
  });

  it('returns a setTheme function', () => {
    const { result } = renderHook(() => useSettings());
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('setTheme("dark") adds dark class and removes light class', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('setTheme("light") adds light class and removes dark class', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setTheme('light');
    });
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('setTheme("system") respects system preference', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setTheme('system');
    });
    expect(mockSetTheme).toHaveBeenCalledWith('system');
    // matchMedia is mocked to return false (light preference)
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
