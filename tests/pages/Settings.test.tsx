import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings } from '@/pages/Settings';
import { useSettingsStore } from '@/stores/settingsStore';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

describe('Settings', () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: 'dark' });
  });

  it('renders settings heading', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    expect(screen.getByText('Customize your experience')).toBeInTheDocument();
  });

  it('renders theme options', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders about section links', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    // In-app privacy page (the old external tooloqo.app links did not resolve).
    const privacyLinks = screen.getAllByRole('link', { name: /privacy/i });
    expect(privacyLinks.length).toBeGreaterThan(0);
    privacyLinks.forEach((link) => expect(link).toHaveAttribute('href', '/privacy'));
    expect(screen.queryByText('Terms of Service')).not.toBeInTheDocument();
  });

  it('renders version info', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Tooloqo')).toHaveLength(2); // header + about section
  });
});
