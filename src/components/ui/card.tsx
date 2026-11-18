import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type CardCategory = 'image' | 'pdf' | 'media' | 'text' | null;

/**
 * Card component with Precision Tools styling
 * Supports category-aware theming for tool-specific colors
 */
const cardVariants = cva(
  'rounded-xl border transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      variant: {
        // Default - Standard elevated card
        default: 'border-border bg-surface-elevated shadow-sm',

        // Elevated - More prominent with gradient
        elevated: [
          'border-border/50',
          'bg-gradient-to-b from-surface-elevated to-surface',
          'shadow-lg',
        ].join(' '),

        // Interactive - Clickable card with hover states
        interactive: [
          'border-border bg-surface-elevated shadow-sm cursor-pointer',
          'hover:shadow-md hover:scale-[1.02]',
          'active:scale-[0.99]',
        ].join(' '),

        // Glass - Glassmorphism effect
        glass: [
          'border-white/10',
          'bg-surface-elevated/80 backdrop-blur-lg',
          'shadow-lg',
        ].join(' '),

        // Premium - Gold accent for premium content
        premium: [
          'border-accent-500/30',
          'bg-gradient-to-br from-surface-elevated via-surface to-surface-elevated',
          'shadow-md hover:border-accent-500/50 hover:shadow-glow-accent',
        ].join(' '),

        // Ghost - Minimal/borderless
        ghost: 'border-transparent bg-transparent',

        // Outline - Just border, no background
        outline: 'border-border bg-transparent hover:bg-surface-elevated/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Category-specific hover styles
const categoryHoverStyles: Record<NonNullable<CardCategory>, string> = {
  image: 'hover:border-tool-image/40 hover:shadow-glow-image',
  pdf: 'hover:border-tool-pdf/40 hover:shadow-glow-pdf',
  media: 'hover:border-tool-media/40 hover:shadow-glow-media',
  text: 'hover:border-tool-text/40 hover:shadow-glow-text',
};

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Tool category for themed hover effects */
  category?: CardCategory;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, category, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, className }),
        category && categoryHoverStyles[category]
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-tight tracking-tight text-text-primary',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

/* eslint-disable react-refresh/only-export-components */
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
/* eslint-enable react-refresh/only-export-components */
