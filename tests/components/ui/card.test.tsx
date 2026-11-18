import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('rounded-xl');
  });

  it('renders with elevated variant', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');
  });

  it('renders with interactive variant', () => {
    const { container } = render(<Card variant="interactive">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('cursor-pointer');
  });

  it('renders with glass variant', () => {
    const { container } = render(<Card variant="glass">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('backdrop-blur');
  });

  it('renders with ghost variant', () => {
    const { container } = render(<Card variant="ghost">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('border-transparent');
  });

  it('applies category hover styles for image', () => {
    const { container } = render(<Card category="image">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('hover:border-tool-image');
  });

  it('applies category hover styles for pdf', () => {
    const { container } = render(<Card category="pdf">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('hover:border-tool-pdf');
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="my-class">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('my-class');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });
});

describe('CardTitle', () => {
  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
  });
});

describe('CardDescription', () => {
  it('renders children', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body content</CardContent>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
