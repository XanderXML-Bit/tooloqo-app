import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire click when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('hides children during loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders premium variant', () => {
      render(<Button variant="premium">Upgrade</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('h-8');
    });

    it('renders default size', () => {
      render(<Button size="default">Default</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('h-11');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('h-12');
    });

    it('renders icon size', () => {
      render(<Button size="icon">I</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('w-11');
    });
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });
});
