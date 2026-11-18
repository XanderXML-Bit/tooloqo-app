import { create } from 'zustand';
import type { TooloqoFile, ProcessingJob, ProcessingStatus } from '@/types';
import { generateId } from '@/lib/utils';

interface FileStoreState {
  files: TooloqoFile[];
  processingJobs: ProcessingJob[];

  // File actions
  addFiles: (files: TooloqoFile[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  // Processing job actions
  createJob: (job: Omit<ProcessingJob, 'id' | 'status' | 'progress'>) => string;
  updateJobStatus: (id: string, status: ProcessingStatus) => void;
  updateJobProgress: (id: string, progress: number) => void;
  setJobOutput: (id: string, outputFiles: TooloqoFile[]) => void;
  setJobError: (id: string, error: string) => void;
  removeJob: (id: string) => void;
  clearCompletedJobs: () => void;
}

// Session-only state. Nothing here is written to storage, so no file name or thumbnail
// outlives the tab. src/lib/legacyStorage.ts removes the list that older builds saved.

export const useFileStore = create<FileStoreState>()(
  (set) => ({
    files: [],
    processingJobs: [],

    addFiles: (newFiles) =>
      set((state) => ({
        files: [...state.files, ...newFiles],
      })),

    removeFile: (id) =>
      set((state) => ({
        files: state.files.filter((f) => f.id !== id),
      })),

    clearFiles: () => set({ files: [] }),

    createJob: (jobData) => {
      const id = generateId();
      const job: ProcessingJob = {
        ...jobData,
        id,
        status: 'queued',
        progress: 0,
        startedAt: new Date(),
      };
      set((state) => ({
        processingJobs: [...state.processingJobs, job],
      }));
      return id;
    },

    updateJobStatus: (id, status) =>
      set((state) => ({
        processingJobs: state.processingJobs.map((job) =>
          job.id === id
            ? {
                ...job,
                status,
                completedAt: status === 'complete' || status === 'error' ? new Date() : undefined,
              }
            : job
        ),
      })),

    updateJobProgress: (id, progress) =>
      set((state) => ({
        processingJobs: state.processingJobs.map((job) =>
          job.id === id ? { ...job, progress } : job
        ),
      })),

    setJobOutput: (id, outputFiles) =>
      set((state) => ({
        processingJobs: state.processingJobs.map((job) =>
          job.id === id ? { ...job, outputFiles, status: 'complete', completedAt: new Date() } : job
        ),
      })),

    setJobError: (id, error) =>
      set((state) => ({
        processingJobs: state.processingJobs.map((job) =>
          job.id === id ? { ...job, error, status: 'error', completedAt: new Date() } : job
        ),
      })),

    removeJob: (id) =>
      set((state) => ({
        processingJobs: state.processingJobs.filter((job) => job.id !== id),
      })),

    clearCompletedJobs: () =>
      set((state) => ({
        processingJobs: state.processingJobs.filter(
          (job) => job.status !== 'complete' && job.status !== 'error'
        ),
      })),
  })
);
