import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    track: 'w-9 h-5',
    knob: 'w-4 h-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    knob: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    knob: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className,
}: ToggleProps) {
  const config = sizeConfig[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full',
        'transition-colors duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        config.track,
        checked
          ? 'bg-primary'
          : 'bg-surface-elevated border border-border',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Knob */}
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full',
          'shadow-elevation-2',
          'transition-transform duration-200',
          // Spring-like easing
          'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          config.knob,
          checked
            ? cn(config.translate, 'bg-white')
            : 'translate-x-0.5 bg-text-secondary',
          // Vertical centering
          'absolute top-1/2 -translate-y-1/2'
        )}
      />
    </button>
  );

  if (label || description) {
    return (
      <label
        className={cn(
          'flex items-center justify-between gap-3',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-secondary mt-0.5">
              {description}
            </span>
          )}
        </div>
        {toggle}
      </label>
    );
  }

  return toggle;
}
