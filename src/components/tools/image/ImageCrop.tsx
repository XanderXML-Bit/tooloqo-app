import { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop as CropIcon, Check, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { DownloadButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { imageService } from '@/services/imageService';
import { feedback } from '@/services/feedbackService';
import { generateId } from '@/lib/utils';
import type { TooloqoFile } from '@/types';

const ASPECT_RATIOS = [
  { id: 'free', label: 'Free', value: undefined },
  { id: 'square', label: '1:1', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '3:2', label: '3:2', value: 3 / 2 },
  { id: '9:16', label: '9:16', value: 9 / 16 },
];

export function ImageCrop() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspect, setSelectedAspect] = useState('free');
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cleanup imageUrl when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  // Cleanup result preview URL when processedFile changes or component unmounts
  useEffect(() => {
    if (processedFile) {
      const url = URL.createObjectURL(processedFile.blob);
      setResultPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setResultPreviewUrl(null);
    }
  }, [processedFile]);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      // Revoke old URL to prevent memory leak
      setImageUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(selectedFile.blob);
      });
      setFile(selectedFile);
      setProcessedFile(null);
      setError(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, []);

  const handleAspectChange = (aspectId: string) => {
    setSelectedAspect(aspectId);
    const aspect = ASPECT_RATIOS.find((a) => a.id === aspectId);
    if (aspect?.value && imgRef.current) {
      const { width, height } = imgRef.current;
      const cropWidth = Math.min(width, height * aspect.value);
      const cropHeight = cropWidth / aspect.value;
      setCrop({
        unit: 'px',
        x: (width - cropWidth) / 2,
        y: (height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
    }
  };

  const handleProcess = async () => {
    if (!file || !completedCrop || !imgRef.current) return;

    feedback.tap();
    setIsProcessing(true);
    setError(null);

    try {
      // Calculate actual crop coordinates based on displayed vs natural image size
      const displayedWidth = imgRef.current.width;
      const displayedHeight = imgRef.current.height;
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;

      const scaleX = naturalWidth / displayedWidth;
      const scaleY = naturalHeight / displayedHeight;

      const actualCrop = {
        x: Math.round(completedCrop.x * scaleX),
        y: Math.round(completedCrop.y * scaleY),
        width: Math.round(completedCrop.width * scaleX),
        height: Math.round(completedCrop.height * scaleY),
      };

      const croppedBlob = await imageService.crop(file.blob, actualCrop);
      const thumbnail = await imageService.generateThumbnail(croppedBlob);

      setProcessedFile({
        id: generateId(),
        originalName: file.originalName.replace(/(\.[^.]+)$/, '_cropped$1'),
        mimeType: croppedBlob.type,
        size: croppedBlob.size,
        blob: croppedBlob,
        thumbnail,
        createdAt: new Date(),
      });
      feedback.success();
    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Cropping failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setFile(null);
    setImageUrl(null);
    setProcessedFile(null);
    setError(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const aspect = ASPECT_RATIOS.find((a) => a.id === selectedAspect)?.value;

  return (
    <Layout title="Image Crop" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="image"
          icon={CropIcon}
          title="Crop Image"
          description="Select and extract any portion"
        />

        {/* File Selection */}
        {!file && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
            maxFiles={1}
            category="image"
          />
        )}

        {/* Crop Interface */}
        {file && imageUrl && !isProcessing && !processedFile && (
          <>
            {/* Aspect Ratio Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="image">Aspect Ratio</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <Button
                      key={ratio.id}
                      variant={selectedAspect === ratio.id ? 'image' : 'secondary'}
                      size="sm"
                      onClick={() => handleAspectChange(ratio.id)}
                    >
                      {selectedAspect === ratio.id && <Check className="h-3 w-3 mr-1" />}
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crop Area */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tool-image" />
                    Drag to crop
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Change Image
                  </Button>
                </div>
                <div className="bg-black/50 rounded-xl overflow-hidden border border-border/30">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    className="max-h-[400px]"
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Crop preview"
                      className="max-h-[400px] w-auto mx-auto"
                      crossOrigin="anonymous"
                    />
                  </ReactCrop>
                </div>
              </CardContent>
            </Card>

            {/* Process Button */}
            <Button
              variant="image"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '200ms' }}
              onClick={handleProcess}
              disabled={!completedCrop || completedCrop.width === 0}
            >
              <CropIcon className="h-4 w-4 mr-2" />
              Crop Image
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && <ProcessingIndicator message="Cropping image..." category="image" />}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Result */}
        {processedFile && (
          <>
            {/* Success Header */}
            <SuccessCard icon={Check}>
              <SuccessMessage message="Image cropped successfully" />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
                  Cropped Image
                </h3>
                <div className="rounded-xl overflow-hidden bg-surface-highlight mb-4 border border-border/30">
                  {resultPreviewUrl && (
                    <img
                      src={resultPreviewUrl}
                      alt="Cropped result"
                      className="max-h-[300px] w-auto mx-auto"
                    />
                  )}
                </div>
                <DownloadButton file={processedFile} category="image" />
              </CardContent>
            </Card>

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Crop Another Image
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
