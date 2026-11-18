import { ChevronLeft, Settings, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

/**
 * Tooloqo Brand Mark - The Modular Grid
 * 2x2 grid with rotated corner representing transformation
 */
function TooloqoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('brand-mark', className)}
      role="img"
      aria-label="Tooloqo logo"
    >
      <defs>
        <linearGradient id="headerBrandGradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#599dff" />
          <stop offset="100%" stopColor="#3378ff" />
        </linearGradient>
      </defs>
      {/* Bottom-left square */}
      <rect x="2" y="18" width="12" height="12" rx="2.5" fill="url(#headerBrandGradient)" />
      {/* Bottom-right square */}
      <rect x="18" y="18" width="12" height="12" rx="2.5" fill="url(#headerBrandGradient)" />
      {/* Top-left square */}
      <rect x="2" y="2" width="12" height="12" rx="2.5" fill="url(#headerBrandGradient)" />
      {/* Top-right diamond (rotated) */}
      <rect
        x="18"
        y="2"
        width="10"
        height="10"
        rx="2"
        fill="url(#headerBrandGradient)"
        transform="rotate(45 23 7)"
      />
    </svg>
  );
}

/**
 * Header component with Precision Tools styling
 * Features: brand mark + wordmark lockup, glassmorphism, animated back button
 */
export function Header({ title = 'Tooloqo', showBack, onBack }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 safe-area-top',
        'border-b border-border/50',
        'glass shadow-sm'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        {/* Left: Back button or spacer */}
        {showBack && onBack ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="group -ml-2"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
          </Button>
        ) : (
          <div className="w-8" />
        )}

        {/* Center: Brand lockup or page title */}
        {isHome ? (
          <Link to="/" className="flex items-center gap-2.5 group">
            <TooloqoMark className="h-7 w-7 transition-transform duration-300 group-hover:scale-105" />
            {/* The home hero carries the page h1; the header wordmark is not a heading here. */}
            <span className="font-display-face text-xl font-semibold tracking-tight text-gradient-primary">
              Tooloqo
            </span>
          </Link>
        ) : (
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5">
          {Capacitor.isNativePlatform() && (
            <Link
              to="/ad-free"
              aria-label="Go ad-free"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                'text-accent-500 hover:text-accent-400 hover:bg-accent-500/10'
              )}
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
          <Link
            to="/settings"
            aria-label="Settings"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
              'text-text-secondary hover:text-text-primary'
            )}
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export { TooloqoMark };
