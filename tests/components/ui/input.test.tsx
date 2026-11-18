import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea, Label } from '@/components/ui/input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('accepts and displays value', () => {
    render(<Input defaultValue="hello" />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies monospace font for number type', () => {
    render(<Input type="number" data-testid="num-input" />);
    const input = screen.getByTestId('num-input');
    expect(input.className).toContain('font-mono');
  });

  it('applies monospace font when mono prop is true', () => {
    render(<Input mono data-testid="mono-input" />);
    const input = screen.getByTestId('mono-input');
    expect(input.className).toContain('font-mono');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Input className="custom" data-testid="custom-input" />);
    expect(screen.getByTestId('custom-input').className).toContain('custom');
  });
});

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Write here" />);
    expect(screen.getByPlaceholderText('Write here')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'text' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('applies monospace font when mono prop is true', () => {
    render(<Textarea mono data-testid="mono-textarea" />);
    expect(screen.getByTestId('mono-textarea').className).toContain('font-mono');
  });

  it('renders disabled state', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('Label', () => {
  it('renders label text', () => {
    render(<Label>Field Label</Label>);
    expect(screen.getByText('Field Label')).toBeInTheDocument();
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email');
  });
});
