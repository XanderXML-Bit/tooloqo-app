import { useState, useCallback } from 'react';
import { Layers, Check, RotateCcw, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FileDropzone } from '@/components/common/FileDropzone';
import { ProcessingIndicator } from '@/components/common/ProcessingIndicator';
import { FilePreview } from '@/components/common/FilePreview';
import { DownloadButton } from '@/components/common/DownloadButton';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorCard } from '@/components/common/ErrorCard';
import { SuccessCard, SuccessMessage } from '@/components/common/SuccessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pdfService } from '@/services/pdfService';
import { feedback } from '@/services/feedbackService';
import { generateId } from '@/lib/utils';
import type { TooloqoFile } from '@/types';

export function PdfMerge() {
  const [files, setFiles] = useState<TooloqoFile[]>([]);
  const [processedFile, setProcessedFile] = useState<TooloqoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: TooloqoFile[]) => {
    setFiles(selectedFiles);
    setProcessedFile(null);
    setError(null);
  }, []);

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const handleProcess = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    feedback.tap();


    setIsProcessing(true);
    setError(null);

    try {
      const blobs = files.map((f) => f.blob);
      const mergedBlob = await pdfService.merge(blobs);

      let thumbnail: string | undefined;
      try {
        thumbnail = await pdfService.generateThumbnail(mergedBlob);
      } catch {
        // Thumbnail generation failed, continue without it
      }

      setProcessedFile({
        id: generateId(),
        originalName: 'merged.pdf',
        mimeType: 'application/pdf',
        size: mergedBlob.size,
        blob: mergedBlob,
        thumbnail,
        createdAt: new Date(),
      });
    feedback.success();

    } catch (err) {
      feedback.error();
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedFile(null);
    setError(null);
  };

  return (
    <Layout title="PDF Merge" showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <ToolHeader
          category="pdf"
          icon={Layers}
          title="Merge PDFs"
          description="Combine multiple PDFs into one"
        />

        {/* File Selection */}
        {files.length === 0 && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptedMimeTypes={['application/pdf']}
            maxFiles={20}
            category="pdf"
          />
        )}

        {/* File List with Reordering */}
        {files.length > 0 && !isProcessing && !processedFile && (
          <>
            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    <span className="font-mono text-tool-pdf">{files.length}</span> {files.length === 1 ? 'PDF' : 'PDFs'} selected
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-text-tertiary">
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-text-tertiary mb-3">
                  Reorder PDFs below. They will be merged in this order.
                </p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-3 bg-surface-highlight rounded-xl border border-border/30"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => moveFile(index, index - 1)}
                          aria-label={`Move ${file.originalName} up`}
                        >
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === files.length - 1}
                          onClick={() => moveFile(index, index + 1)}
                          aria-label={`Move ${file.originalName} down`}
                        >
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <span className="text-sm font-bold text-tool-pdf w-6 font-mono">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {file.originalName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-tertiary hover:text-error"
                        onClick={() =>
                          setFiles((prev) => prev.filter((f) => f.id !== file.id))
                        }
                        aria-label={`Remove ${file.originalName}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="pdf"
              size="xl"
              className="w-full animate-fade-in"
              style={{ animationDelay: '150ms' }}
              onClick={handleProcess}
              disabled={files.length < 2}
            >
              {files.length < 2 ? 'Merge needs at least 2 PDFs' : `Merge ${files.length} PDFs`}
            </Button>
          </>
        )}

        {/* Processing */}
        {isProcessing && <ProcessingIndicator message="Merging PDFs..." category="pdf" />}

        {/* Error */}
        {error && <ErrorCard error={error} onRetry={handleReset} />}

        {/* Result */}
        {processedFile && (
          <>
            {/* Success Header */}
            <SuccessCard icon={Check}>
              <SuccessMessage message="PDFs merged successfully" />
            </SuccessCard>

            <Card className="animate-card-reveal opacity-0" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">
                  Merged PDF
                </h3>
                <FilePreview file={processedFile} isProcessed />
                <div className="mt-3">
                  <DownloadButton file={processedFile} category="pdf" />
                </div>
              </CardContent>
            </Card>

            <Button variant="secondary" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Merge More PDFs
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
