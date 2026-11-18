// Regression tests for findings from the redesign review.
// Each test failed before its fix.
import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');

const compressMock = vi.fn(async (file: File) => file);
vi.mock('browser-image-compression', () => ({ default: (f: File, o: unknown) => compressMock(f, o as never) }));

describe('Image Compress loads no third-party code', () => {
  it('passes a same-origin libURL to browser-image-compression', async () => {
    const { imageService } = await import('@/services/imageService');
    const blob = new Blob([new Uint8Array([255, 216, 255, 224, 0, 0])], { type: 'image/jpeg' });
    await imageService.compress(blob, { quality: 80 } as never);
    const options = compressMock.mock.calls[0][1] as unknown as { libURL?: string };
    expect(options.libURL).toBeDefined();
    expect(new URL(options.libURL!).origin).toBe(window.location.origin);
  });
});

describe('legacy recent-files data is removed in the shipped app', () => {
  it('main.tsx runs the cleanup before render', () => {
    const main = fs.readFileSync(path.join(root, 'src/main.tsx'), 'utf8');
    expect(main).toMatch(/cleanupLegacyStorage\(\)/);
  });

  it('cleanupLegacyStorage removes the old file list', async () => {
    const { cleanupLegacyStorage } = await import('@/lib/legacyStorage');
    // tests/setup.ts mocks window.localStorage, so use a real in-memory Storage here.
    const map = new Map<string, string>([['tooloqo-files', '{"state":{"recentFiles":[{"name":"x.pdf"}]}}'], ['tooloqo-settings', '{}']]);
    const storage = { removeItem: (k: string) => void map.delete(k) } as unknown as Storage;
    cleanupLegacyStorage(storage);
    expect(map.has('tooloqo-files')).toBe(false);
    expect(map.has('tooloqo-settings')).toBe(true);
  });
});

describe('settings save only the theme', () => {
  it('persists theme and nothing else', async () => {
    const setItem = vi.mocked(localStorage.setItem);
    setItem.mockClear();
    const { useSettingsStore } = await import('@/stores/settingsStore');
    useSettingsStore.getState().setTheme('light');
    const call = setItem.mock.calls.filter(([k]) => k === 'tooloqo-settings').at(-1);
    const saved = JSON.parse(call?.[1] ?? '{}');
    expect(Object.keys(saved.state)).toEqual(['theme']);
  });
});

describe('/ad-free on the web', () => {
  it('gets the 404 metadata, matching the 404 page it renders', async () => {
    const { routeMetaFor } = await import('@/lib/routeMeta');
    expect(routeMetaFor('/ad-free', false).title).toMatch(/not found/i);
    expect(routeMetaFor('/ad-free', true).title).toMatch(/ad-free/i);
  });
});
