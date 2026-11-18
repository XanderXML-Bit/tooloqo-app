import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Slider } from '@/components/ui/slider';

describe('Slider', () => {
  const defaultProps = {
    value: [10, 90],
    min: 0,
    max: 100,
    onValueChange: vi.fn(),
  };

  it('renders the slider', () => {
    const { container } = render(<Slider {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders two thumbs', () => {
    const { container } = render(<Slider {...defaultProps} />);
    // Two thumb elements (cursor-grab divs)
    const thumbs = container.querySelectorAll('[class*="cursor-grab"]');
    expect(thumbs.length).toBe(2);
  });

  it('renders track background', () => {
    const { container } = render(<Slider {...defaultProps} />);
    const track = container.querySelector('[class*="bg-surface-highlight"]');
    expect(track).toBeTruthy();
  });

  it('renders selected range indicator', () => {
    const { container } = render(<Slider {...defaultProps} />);
    const range = container.querySelector('[class*="bg-tool-media"]');
    expect(range).toBeTruthy();
  });

  it('applies disabled styling', () => {
    const { container } = render(<Slider {...defaultProps} disabled />);
    expect((container.firstChild as HTMLElement).className).toContain('opacity-50');
  });

  it('does not start dragging when disabled', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Slider {...defaultProps} disabled onValueChange={onValueChange} />
    );
    const thumbs = container.querySelectorAll('[class*="cursor-grab"]');
    fireEvent.mouseDown(thumbs[0]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('positions thumbs based on values', () => {
    const { container } = render(
      <Slider {...defaultProps} value={[25, 75]} />
    );
    const thumbs = container.querySelectorAll('[class*="cursor-grab"]');
    const startStyle = (thumbs[0] as HTMLElement).style.left;
    const endStyle = (thumbs[1] as HTMLElement).style.left;
    expect(startStyle).toBe('25%');
    expect(endStyle).toBe('75%');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <Slider {...defaultProps} className="custom-slider" />
    );
    expect((container.firstChild as HTMLElement).className).toContain('custom-slider');
  });
});
