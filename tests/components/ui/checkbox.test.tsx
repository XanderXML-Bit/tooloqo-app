import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
  };

  it('renders a checkbox role', () => {
    render(<Checkbox {...defaultProps} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('shows aria-checked=false when unchecked', () => {
    render(<Checkbox {...defaultProps} checked={false} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('shows aria-checked=true when checked', () => {
    render(<Checkbox {...defaultProps} checked={true} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange on click', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked is true', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox {...defaultProps} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('toggles on Enter key', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles on Space key', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders label when provided', () => {
    render(<Checkbox {...defaultProps} label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Checkbox {...defaultProps} label="Terms" description="Read carefully" />);
    expect(screen.getByText('Read carefully')).toBeInTheDocument();
  });

  it('sets aria-label from label prop', () => {
    render(<Checkbox {...defaultProps} label="Remember me" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-label', 'Remember me');
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Checkbox checked={true} onChange={vi.fn()} variant="default" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders image variant', () => {
      render(<Checkbox checked={true} onChange={vi.fn()} variant="image" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders pdf variant', () => {
      render(<Checkbox checked={true} onChange={vi.fn()} variant="pdf" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Checkbox {...defaultProps} size="sm" />);
      expect(container.querySelector('[class*="w-4"]')).toBeTruthy();
    });

    it('renders medium size (default)', () => {
      const { container } = render(<Checkbox {...defaultProps} />);
      expect(container.querySelector('[class*="w-5"]')).toBeTruthy();
    });

    it('renders large size', () => {
      const { container } = render(<Checkbox {...defaultProps} size="lg" />);
      expect(container.querySelector('[class*="w-6"]')).toBeTruthy();
    });
  });
});
