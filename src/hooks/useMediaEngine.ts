import { useEffect, useState } from 'react';
import { mediaService } from '@/services/mediaService';

/** Load the shared engine only while a selected file needs it. */
export function useMediaEngine(file: object | null) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    file: object | null;
    attempt: number;
    error: string | null;
  } | null>(null);
  const current = result?.file === file && result?.attempt === attempt ? result : null;
  const engineError = current?.error ?? null;
  const isLoadingFFmpeg = !!file && !current && !mediaService.isFFmpegLoaded();

  useEffect(() => {
    if (!file) return;
    let active = true;
    mediaService.loadFFmpeg().then(
      () => { if (active) setResult({ file, attempt, error: null }); },
      (error: unknown) => {
        if (active) setResult({ file, attempt, error: error instanceof Error ? error.message : String(error) });
      }
    );
    return () => { active = false; };
  }, [file, attempt]);

  return { isLoadingFFmpeg, engineError, retryEngine: () => setAttempt((value) => value + 1) };
}
