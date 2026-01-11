import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/organisms/Header';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Header', () => {
  let mockPush;
  let mockOpenProfile;

  beforeEach(() => {
    mockPush = jest.fn();
    mockOpenProfile = jest.fn();
    
    require('next/navigation').useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  test('renders header with user display name', () => {
    const user = { displayName: 'Test User', username: 'testuser' };
    
    render(<Header user={user} openProfile={mockOpenProfile} />);
    
    expect(screen.getByText('Nyumbangin')).toBeInTheDocument();
    expect(screen.getByText(/Selamat datang/)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('renders header with user email when no display name', () => {
    const user = { email: 'test@example.com', username: 'testuser' };
    
    render(<Header user={user} openProfile={mockOpenProfile} />);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('renders all buttons', () => {
    const user = { displayName: 'Test User', username: 'testuser' };
    render(<Header user={user} openProfile={mockOpenProfile} />);
    expect(screen.getByRole('button', { name: /Pengaturan Overlay/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pencairan Dana/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profil/i })).toBeInTheDocument();
  });

  test('calls router.push with overlay URL when Live Widget button clicked', () => {
    const user = { displayName: 'Test User', username: 'testuser' };
    render(<Header user={user} openProfile={mockOpenProfile} />);
    const liveWidgetButton = screen.getByRole('button', { name: /Pengaturan Overlay/i });
    fireEvent.click(liveWidgetButton);
    expect(mockPush).toHaveBeenCalledWith(`/overlay/${user.username}`);
  });

  test('calls router.push with payout URL when Payout button clicked', () => {
    const user = { displayName: 'Test User', username: 'testuser' };
    render(<Header user={user} openProfile={mockOpenProfile} />);
    const payoutButton = screen.getByRole('button', { name: /Pencairan Dana/i });
    fireEvent.click(payoutButton);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/payout');
  });

  test('calls openProfile when Profil button clicked', () => {
    const user = { displayName: 'Test User', username: 'testuser' };
    render(<Header user={user} openProfile={mockOpenProfile} />);
    const profileButton = screen.getByRole('button', { name: /Profil/i });
    fireEvent.click(profileButton);
    expect(mockOpenProfile).toHaveBeenCalled();
  });

  test('renders logo image', () => {
    const user = { displayName: 'Test User', username: 'testuser' };
    
    render(<Header user={user} openProfile={mockOpenProfile} />);
    
    const logo = screen.getByAltText('Nyumbangin Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
  });

  test('handles missing user gracefully', () => {
    render(<Header user={null} openProfile={mockOpenProfile} />);
    
    expect(screen.getByText('Nyumbangin')).toBeInTheDocument();
  });
});
