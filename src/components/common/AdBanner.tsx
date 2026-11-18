import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Sparkles } from 'lucide-react';
import { useAdStore } from '@/stores/adStore';
import { cn } from '@/lib/utils';

export interface AdBannerProps {
  /** Ad slot identifier for future ad network integration */
  slot?: 'home' | 'tool-list' | 'tool-result' | 'settings';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Ad Banner Component
 *
 * Shows a placeholder ad banner for free users.
 * Hidden for users who have purchased ad-free mode.
 *
 * Styled to match the Industrial Premium design system.
 */
export function AdBanner({ slot = 'home', className }: AdBannerProps) {
  const isAdFree = useAdStore((state) => state.isAdFree());

  // The ad-free purchase is an in-app purchase, so the upsell only makes
  // sense in the native apps. Don't render on the web or for ad-free users.
  if (!Capacitor.isNativePlatform() || isAdFree) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-surface-elevated border border-border',
        'animate-fade-in',
        className
      )}
      data-ad-slot={slot}
    >
      {/* Ad label for FTC compliance */}
      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-text-tertiary/20 text-text-tertiary">
        Ad
      </div>

      {/* Placeholder content */}
      <Link
        to="/ad-free"
        className={cn(
          'flex items-center justify-center gap-3 p-4 min-h-[72px]',
          'transition-all duration-200',
          'hover:bg-surface-highlight'
        )}
      >
        {/* Gradient background accent */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.3), transparent 70%)',
          }}
        />

        {/* Icon */}
        <div className="relative p-2 rounded-lg bg-accent-500/10">
          <Sparkles className="h-5 w-5 text-accent-500" />
        </div>

        {/* Text */}
        <div className="relative flex-1">
          <p className="text-sm font-medium text-text-primary">
            Enjoying Tooloqo?
          </p>
          <p className="text-xs text-text-secondary">
            Go ad-free for just $2.99
          </p>
        </div>

        {/* CTA arrow */}
        <div className="relative text-accent-500 text-sm font-medium">
          &rarr;
        </div>
      </Link>
    </div>
  );
}
