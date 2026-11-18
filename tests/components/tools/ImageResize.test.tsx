import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageResize } from '@/components/tools/image/ImageResize';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderComponent() {
  return render(
    <MemoryRouter>
      <ImageResize />
    </MemoryRouter>
  );
}

describe('ImageResize', () => {
  it('renders tool header', () => {
    renderComponent();
    expect(screen.getByText('Resize Image')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderComponent();
    expect(screen.getByText('Change dimensions for any platform')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    renderComponent();
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });

  it('renders drop instruction text', () => {
    renderComponent();
    expect(screen.getByText('Drop files here or tap to browse')).toBeInTheDocument();
  });
});
