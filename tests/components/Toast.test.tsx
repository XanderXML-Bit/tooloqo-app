import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { showToast, ToastContainer } from '@/components/common/Toast';

describe('ToastContainer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('shows toast when showToast is called', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('Test message', 'success');
    });
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders toast with role="alert"', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('Alert message', 'error');
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('dismiss button has aria-label', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('Dismissable', 'info');
    });
    expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
  });

  it('removes toast on dismiss click', () => {
    vi.useFakeTimers();
    render(<ToastContainer />);
    act(() => {
      showToast('To dismiss', 'warning');
    });

    const dismissBtn = screen.getByLabelText('Dismiss notification');
    act(() => {
      fireEvent.click(dismissBtn);
    });

    // Wait for exit animation (200ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByText('To dismiss')).not.toBeInTheDocument();
  });

  it('auto-dismisses after timeout', () => {
    vi.useFakeTimers();
    render(<ToastContainer />);
    act(() => {
      showToast('Auto dismiss', 'info');
    });

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    // Advance past TOAST_DURATION (4000ms) + exit animation (200ms)
    act(() => {
      vi.advanceTimersByTime(4300);
    });

    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('First toast', 'success');
      showToast('Second toast', 'error');
    });

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });
});

describe('showToast', () => {
  it('dispatches custom event with correct detail', () => {
    const handler = vi.fn();
    window.addEventListener('tooloqo_toast', handler as EventListener);

    showToast('Test', 'error');

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.message).toBe('Test');
    expect(event.detail.type).toBe('error');
    expect(event.detail.id).toMatch(/^toast-/);

    window.removeEventListener('tooloqo_toast', handler as EventListener);
  });

  it('defaults to info type', () => {
    const handler = vi.fn();
    window.addEventListener('tooloqo_toast', handler as EventListener);

    showToast('Default type');

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.type).toBe('info');

    window.removeEventListener('tooloqo_toast', handler as EventListener);
  });
});
