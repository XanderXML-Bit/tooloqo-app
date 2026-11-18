/**
 * Tooloqo StateInspector — Read-only access to the app state tree.
 *
 * Reads from Zustand stores (persisted in localStorage).
 */

import type { TooloqoFile, ProcessingJob, AppSettings } from '@/types';

export class StateInspector {
  // =========================================================================
  // Files
  // =========================================================================

  getFiles(): TooloqoFile[] {
    const state = this.getStoreState('tooloqo-files');
    return Array.isArray(state?.files) ? (state.files as TooloqoFile[]) : [];
  }

  getFileCount(): number {
    return this.getFiles().length;
  }

  // =========================================================================
  // Processing Jobs
  // =========================================================================

  getProcessingJobs(): ProcessingJob[] {
    const state = this.getStoreState('tooloqo-files');
    return Array.isArray(state?.processingJobs) ? (state.processingJobs as ProcessingJob[]) : [];
  }

  getActiveJobs(): ProcessingJob[] {
    return this.getProcessingJobs().filter(j => j.status === 'processing' || j.status === 'queued');
  }

  getCompletedJobs(): ProcessingJob[] {
    return this.getProcessingJobs().filter(j => j.status === 'complete');
  }

  getFailedJobs(): ProcessingJob[] {
    return this.getProcessingJobs().filter(j => j.status === 'error');
  }

  // =========================================================================
  // Settings
  // =========================================================================

  getSettings(): AppSettings | null {
    return this.getStoreState('tooloqo-settings') as AppSettings | null;
  }

  // =========================================================================
  // Full state
  // =========================================================================

  getFullState(): {
    files: TooloqoFile[];
    jobs: ProcessingJob[];
    settings: AppSettings | null;
  } {
    return {
      files: this.getFiles(),
      jobs: this.getProcessingJobs(),
      settings: this.getSettings(),
    };
  }

  // =========================================================================
  // Internal
  // =========================================================================

  private getStoreState(key: string): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state ?? parsed;
    } catch {
      return null;
    }
  }
}
