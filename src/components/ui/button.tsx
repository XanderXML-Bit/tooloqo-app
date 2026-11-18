import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button component with Precision Tools styling
 * Features: gradient backgrounds, spring animations, category-aware variants
 */
const buttonVariants = cva(
  // Base styles with spring transition
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium tracking-tight',
    'transition-all duration-200',
    '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary - Gradient with glow on hover
        default: [
          'bg-gradient-to-r from-primary-500 to-primary-600',
          'text-white shadow-md',
          'hover:from-primary-400 hover:to-primary-500',
          'hover:shadow-[0_0_24px_rgba(51,120,255,0.35)]',
        ].join(' '),

        // Secondary - Elevated surface
        secondary: [
          'bg-surface-elevated text-text-primary',
          'border border-border',
          'hover:bg-surface-highlight hover:border-primary-500/30',
          'hover:shadow-sm',
        ].join(' '),

        // Outline - Transparent with border
        outline: [
          'border border-border bg-transparent',
          'text-text-primary',
          'hover:bg-surface-elevated hover:border-primary-500/40',
        ].join(' '),

        // Ghost - Minimal
        ghost: [
          'text-text-secondary',
          'hover:text-text-primary hover:bg-surface-highlight',
        ].join(' '),

        // Destructive - Red gradient
        destructive: [
          'bg-gradient-to-r from-error-500 to-error-600',
          'text-white shadow-md',
          'hover:from-error-400 hover:to-error-500',
          'hover:shadow-[0_0_24px_rgba(239,68,68,0.35)]',
        ].join(' '),

        // Premium - Gold gradient for monetization CTAs
        premium: [
          'bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600',
          'text-text-inverse font-semibold shadow-md',
          'hover:from-accent-300 hover:via-accent-400 hover:to-accent-500',
          'hover:shadow-[0_0_24px_rgba(251,191,36,0.4)]',
        ].join(' '),

        // Success - Green gradient
        success: [
          'bg-gradient-to-r from-success-500 to-success-600',
          'text-white shadow-md',
          'hover:from-success-400 hover:to-success-500',
          'hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]',
        ].join(' '),

        // Link - Text only
        link: [
          'text-primary-500 underline-offset-4',
          'hover:text-primary-400 hover:underline',
          'active:scale-100',
        ].join(' '),

        // Category variants for tool pages
        image: [
          'bg-gradient-to-r from-blue-500 to-blue-600',
          'text-white shadow-md',
          'hover:from-blue-400 hover:to-blue-500',
          'hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]',
        ].join(' '),

        pdf: [
          'bg-gradient-to-r from-red-500 to-red-600',
          'text-white shadow-md',
          'hover:from-red-400 hover:to-red-500',
          'hover:shadow-[0_0_24px_rgba(239,68,68,0.35)]',
        ].join(' '),

        media: [
          'bg-gradient-to-r from-purple-500 to-purple-600',
          'text-white shadow-md',
          'hover:from-purple-400 hover:to-purple-500',
          'hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]',
        ].join(' '),

        text: [
          'bg-gradient-to-r from-green-500 to-green-600',
          'text-white shadow-md',
          'hover:from-green-400 hover:to-green-500',
          'hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-lg [&_svg]:size-4',
        default: 'h-11 px-4 text-sm rounded-xl [&_svg]:size-4',
        lg: 'h-12 px-6 text-base rounded-xl [&_svg]:size-5',
        xl: 'h-14 px-8 text-base font-semibold rounded-2xl [&_svg]:size-5',
        icon: 'h-11 w-11 rounded-xl [&_svg]:size-5',
        'icon-sm': 'h-8 w-8 rounded-lg [&_svg]:size-4',
        'icon-lg': 'h-12 w-12 rounded-xl [&_svg]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show loading state */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
