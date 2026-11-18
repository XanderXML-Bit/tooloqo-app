import { describe, it, expect, beforeEach } from 'vitest';
import { StateInspector } from '@/api/StateInspector';

describe('StateInspector', () => {
  let inspector: StateInspector;

  beforeEach(() => {
    inspector = new StateInspector();
    localStorage.getItem.mockReset();
  });

  describe('getFiles', () => {
    it('returns empty array when no data in localStorage', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(inspector.getFiles()).toEqual([]);
    });

    it('returns files from stored state', () => {
      const files = [{ id: '1', originalName: 'test.png' }];
      localStorage.getItem.mockReturnValue(JSON.stringify({ state: { files } }));
      expect(inspector.getFiles()).toEqual(files);
    });
  });

  describe('getFileCount', () => {
    it('returns 0 when no files', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(inspector.getFileCount()).toBe(0);
    });

    it('returns correct count', () => {
      const files = [{ id: '1' }, { id: '2' }];
      localStorage.getItem.mockReturnValue(JSON.stringify({ state: { files } }));
      expect(inspector.getFileCount()).toBe(2);
    });
  });

  describe('processing jobs', () => {
    it('getProcessingJobs returns empty array when no data', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(inspector.getProcessingJobs()).toEqual([]);
    });

    it('getActiveJobs filters processing/queued jobs', () => {
      const jobs = [
        { status: 'processing' },
        { status: 'queued' },
        { status: 'complete' },
        { status: 'error' },
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify({ state: { processingJobs: jobs } }));
      expect(inspector.getActiveJobs()).toHaveLength(2);
    });

    it('getCompletedJobs filters complete jobs', () => {
      const jobs = [
        { status: 'processing' },
        { status: 'complete' },
        { status: 'complete' },
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify({ state: { processingJobs: jobs } }));
      expect(inspector.getCompletedJobs()).toHaveLength(2);
    });

    it('getFailedJobs filters error jobs', () => {
      const jobs = [
        { status: 'error' },
        { status: 'complete' },
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify({ state: { processingJobs: jobs } }));
      expect(inspector.getFailedJobs()).toHaveLength(1);
    });
  });

  describe('getSettings', () => {
    it('returns null when no settings', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(inspector.getSettings()).toBeNull();
    });

    it('returns settings from stored state', () => {
      const settings = { theme: 'dark' };
      localStorage.getItem.mockReturnValue(JSON.stringify({ state: settings }));
      expect(inspector.getSettings()).toEqual(settings);
    });
  });

  describe('getFullState', () => {
    it('returns all state sections', () => {
      localStorage.getItem.mockReturnValue(null);
      const state = inspector.getFullState();
      expect(state).toHaveProperty('files');
      expect(state).not.toHaveProperty('recentFiles');
      expect(state).toHaveProperty('jobs');
      expect(state).toHaveProperty('settings');
    });
  });

  describe('error handling', () => {
    it('returns null for invalid JSON', () => {
      localStorage.getItem.mockReturnValue('not valid json');
      expect(inspector.getSettings()).toBeNull();
    });

    it('handles direct state (no .state wrapper)', () => {
      const data = { theme: 'light' };
      localStorage.getItem.mockReturnValue(JSON.stringify(data));
      expect(inspector.getSettings()).toEqual(data);
    });
  });
});
