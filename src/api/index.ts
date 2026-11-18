/**
 * Tooloqo API Bridge — Headless programmatic interface for AI agents.
 */

export { AppBridge } from './AppBridge';
export { StateInspector } from './StateInspector';
export { ActionRecorder, type RecordedAction } from './ActionRecorder';

import { AppBridge } from './AppBridge';

export const bridge = AppBridge.getInstance();

if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__APP_BRIDGE = bridge;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__TOOLOQO = bridge;
}
