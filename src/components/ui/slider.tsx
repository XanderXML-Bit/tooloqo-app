import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Dual-thumb slider for selecting a range
 * Used for video clip time selection
 */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  className,
  disabled = false,
}: SliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState<'start' | 'end' | null>(null);

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPosition = React.useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(max, Math.max(min, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = (e: React.MouseEvent, thumb: 'start' | 'end') => {
    if (disabled) return;
    e.preventDefault();
    setDragging(thumb);
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      const [start, end] = value;

      if (dragging === 'start') {
        if (newValue < end) {
          onValueChange([newValue, end]);
        }
      } else {
        if (newValue > start) {
          onValueChange([start, newValue]);
        }
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, value, onValueChange, getValueFromPosition]);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent, thumb: 'start' | 'end') => {
    if (disabled) return;
    e.preventDefault();
    setDragging(thumb);
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const newValue = getValueFromPosition(touch.clientX);
      const [start, end] = value;

      if (dragging === 'start') {
        if (newValue < end) {
          onValueChange([newValue, end]);
        }
      } else {
        if (newValue > start) {
          onValueChange([start, newValue]);
        }
      }
    };

    const handleTouchEnd = () => {
      setDragging(null);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, value, onValueChange, getValueFromPosition]);

  const startPercent = getPercentage(value[0]);
  const endPercent = getPercentage(value[1]);

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative h-6 flex items-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Track background */}
      <div className="absolute inset-x-0 h-2 rounded-full bg-surface-highlight" />

      {/* Selected range */}
      <div
        className="absolute h-2 rounded-full bg-tool-media"
        style={{
          left: `${startPercent}%`,
          right: `${100 - endPercent}%`,
        }}
      />

      {/* Start thumb */}
      <div
        className={cn(
          'absolute w-5 h-5 rounded-full bg-white border-2 border-tool-media',
          'transform -translate-x-1/2 cursor-grab shadow-md',
          'hover:scale-110 transition-transform',
          dragging === 'start' && 'cursor-grabbing scale-110'
        )}
        style={{ left: `${startPercent}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'start')}
        onTouchStart={(e) => handleTouchStart(e, 'start')}
      />

      {/* End thumb */}
      <div
        className={cn(
          'absolute w-5 h-5 rounded-full bg-white border-2 border-tool-media',
          'transform -translate-x-1/2 cursor-grab shadow-md',
          'hover:scale-110 transition-transform',
          dragging === 'end' && 'cursor-grabbing scale-110'
        )}
        style={{ left: `${endPercent}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'end')}
        onTouchStart={(e) => handleTouchStart(e, 'end')}
      />
    </div>
  );
}
