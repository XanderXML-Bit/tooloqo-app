import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdBanner } from '@/components/common/AdBanner';

const capacitorMock = vi.hoisted(() => ({ isNative: true }));
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => capacitorMock.isNative },
}));

// Mock the ad store
vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn(),
}));

import { useAdStore } from '@/stores/adStore';

const mockUseAdStore = vi.mocked(useAdStore);

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AdBanner', () => {
  it('renders nothing on the web build, where the in-app purchase does not exist', () => {
    capacitorMock.isNative = false;
    mockUseAdStore.mockImplementation((selector: (state: { isAdFree: () => boolean }) => boolean) =>
      selector({ isAdFree: () => false })
    );
    const { container } = renderWithRouter(<AdBanner />);
    expect(container.firstChild).toBeNull();
    capacitorMock.isNative = true;
  });

  it('renders ad banner for free users', () => {
    mockUseAdStore.mockImplementation((selector: (state: { isAdFree: () => boolean }) => boolean) =>
      selector({ isAdFree: () => false })
    );
    renderWithRouter(<AdBanner />);
    expect(screen.getByText('Enjoying Tooloqo?')).toBeInTheDocument();
    expect(screen.getByText(/ad-free/)).toBeInTheDocument();
  });

  it('renders nothing for ad-free users', () => {
    mockUseAdStore.mockImplementation((selector: (state: { isAdFree: () => boolean }) => boolean) =>
      selector({ isAdFree: () => true })
    );
    const { container } = renderWithRouter(<AdBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ad label for FTC compliance', () => {
    mockUseAdStore.mockImplementation((selector: (state: { isAdFree: () => boolean }) => boolean) =>
      selector({ isAdFree: () => false })
    );
    renderWithRouter(<AdBanner />);
    expect(screen.getByText('Ad')).toBeInTheDocument();
  });

  it('sets data-ad-slot attribute', () => {
    mockUseAdStore.mockImplementation((selector: (state: { isAdFree: () => boolean }) => boolean) =>
      selector({ isAdFree: () => false })
    );
    const { container } = renderWithRouter(<AdBanner slot="settings" />);
    expect(container.querySelector('[data-ad-slot="settings"]')).toBeInTheDocument();
  });

  it('links to ad-free page', () => {
    mockUseAdStore.mockImplementation((selector: (state: { isAdFree: () => boolean }) => boolean) =>
      selector({ isAdFree: () => false })
    );
    renderWithRouter(<AdBanner />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/ad-free');
  });
});
