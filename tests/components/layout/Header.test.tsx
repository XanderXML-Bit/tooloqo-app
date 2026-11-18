import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

const capacitorMock = vi.hoisted(() => ({ isNative: true }));
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => capacitorMock.isNative },
}));

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renders with default title', () => {
    renderWithRouter(<Header />, { route: '/' });
    expect(screen.getByText('Tooloqo')).toBeInTheDocument();
  });

  it('renders brand mark with logo on home page', () => {
    renderWithRouter(<Header />, { route: '/' });
    expect(screen.getByLabelText('Tooloqo logo')).toBeInTheDocument();
  });

  it('renders page title on non-home pages', () => {
    renderWithRouter(<Header title="Image Resize" />, { route: '/image/resize' });
    expect(screen.getByText('Image Resize')).toBeInTheDocument();
  });

  it('shows back button when showBack and onBack are provided', () => {
    const onBack = vi.fn();
    renderWithRouter(<Header showBack onBack={onBack} />, { route: '/image' });
    const backBtn = screen.getByLabelText('Go back');
    expect(backBtn).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    renderWithRouter(<Header showBack onBack={onBack} />, { route: '/image' });
    fireEvent.click(screen.getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not show back button when showBack is false', () => {
    renderWithRouter(<Header showBack={false} />, { route: '/image' });
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('has settings link', () => {
    renderWithRouter(<Header />, { route: '/' });
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('has ad-free link in the native app', () => {
    renderWithRouter(<Header />, { route: '/' });
    expect(screen.getByLabelText('Go ad-free')).toBeInTheDocument();
  });

  it('hides the ad-free link on the web build', () => {
    capacitorMock.isNative = false;
    renderWithRouter(<Header />, { route: '/' });
    expect(screen.queryByLabelText('Go ad-free')).not.toBeInTheDocument();
    capacitorMock.isNative = true;
  });

  it('renders as header element', () => {
    renderWithRouter(<Header />, { route: '/' });
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
