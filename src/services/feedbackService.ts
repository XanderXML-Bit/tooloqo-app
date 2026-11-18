/**
 * Feedback service for sound and haptic feedback
 * Following the lumoqo pattern for user feedback
 */

// Cached settings to avoid localStorage thrashing
interface FeedbackSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  volume: number;
}

let feedbackCache: FeedbackSettings | null = null;
let feedbackCacheTime = 0;
const FEEDBACK_CACHE_TTL = 5000;

// Audio context (lazy initialized)
let audioCtx: AudioContext | null = null;

/**
 * Initialize audio context (call on user interaction)
 */
export function initAudio(): void {
  if (!audioCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Audio Context not supported:', e);
    }
  }
}

/**
 * Get cached feedback settings
 */
function getFeedbackSettings(): FeedbackSettings {
  const now = Date.now();
  if (feedbackCache && now - feedbackCacheTime < FEEDBACK_CACHE_TTL) {
    return feedbackCache;
  }

  // Default settings
  feedbackCache = {
    soundEnabled: true,
    hapticsEnabled: true,
    volume: 0.5,
  };
  feedbackCacheTime = now;
  return feedbackCache;
}

/**
 * Play a synthesized sound effect
 */
export function playSound(type: 'click' | 'success' | 'error' | 'delete' | 'toggle'): void {
  const settings = getFeedbackSettings();
  if (!settings.soundEnabled || !audioCtx) return;

  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const volume = settings.volume * 0.3; // Scale down for comfort
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.05);
        break;

      case 'success':
        oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
        break;

      case 'error':
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
        break;

      case 'delete':
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.15);
        break;

      case 'toggle':
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.08);
        break;
    }
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}

/**
 * Trigger haptic feedback
 */
export function vibrate(pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void {
  const settings = getFeedbackSettings();
  if (!settings.hapticsEnabled) return;

  if (!navigator.vibrate) return;

  try {
    switch (pattern) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([10, 50, 20]);
        break;
      case 'error':
        navigator.vibrate([50, 30, 50]);
        break;
    }
  } catch (e) {
    console.warn('Vibration failed:', e);
  }
}

/**
 * Combined feedback for common actions
 */
export const feedback = {
  tap: () => {
    playSound('click');
    vibrate('light');
  },
  success: () => {
    playSound('success');
    vibrate('success');
  },
  error: () => {
    playSound('error');
    vibrate('error');
  },
  delete: () => {
    playSound('delete');
    vibrate('medium');
  },
  toggle: () => {
    playSound('toggle');
    vibrate('light');
  },
};
