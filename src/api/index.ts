/**
 * Tooloqo API Bridge — Headless programmatic interface for AI agents.
 */

export { AppBridge } from './AppBridge';
export { StateInspector } from './StateInspector';
export { ActionRecorder, type RecordedAction } from './ActionRecorder';

import { AppBridge } from './AppBridge';

export const bridge = AppBridge.getInstance();

declare global {
  interface Window {
    __TOOLOQO?: AppBridge;
  }
}

if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.__TOOLOQO = bridge;
}
