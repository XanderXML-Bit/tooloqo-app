import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WordCount } from '@/components/tools/text/WordCount';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderWordCount() {
  return render(
    <MemoryRouter>
      <WordCount />
    </MemoryRouter>
  );
}

describe('WordCount', () => {
  it('renders tool header', () => {
    renderWordCount();
    expect(screen.getByText('Word Counter')).toBeInTheDocument();
  });

  it('renders textarea with correct aria-label', () => {
    renderWordCount();
    expect(screen.getByLabelText('Text for word counting')).toBeInTheDocument();
  });

  it('shows zero stats initially', () => {
    renderWordCount();
    // All stat values should be 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(5);
  });

  it('updates stats when text is entered', () => {
    renderWordCount();
    const textarea = screen.getByLabelText('Text for word counting');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 words
    expect(screen.getByText('11')).toBeInTheDocument(); // 11 characters
  });

  it('renders statistics section', () => {
    renderWordCount();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('shows reading and speaking time labels', () => {
    renderWordCount();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Speaking')).toBeInTheDocument();
  });
});
