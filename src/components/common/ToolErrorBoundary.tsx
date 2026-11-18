import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  toolName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Per-tool error boundary that catches rendering errors within a single tool view.
 * Unlike the app-level ErrorBoundary, this provides a scoped recovery UI
 * that lets users go back or retry without losing the entire app state.
 */
export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ToolErrorBoundary [${this.props.toolName ?? 'unknown'}]:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-4" role="alert" aria-live="assertive">
          <div className="max-w-md mx-auto pt-20">
            <Card className="border-error/30 animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-error" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-2">
                  {this.props.toolName ? `${this.props.toolName} encountered an error` : 'Something went wrong'}
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  An unexpected error occurred while using this tool. Your other tools are unaffected.
                </p>
                {this.state.error && (
                  <p className="text-xs text-text-tertiary bg-surface rounded-lg p-3 mb-4 font-mono text-left overflow-auto max-h-24">
                    {this.state.error.message}
                  </p>
                )}
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="sm" onClick={this.handleGoBack} aria-label="Go back to previous page">
                    <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Go Back
                  </Button>
                  <Button size="sm" onClick={this.handleRetry} aria-label="Try again">
                    <RotateCcw className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
