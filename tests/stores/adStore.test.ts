import { describe, it, expect, beforeEach } from 'vitest';
import { useAdStore } from '@/stores/adStore';

describe('adStore', () => {
  beforeEach(() => {
    // Reset store state
    useAdStore.setState({ adFree: false });
  });

  it('starts with adFree as false', () => {
    expect(useAdStore.getState().adFree).toBe(false);
  });

  it('isAdFree returns false by default', () => {
    expect(useAdStore.getState().isAdFree()).toBe(false);
  });

  it('setAdFree(true) sets adFree to true', () => {
    useAdStore.getState().setAdFree(true);
    expect(useAdStore.getState().adFree).toBe(true);
  });

  it('isAdFree returns true after setAdFree(true)', () => {
    useAdStore.getState().setAdFree(true);
    expect(useAdStore.getState().isAdFree()).toBe(true);
  });

  it('setAdFree(false) sets adFree back to false', () => {
    useAdStore.getState().setAdFree(true);
    useAdStore.getState().setAdFree(false);
    expect(useAdStore.getState().adFree).toBe(false);
  });

  it('restorePurchase is a function', () => {
    expect(typeof useAdStore.getState().restorePurchase).toBe('function');
  });

  it('restorePurchase resolves without error', async () => {
    await expect(useAdStore.getState().restorePurchase()).resolves.toBeUndefined();
  });
});
