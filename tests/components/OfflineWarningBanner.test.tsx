import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineWarningBanner } from '@/components/common/OfflineWarningBanner';

// Mock the useOfflineStatus hook
vi.mock('@/hooks', () => ({
  useOfflineStatus: vi.fn(),
}));

import { useOfflineStatus } from '@/hooks';

const mockUseOfflineStatus = vi.mocked(useOfflineStatus);

describe('OfflineWarningBanner', () => {
  it('renders nothing when online', () => {
    mockUseOfflineStatus.mockReturnValue(false);
    const { container } = render(<OfflineWarningBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders warning when offline', () => {
    mockUseOfflineStatus.mockReturnValue(true);
    render(<OfflineWarningBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    mockUseOfflineStatus.mockReturnValue(true);
    render(<OfflineWarningBanner />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
