import { describe, it, expect, beforeEach } from 'vitest';
import { useFileStore } from '@/stores/fileStore';
import type { TooloqoFile } from '@/types';

const createMockFile = (id: string, name = 'test.png'): TooloqoFile => ({
  id,
  originalName: name,
  mimeType: 'image/png',
  size: 1024,
  blob: new Blob(['test'], { type: 'image/png' }),
  createdAt: new Date(),
});

describe('fileStore', () => {
  beforeEach(() => {
    // Reset store state
    useFileStore.setState({
      files: [],
      processingJobs: [],
    });
  });

  describe('file actions', () => {
    it('adds files', () => {
      const file = createMockFile('1');
      useFileStore.getState().addFiles([file]);
      expect(useFileStore.getState().files).toHaveLength(1);
      expect(useFileStore.getState().files[0].id).toBe('1');
    });

    it('removes a file by id', () => {
      useFileStore.setState({ files: [createMockFile('1'), createMockFile('2')] });
      useFileStore.getState().removeFile('1');
      expect(useFileStore.getState().files).toHaveLength(1);
      expect(useFileStore.getState().files[0].id).toBe('2');
    });

    it('clears all files', () => {
      useFileStore.setState({ files: [createMockFile('1'), createMockFile('2')] });
      useFileStore.getState().clearFiles();
      expect(useFileStore.getState().files).toHaveLength(0);
    });
  });

  describe('processing jobs', () => {
    it('creates a job with generated id', () => {
      const id = useFileStore.getState().createJob({
        type: 'image-resize',
        inputFiles: [createMockFile('1')],
      });
      expect(id).toBeTruthy();
      const job = useFileStore.getState().processingJobs[0];
      expect(job.status).toBe('queued');
      expect(job.progress).toBe(0);
    });

    it('updates job status', () => {
      const id = useFileStore.getState().createJob({
        type: 'image-resize',
        inputFiles: [],
      });
      useFileStore.getState().updateJobStatus(id, 'processing');
      expect(useFileStore.getState().processingJobs[0].status).toBe('processing');
    });

    it('updates job progress', () => {
      const id = useFileStore.getState().createJob({
        type: 'image-resize',
        inputFiles: [],
      });
      useFileStore.getState().updateJobProgress(id, 50);
      expect(useFileStore.getState().processingJobs[0].progress).toBe(50);
    });

    it('sets job output and marks complete', () => {
      const id = useFileStore.getState().createJob({
        type: 'image-resize',
        inputFiles: [],
      });
      const output = [createMockFile('out-1')];
      useFileStore.getState().setJobOutput(id, output);
      const job = useFileStore.getState().processingJobs[0];
      expect(job.status).toBe('complete');
      expect(job.outputFiles).toHaveLength(1);
      expect(job.completedAt).toBeDefined();
    });

    it('sets job error', () => {
      const id = useFileStore.getState().createJob({
        type: 'image-resize',
        inputFiles: [],
      });
      useFileStore.getState().setJobError(id, 'Something failed');
      const job = useFileStore.getState().processingJobs[0];
      expect(job.status).toBe('error');
      expect(job.error).toBe('Something failed');
    });

    it('removes a job', () => {
      const id = useFileStore.getState().createJob({
        type: 'image-resize',
        inputFiles: [],
      });
      useFileStore.getState().removeJob(id);
      expect(useFileStore.getState().processingJobs).toHaveLength(0);
    });

    it('clears completed jobs', () => {
      const id1 = useFileStore.getState().createJob({ type: 'a', inputFiles: [] });
      const id2 = useFileStore.getState().createJob({ type: 'b', inputFiles: [] });
      useFileStore.getState().updateJobStatus(id1, 'complete');
      useFileStore.getState().updateJobStatus(id2, 'processing');
      useFileStore.getState().clearCompletedJobs();
      expect(useFileStore.getState().processingJobs).toHaveLength(1);
      expect(useFileStore.getState().processingJobs[0].id).toBe(id2);
    });
  });
});
