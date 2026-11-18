/**
 * Tooloqo ActionRecorder — Records user actions as replayable sequences.
 */

export interface RecordedAction {
  timestamp: number;
  method: string;
  input: unknown;
  result: { ok: boolean; error?: string };
}

export class ActionRecorder {
  private history: RecordedAction[] = [];
  private recording = true;

  record(method: string, input: unknown, result: { ok: boolean; error?: string }): void {
    if (!this.recording) return;
    this.history.push({ timestamp: Date.now(), method, input, result });
  }

  getHistory(): RecordedAction[] { return [...this.history]; }
  getSuccessful(): RecordedAction[] { return this.history.filter(a => a.result.ok); }
  clear(): void { this.history = []; }
  pause(): void { this.recording = false; }
  resume(): void { this.recording = true; }
  isRecording(): boolean { return this.recording; }

  toJSON(): string { return JSON.stringify(this.history, null, 2); }
  fromJSON(json: string): void {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) this.history = parsed;
  }
}
