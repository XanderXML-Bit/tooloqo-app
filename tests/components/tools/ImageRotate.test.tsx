import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageRotate } from '@/components/tools/image/ImageRotate';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderComponent() {
  return render(
    <MemoryRouter>
      <ImageRotate />
    </MemoryRouter>
  );
}

describe('ImageRotate', () => {
  it('renders tool header', () => {
    renderComponent();
    expect(screen.getByText('Rotate & Flip')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderComponent();
    expect(screen.getByText('Adjust orientation instantly')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    renderComponent();
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
