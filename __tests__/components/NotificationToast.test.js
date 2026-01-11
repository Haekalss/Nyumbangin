import { render, screen } from '@testing-library/react';
import NotificationToast from '@/components/molecules/NotificationToast';

jest.mock('@/components/atoms/Text', () => {
  return function MockText({ children, variant, weight, color, className }) {
    return <div className={className}>{children}</div>;
  };
});

describe('NotificationToast', () => {
  test('renders notification message', () => {
    render(
      <NotificationToast 
        message="Donasi Baru!"
        detail="Terima kasih atas donasinya"
        time="Baru saja"
        progress={50}
      />
    );

    expect(screen.getByText('Donasi Baru!')).toBeInTheDocument();
  });

  test('renders detail text when provided', () => {
    render(
      <NotificationToast 
        message="Donasi Baru!"
        detail="Rp 50.000 dari Donor A"
        time="Baru saja"
        progress={50}
      />
    );

    expect(screen.getByText(/Pesan: Rp 50.000 dari Donor A/)).toBeInTheDocument();
  });

  test('does not render detail when not provided', () => {
    render(
      <NotificationToast 
        message="Donasi Baru!"
        time="Baru saja"
        progress={50}
      />
    );

    expect(screen.queryByText(/Pesan:/)).not.toBeInTheDocument();
  });

  test('renders time text', () => {
    render(
      <NotificationToast 
        message="Donasi Baru!"
        time="2 menit yang lalu"
        progress={75}
      />
    );

    expect(screen.getByText('2 menit yang lalu')).toBeInTheDocument();
  });

  test('renders progress bar with correct width', () => {
    const { container } = render(
      <NotificationToast 
        message="Donasi Baru!"
        time="Baru saja"
        progress={60}
      />
    );
    const progressBar = container.querySelector('.h-2.bg-\\[\\#2d2d2d\\]');
    expect(progressBar).toHaveStyle({ width: '60%' });
  });

  test('renders progress bar at 0%', () => {
    const { container } = render(
      <NotificationToast 
        message="Donasi Baru!"
        time="Baru saja"
        progress={0}
      />
    );
    const progressBar = container.querySelector('.h-2.bg-\\[\\#2d2d2d\\]');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  test('renders progress bar at 100%', () => {
    const { container } = render(
      <NotificationToast 
        message="Donasi Baru!"
        time="Baru saja"
        progress={100}
      />
    );
    const progressBar = container.querySelector('.h-2.bg-\\[\\#2d2d2d\\]');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  test('renders with all props', () => {
    render(
      <NotificationToast 
        message="Test Message"
        detail="Test Detail"
        time="Test Time"
        progress={45}
      />
    );

    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText(/Pesan: Test Detail/)).toBeInTheDocument();
    expect(screen.getByText('Test Time')).toBeInTheDocument();
  });
});
