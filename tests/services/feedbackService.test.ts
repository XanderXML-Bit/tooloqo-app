import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playSound, vibrate, feedback, initAudio } from '@/services/feedbackService';

// Mock AudioContext
const mockOscillator = {
  frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};
const mockGainNode = {
  gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
};
const mockAudioCtx = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioCtx));

// Mock navigator.vibrate
const vibrateMock = vi.fn();
vi.stubGlobal('navigator', { ...navigator, vibrate: vibrateMock });

describe('feedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initAudio', () => {
    it('creates AudioContext', () => {
      initAudio();
      expect(AudioContext).toHaveBeenCalled();
    });
  });

  describe('playSound', () => {
    it('plays click sound', () => {
      initAudio();
      playSound('click');
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('plays success sound', () => {
      initAudio();
      playSound('success');
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalled();
    });

    it('plays error sound', () => {
      initAudio();
      playSound('error');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays delete sound', () => {
      initAudio();
      playSound('delete');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('plays toggle sound', () => {
      initAudio();
      playSound('toggle');
      expect(mockOscillator.start).toHaveBeenCalled();
    });
  });

  describe('vibrate', () => {
    it('calls navigator.vibrate for light', () => {
      vibrate('light');
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('calls navigator.vibrate for medium', () => {
      vibrate('medium');
      expect(vibrateMock).toHaveBeenCalledWith(20);
    });

    it('calls navigator.vibrate for heavy', () => {
      vibrate('heavy');
      expect(vibrateMock).toHaveBeenCalledWith(40);
    });

    it('calls navigator.vibrate for success', () => {
      vibrate('success');
      expect(vibrateMock).toHaveBeenCalledWith([10, 50, 20]);
    });

    it('calls navigator.vibrate for error', () => {
      vibrate('error');
      expect(vibrateMock).toHaveBeenCalledWith([50, 30, 50]);
    });
  });

  describe('feedback shortcuts', () => {
    it('tap combines click + light vibrate', () => {
      initAudio();
      feedback.tap();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('success combines sound + vibrate', () => {
      initAudio();
      feedback.success();
      expect(vibrateMock).toHaveBeenCalledWith([10, 50, 20]);
    });

    it('error combines sound + vibrate', () => {
      initAudio();
      feedback.error();
      expect(vibrateMock).toHaveBeenCalledWith([50, 30, 50]);
    });

    it('delete combines sound + vibrate', () => {
      initAudio();
      feedback.delete();
      expect(vibrateMock).toHaveBeenCalledWith(20);
    });

    it('toggle combines sound + vibrate', () => {
      initAudio();
      feedback.toggle();
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });
  });
});
