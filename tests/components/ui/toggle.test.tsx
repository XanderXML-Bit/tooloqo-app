import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '@/components/ui/toggle';

describe('Toggle', () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
  };

  it('renders a switch role', () => {
    render(<Toggle {...defaultProps} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('shows aria-checked=false when unchecked', () => {
    render(<Toggle {...defaultProps} checked={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('shows aria-checked=true when checked', () => {
    render(<Toggle {...defaultProps} checked={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange on click', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked is true', () => {
    const onChange = vi.fn();
    render(<Toggle checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Toggle {...defaultProps} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('toggles on Enter key', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles on Space key', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders label when provided', () => {
    render(<Toggle {...defaultProps} label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Toggle {...defaultProps} label="Theme" description="Toggle dark mode" />);
    expect(screen.getByText('Toggle dark mode')).toBeInTheDocument();
  });

  it('sets aria-label from label prop', () => {
    render(<Toggle {...defaultProps} label="Enable notifications" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Enable notifications');
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Toggle {...defaultProps} size="sm" />);
      expect(container.querySelector('[class*="w-9"]')).toBeTruthy();
    });

    it('renders medium size (default)', () => {
      const { container } = render(<Toggle {...defaultProps} />);
      expect(container.querySelector('[class*="w-11"]')).toBeTruthy();
    });

    it('renders large size', () => {
      const { container } = render(<Toggle {...defaultProps} size="lg" />);
      expect(container.querySelector('[class*="w-14"]')).toBeTruthy();
    });
  });
});
