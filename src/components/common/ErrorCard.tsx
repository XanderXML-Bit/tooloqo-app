import { RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useScrollIntoView } from '@/hooks/useScrollIntoView';

interface ErrorCardProps {
  /** Error message to display */
  error: string;
  /** Callback when retry is clicked */
  onRetry: () => void;
  /** Custom retry button text */
  retryText?: string;
}

export function ErrorCard({ error, onRetry, retryText = 'Try Again' }: ErrorCardProps) {
  const ref = useScrollIntoView<HTMLDivElement>(error);
  return (
    <Card ref={ref} className="border-error/50 bg-error/5 animate-fade-in" role="alert">
      <CardContent className="p-4">
        <p className="text-error text-sm font-medium">{error}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry} aria-label={retryText}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          {retryText}
        </Button>
      </CardContent>
    </Card>
  );
}
