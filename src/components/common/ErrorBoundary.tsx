import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4" role="alert" aria-live="assertive">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-text mb-2">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-6">
              An unexpected error occurred. Please try again.
            </p>
            {this.state.error && (
              <p className="text-xs text-text-secondary bg-surface rounded-lg p-3 mb-6 font-mono overflow-auto max-h-32">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button onClick={this.handleRefresh} aria-label="Refresh app">
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Refresh App
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
