import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Shared Zendren attribution footer.
 * The year is computed at runtime, never hard-coded.
 */
export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={cn(
        'relative z-10 px-4 py-6 text-center text-xs text-text-secondary',
        className
      )}
    >
      <p>
        © {year} Zendren · Built by{' '}
        <a
          href="https://xandermlopez.com"
          rel="author"
          className="inline-flex min-h-[44px] items-center align-middle underline underline-offset-2 hover:text-text-primary"
        >
          Xander M. Lopez
        </a>
      </p>
      <p className="mt-2 flex items-center justify-center gap-4">
        <a
          href="https://zendren.net"
          className="inline-flex min-h-[44px] items-center align-middle underline underline-offset-2 hover:text-text-primary"
        >
          zendren.net
        </a>
        <Link
          to="/privacy"
          className="inline-flex min-h-[44px] items-center align-middle underline underline-offset-2 hover:text-text-primary"
        >
          Privacy
        </Link>
      </p>
    </footer>
  );
}
