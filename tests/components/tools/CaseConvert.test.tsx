import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CaseConvert } from '@/components/tools/text/CaseConvert';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderCaseConvert() {
  return render(
    <MemoryRouter>
      <CaseConvert />
    </MemoryRouter>
  );
}

describe('CaseConvert', () => {
  it('renders tool header', () => {
    renderCaseConvert();
    expect(screen.getByText('Case Converter')).toBeInTheDocument();
  });

  it('renders input textarea', () => {
    renderCaseConvert();
    expect(screen.getByLabelText('Input text for case conversion')).toBeInTheDocument();
  });

  it('renders all case options', () => {
    renderCaseConvert();
    expect(screen.getByText('UPPERCASE')).toBeInTheDocument();
    expect(screen.getByText('lowercase')).toBeInTheDocument();
    expect(screen.getByText('Title Case')).toBeInTheDocument();
    expect(screen.getByText('Sentence case')).toBeInTheDocument();
    expect(screen.getByText('tOGGLE cASE')).toBeInTheDocument();
  });

  it('does not show result when input is empty', () => {
    renderCaseConvert();
    expect(screen.queryByText('Result')).not.toBeInTheDocument();
  });

  it('shows uppercase result by default when text entered', () => {
    renderCaseConvert();
    const textarea = screen.getByLabelText('Input text for case conversion');
    fireEvent.change(textarea, { target: { value: 'hello test' } });
    expect(screen.getByText('HELLO TEST')).toBeInTheDocument();
  });

  it('converts to lowercase when option selected', () => {
    renderCaseConvert();
    const textarea = screen.getByLabelText('Input text for case conversion');
    fireEvent.change(textarea, { target: { value: 'HELLO TEST' } });
    fireEvent.click(screen.getByText('lowercase'));
    expect(screen.getByText('hello test')).toBeInTheDocument();
  });

  it('shows copy button when result is present', () => {
    renderCaseConvert();
    const textarea = screen.getByLabelText('Input text for case conversion');
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});
