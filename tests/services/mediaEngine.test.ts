import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ load: vi.fn(), terminate: vi.fn(), blob: vi.fn() }));
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false, on: vi.fn(), load: mocks.load, terminate: mocks.terminate,
  })),
}));
vi.mock('@ffmpeg/util', () => ({ fetchFile: vi.fn(), toBlobURL: mocks.blob }));

describe('media engine initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.blob.mockImplementation(async (url: string) => url);
    mocks.load.mockResolvedValue(true);
  });

  it('loads the ESM core required by the module worker', async () => {
    const { loadFFmpeg } = await import('@/services/mediaService');
    await loadFFmpeg();
    expect(mocks.load).toHaveBeenCalledWith({
      coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm',
    });
  });

  it('shares one initialization across concurrent callers', async () => {
    const { loadFFmpeg } = await import('@/services/mediaService');
    const [first, second] = await Promise.all([loadFFmpeg(), loadFFmpeg()]);
    expect(first).toBe(second);
    expect(mocks.load).toHaveBeenCalledTimes(1);
  });

  it('preserves worker string errors, terminates, and retries', async () => {
    mocks.load.mockRejectedValueOnce('Error: failed to import ffmpeg-core.js');
    const { loadFFmpeg } = await import('@/services/mediaService');
    await expect(loadFFmpeg()).rejects.toThrow('failed to import ffmpeg-core.js');
    expect(mocks.terminate).toHaveBeenCalledTimes(1);
    await expect(loadFFmpeg()).resolves.toBeDefined();
    expect(mocks.load).toHaveBeenCalledTimes(2);
  });
});
