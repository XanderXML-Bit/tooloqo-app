import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Check } from 'lucide-react';
import { SuccessCard, SuccessMetric, SuccessMessage } from '@/components/common/SuccessCard';

describe('SuccessCard', () => {
  it('renders children content', () => {
    render(
      <SuccessCard icon={Check}>
        <p>File processed</p>
      </SuccessCard>
    );
    expect(screen.getByText('File processed')).toBeInTheDocument();
  });
});

describe('SuccessMetric', () => {
  it('renders value and label', () => {
    render(<SuccessMetric value="42%" label="Reduced" />);
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('Reduced')).toBeInTheDocument();
  });

  it('renders sublabel when provided', () => {
    render(<SuccessMetric value="1.2 MB" label="New size" sublabel="was 3.4 MB" />);
    expect(screen.getByText('was 3.4 MB')).toBeInTheDocument();
  });

  it('does not render sublabel when not provided', () => {
    const { container } = render(<SuccessMetric value="10" label="Files" />);
    // Only 2 text elements: value and label
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
  });
});

describe('SuccessMessage', () => {
  it('renders message text', () => {
    render(<SuccessMessage message="Processing complete" />);
    expect(screen.getByText('Processing complete')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<SuccessMessage message="Done" subtitle="3 files processed" />);
    expect(screen.getByText('3 files processed')).toBeInTheDocument();
  });
});
