import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TextCompare } from '@/components/tools/text/TextCompare';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderTextCompare() {
  return render(
    <MemoryRouter>
      <TextCompare />
    </MemoryRouter>
  );
}

describe('TextCompare', () => {
  it('renders tool header', () => {
    renderTextCompare();
    expect(screen.getByText('Text Compare')).toBeInTheDocument();
  });

  it('renders both text inputs', () => {
    renderTextCompare();
    expect(screen.getByLabelText('Original text for comparison')).toBeInTheDocument();
    expect(screen.getByLabelText('Modified text for comparison')).toBeInTheDocument();
  });

  it('renders swap button', () => {
    renderTextCompare();
    expect(screen.getByText('Swap')).toBeInTheDocument();
  });

  it('compare button is disabled when both inputs empty', () => {
    renderTextCompare();
    const compareBtn = screen.getByText('Compare Texts').closest('button');
    expect(compareBtn).toBeDisabled();
  });

  it('compare button is enabled when text is entered', () => {
    renderTextCompare();
    const original = screen.getByLabelText('Original text for comparison');
    fireEvent.change(original, { target: { value: 'hello' } });
    const compareBtn = screen.getByText('Compare Texts').closest('button');
    expect(compareBtn).not.toBeDisabled();
  });

  it('shows diff view after comparing', () => {
    renderTextCompare();
    const original = screen.getByLabelText('Original text for comparison');
    const modified = screen.getByLabelText('Modified text for comparison');
    fireEvent.change(original, { target: { value: 'line one' } });
    fireEvent.change(modified, { target: { value: 'line two' } });
    fireEvent.click(screen.getByText('Compare Texts'));
    expect(screen.getByText('Differences')).toBeInTheDocument();
    expect(screen.getByText('Compare Again')).toBeInTheDocument();
  });

  it('shows stats after comparing', () => {
    renderTextCompare();
    const original = screen.getByLabelText('Original text for comparison');
    const modified = screen.getByLabelText('Modified text for comparison');
    fireEvent.change(original, { target: { value: 'hello' } });
    fireEvent.change(modified, { target: { value: 'world' } });
    fireEvent.click(screen.getByText('Compare Texts'));
    expect(screen.getByText('Added')).toBeInTheDocument();
    expect(screen.getByText('Removed')).toBeInTheDocument();
    expect(screen.getByText('Unchanged')).toBeInTheDocument();
  });

  it('returns to input view on Compare Again', () => {
    renderTextCompare();
    const original = screen.getByLabelText('Original text for comparison');
    fireEvent.change(original, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Compare Texts'));
    fireEvent.click(screen.getByText('Compare Again'));
    expect(screen.getByLabelText('Original text for comparison')).toBeInTheDocument();
  });

  it('swaps text inputs', () => {
    renderTextCompare();
    const original = screen.getByLabelText('Original text for comparison');
    const modified = screen.getByLabelText('Modified text for comparison');
    fireEvent.change(original, { target: { value: 'AAA' } });
    fireEvent.change(modified, { target: { value: 'BBB' } });
    fireEvent.click(screen.getByText('Swap'));
    expect((screen.getByLabelText('Original text for comparison') as HTMLTextAreaElement).value).toBe('BBB');
    expect((screen.getByLabelText('Modified text for comparison') as HTMLTextAreaElement).value).toBe('AAA');
  });
});
