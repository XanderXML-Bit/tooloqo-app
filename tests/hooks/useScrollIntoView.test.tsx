import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Check } from 'lucide-react';
import { SuccessCard } from '@/components/common/SuccessCard';
import { ErrorCard } from '@/components/common/ErrorCard';

// Audit item 6: a result or error that renders below the fold is scrolled into view.
describe('result and error cards scroll into view', () => {
  const scrollIntoView = vi.fn();
  beforeEach(() => {
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it('SuccessCard scrolls itself into view when it appears', () => {
    render(<SuccessCard icon={Check}>Done</SuccessCard>);
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'nearest' }));
  });

  it('ErrorCard scrolls itself into view when it appears', () => {
    render(<ErrorCard error="Could not convert this PDF." onRetry={() => {}} />);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
