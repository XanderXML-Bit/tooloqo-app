import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input component with Precision Tools styling
 * Features: enhanced focus glow, spring transitions, monospace option
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Use monospace font (for dimensions, file sizes, etc.) */
  mono?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mono, ...props }, ref) => {
    const useMonospace = mono || type === 'number' || type === 'tel';

    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-11 w-full rounded-xl px-4 py-2 text-sm',

          // Colors
          'border border-border bg-surface-elevated text-text-primary',
          'placeholder:text-text-tertiary',

          // Focus state with enhanced glow
          'focus:outline-none',
          'focus:ring-2 focus:ring-primary-500/25',
          'focus:border-primary-500/60',
          'focus:bg-surface',
          'focus:shadow-[0_0_16px_rgba(51,120,255,0.15)]',

          // Hover state
          'hover:border-border/80',

          // File input styling
          'file:border-0 file:bg-primary-500 file:text-white',
          'file:font-medium file:text-sm file:mr-3 file:px-3 file:py-1.5',
          'file:rounded-lg file:cursor-pointer',
          'file:hover:bg-primary-600 file:transition-colors',

          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',

          // Transition with spring feel
          'transition-all duration-200',
          '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',

          // Monospace font for technical values
          useMonospace && 'font-mono tabular-nums',

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

/**
 * Textarea component with matching styling
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Use monospace font */
  mono?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          'flex min-h-[120px] w-full rounded-xl px-4 py-3 text-sm',

          // Colors
          'border border-border bg-surface-elevated text-text-primary',
          'placeholder:text-text-tertiary',

          // Focus state with enhanced glow
          'focus:outline-none',
          'focus:ring-2 focus:ring-primary-500/25',
          'focus:border-primary-500/60',
          'focus:bg-surface',
          'focus:shadow-[0_0_16px_rgba(51,120,255,0.15)]',

          // Hover state
          'hover:border-border/80',

          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',

          // Resize
          'resize-none',

          // Transition with spring feel
          'transition-all duration-200',
          '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',

          // Monospace font
          mono && 'font-mono',

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

/**
 * Label component for form fields
 */
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium text-text-primary tracking-tight',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Input, Textarea, Label };
