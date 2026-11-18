import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';
import * as Toast from '@/components/common/Toast';

vi.mock('@/components/common/Toast', () => ({
  showToast: vi.fn(),
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.mocked(Toast.showToast).mockClear();
  });

  it('returns toast, success, error, and info functions', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.info).toBe('function');
  });

  it('toast() calls showToast with message and type', () => {
    const { result } = renderHook(() => useToast());
    result.current.toast('Hello', 'warning');
    expect(Toast.showToast).toHaveBeenCalledWith('Hello', 'warning');
  });

  it('toast() defaults to info type', () => {
    const { result } = renderHook(() => useToast());
    result.current.toast('Default');
    expect(Toast.showToast).toHaveBeenCalledWith('Default', 'info');
  });

  it('success() calls showToast with success type', () => {
    const { result } = renderHook(() => useToast());
    result.current.success('Done!');
    expect(Toast.showToast).toHaveBeenCalledWith('Done!', 'success');
  });

  it('error() calls showToast with error type', () => {
    const { result } = renderHook(() => useToast());
    result.current.error('Failed');
    expect(Toast.showToast).toHaveBeenCalledWith('Failed', 'error');
  });

  it('info() calls showToast with info type', () => {
    const { result } = renderHook(() => useToast());
    result.current.info('FYI');
    expect(Toast.showToast).toHaveBeenCalledWith('FYI', 'info');
  });
});
