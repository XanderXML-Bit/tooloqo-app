import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdStoreState {
  /** Whether the user has purchased ad-free mode */
  adFree: boolean;

  /** Check if user is ad-free */
  isAdFree: () => boolean;

  /** Set ad-free status */
  setAdFree: (value: boolean) => void;

  /** Restore purchase from storage/payment provider */
  restorePurchase: () => Promise<void>;
}

export const useAdStore = create<AdStoreState>()(
  persist(
    (set, get) => ({
      adFree: false,

      isAdFree: () => get().adFree,

      setAdFree: (value: boolean) => set({ adFree: value }),

      restorePurchase: async () => {
        // TODO: Integrate with RevenueCat/payment provider for purchase restoration
        // This is a placeholder for the actual implementation
        // Restore purchase - to be implemented with payment provider
      },
    }),
    {
      name: 'tooloqo-ad-free',
    }
  )
);
