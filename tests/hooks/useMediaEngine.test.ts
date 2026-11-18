import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMediaEngine } from '@/hooks/useMediaEngine';

const engine = vi.hoisted(() => ({ loadFFmpeg: vi.fn(), isFFmpegLoaded: vi.fn(() => false) }));
vi.mock('@/services/mediaService', () => ({ mediaService: engine }));

describe('useMediaEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    engine.loadFFmpeg.mockResolvedValue(undefined);
  });

  it('stays idle without a file and loads after selection', async () => {
    const { result, rerender } = renderHook(({ file }) => useMediaEngine(file), {
      initialProps: { file: null as object | null },
    });
    expect(engine.loadFFmpeg).not.toHaveBeenCalled();
    expect(result.current.isLoadingFFmpeg).toBe(false);
    rerender({ file: {} });
    expect(result.current.isLoadingFFmpeg).toBe(true);
    await waitFor(() => expect(result.current.isLoadingFFmpeg).toBe(false));
    expect(engine.loadFFmpeg).toHaveBeenCalledTimes(1);
  });

  it('exposes failure and retries the same file', async () => {
    engine.loadFFmpeg.mockRejectedValueOnce(new Error('Download failed'));
    const { result } = renderHook(() => useMediaEngine(selected));
    await waitFor(() => expect(result.current.engineError).toBe('Download failed'));
    act(() => result.current.retryEngine());
    expect(result.current.isLoadingFFmpeg).toBe(true);
    await waitFor(() => expect(result.current.isLoadingFFmpeg).toBe(false));
    expect(result.current.engineError).toBeNull();
    expect(engine.loadFFmpeg).toHaveBeenCalledTimes(2);
  });

  it('ignores a stale failure after another file becomes ready', async () => {
    let reject!: (error: Error) => void;
    engine.loadFFmpeg.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
    const { result, rerender } = renderHook(({ file }) => useMediaEngine(file), {
      initialProps: { file: selected as object | null },
    });
    rerender({ file: {} });
    await waitFor(() => expect(result.current.isLoadingFFmpeg).toBe(false));
    await act(async () => { reject(new Error('Old request')); });
    expect(result.current.engineError).toBeNull();
    expect(result.current.isLoadingFFmpeg).toBe(false);
  });
});
const selected = {};
