import { describe, it, expect, beforeEach } from 'vitest';
import { ActionRecorder } from '@/api/ActionRecorder';

describe('ActionRecorder', () => {
  let recorder: ActionRecorder;

  beforeEach(() => {
    recorder = new ActionRecorder();
  });

  it('starts recording by default', () => {
    expect(recorder.isRecording()).toBe(true);
  });

  it('starts with empty history', () => {
    expect(recorder.getHistory()).toEqual([]);
  });

  describe('recording', () => {
    it('records an action', () => {
      recorder.record('navigate', { page: 'home' }, { ok: true });
      const history = recorder.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].method).toBe('navigate');
      expect(history[0].input).toEqual({ page: 'home' });
      expect(history[0].result.ok).toBe(true);
    });

    it('records timestamp', () => {
      const before = Date.now();
      recorder.record('test', {}, { ok: true });
      const after = Date.now();
      const ts = recorder.getHistory()[0].timestamp;
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('records multiple actions in order', () => {
      recorder.record('a', {}, { ok: true });
      recorder.record('b', {}, { ok: true });
      recorder.record('c', {}, { ok: false, error: 'fail' });
      expect(recorder.getHistory()).toHaveLength(3);
      expect(recorder.getHistory()[0].method).toBe('a');
      expect(recorder.getHistory()[2].method).toBe('c');
    });

    it('records error results', () => {
      recorder.record('bad', {}, { ok: false, error: 'something failed' });
      const action = recorder.getHistory()[0];
      expect(action.result.ok).toBe(false);
      expect(action.result.error).toBe('something failed');
    });
  });

  describe('pause/resume', () => {
    it('pause stops recording', () => {
      recorder.pause();
      expect(recorder.isRecording()).toBe(false);
      recorder.record('ignored', {}, { ok: true });
      expect(recorder.getHistory()).toHaveLength(0);
    });

    it('resume restarts recording', () => {
      recorder.pause();
      recorder.resume();
      expect(recorder.isRecording()).toBe(true);
      recorder.record('recorded', {}, { ok: true });
      expect(recorder.getHistory()).toHaveLength(1);
    });
  });

  describe('filtering', () => {
    it('getSuccessful returns only ok actions', () => {
      recorder.record('pass', {}, { ok: true });
      recorder.record('fail', {}, { ok: false, error: 'err' });
      recorder.record('pass2', {}, { ok: true });
      expect(recorder.getSuccessful()).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('clears all history', () => {
      recorder.record('a', {}, { ok: true });
      recorder.record('b', {}, { ok: true });
      recorder.clear();
      expect(recorder.getHistory()).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('toJSON returns valid JSON', () => {
      recorder.record('test', { val: 42 }, { ok: true });
      const json = recorder.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].method).toBe('test');
    });

    it('fromJSON restores history', () => {
      const history = [
        { timestamp: 1000, method: 'restored', input: {}, result: { ok: true } },
      ];
      recorder.fromJSON(JSON.stringify(history));
      expect(recorder.getHistory()).toHaveLength(1);
      expect(recorder.getHistory()[0].method).toBe('restored');
    });

    it('fromJSON ignores non-array input', () => {
      recorder.record('existing', {}, { ok: true });
      recorder.fromJSON(JSON.stringify({ not: 'an array' }));
      // Should still have original history since parsed is not an array
      expect(recorder.getHistory()).toHaveLength(1);
    });
  });

  describe('immutability', () => {
    it('getHistory returns a copy', () => {
      recorder.record('a', {}, { ok: true });
      const history = recorder.getHistory();
      history.push({ timestamp: 0, method: 'fake', input: {}, result: { ok: true } });
      expect(recorder.getHistory()).toHaveLength(1);
    });
  });
});
