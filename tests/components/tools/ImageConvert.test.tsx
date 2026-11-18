import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageConvert } from '@/components/tools/image/ImageConvert';

vi.mock('@/stores/adStore', () => ({
  useAdStore: vi.fn((selector: (state: { isAdFree: () => boolean }) => boolean) =>
    selector({ isAdFree: () => true })
  ),
}));

function renderComponent() {
  return render(
    <MemoryRouter>
      <ImageConvert />
    </MemoryRouter>
  );
}

describe('ImageConvert', () => {
  it('renders tool header', () => {
    renderComponent();
    expect(screen.getByText('Convert Format')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderComponent();
    expect(screen.getByText('Change image format instantly')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    renderComponent();
    expect(screen.getByLabelText('Choose files to upload')).toBeInTheDocument();
  });
});
