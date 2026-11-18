import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  variant?: 'default' | 'image' | 'pdf' | 'text' | 'media';
  className?: string;
}

const sizeConfig = {
  sm: {
    box: 'w-4 h-4',
    icon: 'w-2.5 h-2.5',
    strokeWidth: 3,
  },
  md: {
    box: 'w-5 h-5',
    icon: 'w-3 h-3',
    strokeWidth: 2.5,
  },
  lg: {
    box: 'w-6 h-6',
    icon: 'w-3.5 h-3.5',
    strokeWidth: 2,
  },
};

const variantColors = {
  default: 'bg-primary border-primary',
  image: 'bg-tool-image border-tool-image',
  pdf: 'bg-tool-pdf border-tool-pdf',
  text: 'bg-tool-text border-tool-text',
  media: 'bg-tool-media border-tool-media',
};

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  variant = 'default',
  className,
}: CheckboxProps) {
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

  const checkbox = (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0',
        'rounded-md border-2 cursor-pointer',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        config.box,
        checked
          ? variantColors[variant]
          : 'bg-transparent border-border hover:border-text-tertiary',
        checked && 'scale-100',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        // Spring bounce on check
        transform: checked ? 'scale(1)' : 'scale(1)',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, border-color 0.2s',
      }}
    >
      {/* Animated checkmark */}
      <svg
        className={cn(
          config.icon,
          'text-white',
          checked ? 'opacity-100' : 'opacity-0'
        )}
        viewBox="0 0 12 12"
        fill="none"
        style={{
          transition: 'opacity 0.15s ease-out',
        }}
      >
        <path
          d="M2 6L5 9L10 3"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={checked ? 'animate-draw-check' : ''}
          style={{
            strokeDasharray: 24,
            strokeDashoffset: checked ? 0 : 24,
          }}
        />
      </svg>
    </button>
  );

  if (label || description) {
    return (
      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
      >
        {checkbox}
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
      </label>
    );
  }

  return checkbox;
}
