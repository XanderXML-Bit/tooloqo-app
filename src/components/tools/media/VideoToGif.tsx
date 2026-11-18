import { useState, useCallback, useEffect, useRef } from 'react';
import { Film, Check, RotateCcw, ArrowRight, Download, Play, Pause } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMetric } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { mediaService } from '@/services/mediaService';
import { useMediaEngine } from '@/hooks/useMediaEngine';
import { feedback } from '@/services/feedbackService';
import { formatFileSize, generateId } from '@/lib/utils';
import { showToast } from '@/components/common/Toast';
import type { TooloqoFile } from '@/types';

const FPS_OPTIONS: { value: 10 | 15 | 20 | 30; label: string }[] = [
  { value: 10, label: '10 fps' },
  { value: 15, label: '15 fps' },
  { value: 20, label: '20 fps' },
  { value: 30, label: '30 fps' },
];

const WIDTH_OPTIONS = [
  { value: 320, label: '320px' },
  { value: 480, label: '480px' },
  { value: 640, label: '640px' },
  { value: 800, label: '800px' },
];

export function VideoToGif() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [selectedFps, setSelectedFps] = useState<10 | 15 | 20 | 30>(15);
  const [selectedWidth, setSelectedWidth] = useState(480);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = useRef<string | null>(null);
  const gifPreviewUrl = useRef<string | null>(null);

  const { isLoadingFFmpeg, engineError, retryEngine } = useMediaEngine(file);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl.current) {
        URL.revokeObjectURL(videoUrl.current);
      }
      if (gifPreviewUrl.current) {
        URL.revokeObjectURL(gifPreviewUrl.current);
      }
    };
  }, []);

  const handleFilesSelected = useCallback(async (selectedFiles: TooloqoFile[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setProcessedFile(null);
      setError(null);

      // Clean up previous video URL
      if (videoUrl.current) {
        URL.revokeObjectURL(videoUrl.current);
      }

      // Create new video URL and get duration
      videoUrl.current = URL.createObjectURL(selectedFile.blob);

      try {
        const duration = await mediaService.getVideoDuration(selectedFile.blob);
        if (!duration || duration <= 0 || !isFinite(duration)) {
          setError('Unable to read video duration. The file may be corrupted or unsupported.');
          setFile(null);
          return;
        }
        setVideoDuration(duration);
        setStartTime(0);
        setEndTime(Math.min(5, duration));
      } catch {
        setError('Failed to read video metadata');
      }
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await mediaService.videoToGif(
        file.blob,
        {
          startTime,
          endTime,
          fps: selectedFps,
          width: selectedWidth,
        },
        (p) => setProgress(p)
      );

      const newName = file.originalName.replace(/\.[^.]+$/, '.gif');

      // Clean up previous GIF preview URL
      if (gifPreviewUrl.current) {
        URL.revokeObjectURL(gifPreviewUrl.current);
      }
      gifPreviewUrl.current = URL.createObjectURL(result.blob);

      setProcessedFile({
        id: generateId(),
        originalName: newName,
        mimeType: 'image/gif',
        size: result.blob.size,
        blob: result.blob,
        createdAt: new Date(),
      });

      showToast('GIF created successfully', 'success');
    feedback.success();

    } catch (err) {
      feedback.error();
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;

    const url = URL.createObjectURL(processedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = processedFile.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (videoUrl.current) {
      URL.revokeObjectURL(videoUrl.current);
      videoUrl.current = null;
    }
    setFile(null);
    setProcessedFile(null);
    setError(null);
    setProgress(0);
    setVideoDuration(0);
    setStartTime(0);
    setEndTime(5);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Keep video playback within selected range
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        if (!isPlaying) {
          video.pause();
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startTime, endTime, isPlaying]);

  const clipDuration = endTime - startTime;

  return (
    <Layout title="Video to GIF" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="media"
          icon={Film}
          title="Video to GIF"
          description="Convert video clips to animated GIFs"
        />

        {isLoadingFFmpeg && (
          <Card className="border-tool-media/30">
            <CardContent className="p-4" role="status">
              <p className="text-sm text-text-secondary">Loading media engine...</p>
              <p className="text-xs text-text-tertiary mt-2">
                First use downloads about 32 MB. Your file stays on your device.
              </p>
            </CardContent>
          </Card>
        )}
        {engineError && <ErrorCard error={engineError} onRetry={retryEngine} retryText="Try again" />}

        {/* File Selection */}
        {!file && !isLoadingFFmpeg && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['video/mp4', 'video/webm', 'video/quicktime']}
            maxFiles={1}
            category="media"
          />
        )}

        {/* Options */}
        {file && !isProcessing && !processedFile && !isLoadingFFmpeg && !engineError && (
          <>
            {/* Video Preview */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '50ms' }}>
              <CardContent className="p-4">
                <div className="relative rounded-lg overflow-hidden bg-black mb-3">
                  <video
                    ref={videoRef}
                    src={videoUrl.current || undefined}
                    className="w-full max-h-48 object-contain"
                    muted
                    playsInline
                  />
                  <button
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause video preview' : 'Play video preview'}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-12 h-12 text-white" />
                    ) : (
                      <Play className="w-12 h-12 text-white" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary truncate max-w-48">
                    {file.originalName}
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="media">
                  Clip Duration ({clipDuration.toFixed(1)}s)
                </SectionTitle>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-text-tertiary mb-2">
                      <span>Start: {startTime.toFixed(1)}s</span>
                      <span>End: {endTime.toFixed(1)}s</span>
                    </div>
                    <Slider
                      value={[startTime, endTime]}
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      onValueChange={([start, end]) => {
                        setStartTime(start);
                        setEndTime(end);
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Max recommended: 10 seconds for reasonable GIF size
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FPS Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="media">Frame Rate</SectionTitle>
                <div className="grid grid-cols-4 gap-2">
                  {FPS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedFps === option.value ? 'media' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedFps(option.value)}
                    >
                      {selectedFps === option.value && <Check className="h-3 w-3 mr-1" />}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Width Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="media">Output Width</SectionTitle>
                <div className="grid grid-cols-4 gap-2">
                  {WIDTH_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedWidth === option.value ? 'media' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedWidth(option.value)}
                    >
                      {selectedWidth === option.value && <Check className="h-3 w-3 mr-1" />}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Convert Button */}
            <Button
              variant="media"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '250ms' }}
              onClick={handleProcess}
            >
              Create GIF
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message="Creating GIF..."
            category="media"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFile && (
          <>
            <SuccessCard icon={Film}>
              <SuccessMetric
                value={`${clipDuration.toFixed(1)}s`}
                label="GIF created"
                sublabel={formatFileSize(processedFile.size)}
              />
            </SuccessCard>

            {/* GIF Preview */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="rounded-lg overflow-hidden bg-surface-highlight mb-4">
                  <img
                    src={gifPreviewUrl.current ?? ''}
                    alt="Generated GIF"
                    className="w-full max-h-48 object-contain"
                  />
                </div>

                <Button
                  variant="media"
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download GIF
                </Button>
              </CardContent>
            </Card>

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Create Another GIF
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
