import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageCrop } from '@/components/tools/image/ImageCrop';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderComponent() {
  return render(
    <MemoryRouter>
      <ImageCrop />
    </MemoryRouter>
  );
}

describe('ImageCrop', () => {
  it('renders tool header', () => {
    renderComponent();
    expect(screen.getByText('Crop Image')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderComponent();
    expect(screen.getByText('Select and extract any portion')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    renderComponent();
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
