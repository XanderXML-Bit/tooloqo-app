import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageCompress } from '@/components/tools/image/ImageCompress';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderComponent() {
  return render(
    <MemoryRouter>
      <ImageCompress />
    </MemoryRouter>
  );
}

describe('ImageCompress', () => {
  it('renders tool header', () => {
    renderComponent();
    expect(screen.getByText('Compress Image')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderComponent();
    expect(screen.getByText('Reduce file size while keeping quality')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    renderComponent();
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
