import { memo } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  variant?: 'default' | 'subtle';
  /** Tool category for color theming: 'image' | 'pdf' | 'text' | 'media' */
  category?: 'image' | 'pdf' | 'text' | 'media';
}

const categoryColors = {
  image: {
    gradient: 'from-blue-500/20 to-blue-600/10',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.15)]',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  pdf: {
    gradient: 'from-red-500/20 to-red-600/10',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.15)]',
    icon: 'text-red-400',
    border: 'border-red-500/20',
  },
  text: {
    gradient: 'from-green-500/20 to-green-600/10',
    glow: 'shadow-[0_0_60px_rgba(34,197,94,0.15)]',
    icon: 'text-green-400',
    border: 'border-green-500/20',
  },
  media: {
    gradient: 'from-purple-500/20 to-purple-600/10',
    glow: 'shadow-[0_0_60px_rgba(168,85,247,0.15)]',
    icon: 'text-purple-400',
    border: 'border-purple-500/20',
  },
};

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  category = 'image',
}: EmptyStateProps) {
  const colors = categoryColors[category];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        'animate-fade-in',
        variant === 'subtle' && 'py-8'
      )}
    >
      {/* Animated icon with gradient orb background */}
      <div className="relative mb-6">
        {/* Gradient orb */}
        <div
          className={cn(
            'absolute inset-0 -m-4 rounded-full bg-gradient-to-br blur-2xl opacity-60',
            colors.gradient,
            colors.glow
          )}
          style={{ animationDelay: '100ms' }}
        />

        {/* Icon container */}
        <div
          className={cn(
            'relative w-16 h-16 rounded-2xl flex items-center justify-center',
            'bg-surface-elevated border',
            'animate-float',
            colors.border
          )}
        >
          <Icon className={cn('w-8 h-8', colors.icon)} strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-lg font-semibold text-text-primary mb-2',
          'animate-fade-in'
        )}
        style={{ animationDelay: '100ms' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'text-sm text-text-secondary max-w-[280px] leading-relaxed',
          'animate-fade-in'
        )}
        style={{ animationDelay: '150ms' }}
      >
        {description}
      </p>

      {/* Optional action button */}
      {action && (
        <div
          className="mt-6 animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <Button onClick={action.onClick} variant="default" size="default">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
});
