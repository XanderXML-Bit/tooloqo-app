import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { TooloqoMark } from '@/components/layout/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SkipLink, MAIN_CONTENT_ID } from '@/components/layout/SkipLink';

/**
 * 404 Not Found page
 */
export function NotFound() {
  return (
    <div className="h-screen h-dvh overflow-y-auto bg-background flex flex-col">
      <SkipLink />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 flex items-center justify-center p-4 focus:outline-none">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-6">
          <TooloqoMark className="h-12 w-12 opacity-30" />
        </div>

        <h1 className="text-6xl font-bold text-text-tertiary font-mono tabular-nums mb-2">
          404
        </h1>
        <h2 className="text-lg font-semibold text-text-primary mb-2 tracking-tight">
          Page not found
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/" className={buttonVariants({ variant: 'default' })}>
            <Home className="h-4 w-4 mr-2" aria-hidden="true" />
            Go Home
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
