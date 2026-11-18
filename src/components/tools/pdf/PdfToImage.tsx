import { useState, useCallback, useEffect } from 'react';
import { Image as ImageIcon, Check, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { FilePreview } from '@/components/common/FilePreview';
import { DownloadButton, DownloadAllButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pdfService } from '@/services/pdfService';
import { feedback } from '@/services/feedbackService';
import { generateId } from '@/lib/utils';
import { getStaggerDelay } from '@/lib/animations';
import type { TooloqoFile } from '@/types';

type OutputFormat = 'png' | 'jpeg';

export function PdfToImage() {
  const [file, setFile] = useState<TooloqoFile | null>(null);
  const [processedFiles, setProcessedFiles] = useState<TooloqoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [pageCount, setPageCount] = useState(0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [scale, setScale] = useState(2);

  // Get page count when file is selected
  useEffect(() => {
    if (file) {
      pdfService.getPageCount(file.blob).then(setPageCount);
    }
  }, [file]);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setProcessedFiles([]);
      setError(null);
      setPageCount(0);
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;

    feedback.tap();


    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const images = await pdfService.pdfToImages(file.blob, {
        scale,
        format: outputFormat,
      });

      const baseName = file.originalName.replace('.pdf', '');
      const extension = outputFormat === 'png' ? '.png' : '.jpg';

      const results: TooloqoFile[] = await Promise.all(
        images.map(async (blob, i) => {
          setProgress(((i + 1) / images.length) * 100);

          // Generate thumbnail
          let thumbnail: string | undefined;
          try {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = url;
            });

            const canvas = document.createElement('canvas');
            const maxSize = 100;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            }
            URL.revokeObjectURL(url);
          } catch {
            // Thumbnail generation failed
          }

          return {
            id: generateId(),
            originalName: `${baseName}_page_${i + 1}${extension}`,
            mimeType: outputFormat === 'png' ? 'image/png' : 'image/jpeg',
            size: blob.size,
            blob,
            thumbnail,
            createdAt: new Date(),
          };
        })
      );

      setProcessedFiles(results);
    feedback.success();

    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Failed to convert PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProcessedFiles([]);
    setError(null);
    setPageCount(0);
  };

  return (
    <Layout title="PDF to Image" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="pdf"
          icon={ImageIcon}
          title="PDF to Image"
          description="Convert PDF pages to images"
        />

        {/* File Selection */}
        {!file && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['application/pdf']}
            maxFiles={1}
            category="pdf"
          />
        )}

        {/* Options */}
        {file && !isProcessing && processedFiles.length === 0 && (
          <>
            {/* File Info */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-text-tertiary font-mono tabular-nums">
                      {pageCount} page{pageCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <SectionTitle category="pdf">Output Format</SectionTitle>
                <div className="flex gap-2">
                  <Button
                    variant={outputFormat === 'png' ? 'pdf' : 'secondary'}
                    className="flex-1"
                    onClick={() => setOutputFormat('png')}
                  >
                    {outputFormat === 'png' && <Check className="h-3.5 w-3.5 mr-1.5" />}
                    PNG
                  </Button>
                  <Button
                    variant={outputFormat === 'jpeg' ? 'pdf' : 'secondary'}
                    className="flex-1"
                    onClick={() => setOutputFormat('jpeg')}
                  >
                    {outputFormat === 'jpeg' && <Check className="h-3.5 w-3.5 mr-1.5" />}
                    JPG
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quality/Scale Selection */}
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tool-pdf" />
                    Quality
                  </h3>
                  <span className="text-sm font-bold text-tool-pdf font-mono">{scale}x</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <Button
                      key={s}
                      variant={scale === s ? 'pdf' : 'secondary'}
                      className="flex-1"
                      onClick={() => setScale(s)}
                    >
                      {scale === s && <Check className="h-3.5 w-3.5 mr-1.5" />}
                      {s === 1 ? 'Low' : s === 2 ? 'Medium' : 'High'}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-text-tertiary mt-2">
                  Higher quality = larger file size
                </p>
              </CardContent>
            </Card>

            {/* Process Button */}
            <Button
              variant="pdf"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '250ms' }}
              onClick={handleProcess}
            >
              Convert {pageCount} Page{pageCount !== 1 ? 's' : ''} to Images
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && (
          <ProcessingIndicator
            progress={progress}
            message={`Converting page ${Math.ceil((progress / 100) * pageCount)} of ${pageCount}...`}
            category="pdf"
          />
        )}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Results */}
        {processedFiles.length > 0 && (
          <>
            {/* Success Header */}
            <SuccessCard icon={Check}>
              <SuccessMessage
                message="Converted to images"
                subtitle={`${processedFiles.length} image${processedFiles.length > 1 ? 's' : ''} created`}
              />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {processedFiles.map((f, index) => (
                    <div
                      key={f.id}
                      className="space-y-2 animate-slide-up opacity-0"
                      style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
                    >
                      <FilePreview file={f} isProcessed />
                      <DownloadButton file={f} variant="secondary" category="image" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {processedFiles.length > 1 && (
              <DownloadAllButton files={processedFiles} className="w-full" category="image" />
            )}

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Convert Another PDF
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
