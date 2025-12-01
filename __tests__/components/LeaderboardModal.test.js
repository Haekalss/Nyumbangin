import { render, screen } from '@testing-library/react';
import LeaderboardModal from '@/components/organisms/LeaderboardModal';

jest.mock('@/utils/format', () => ({
  formatRupiah: (amount) => `Rp ${amount.toLocaleString('id-ID')}`
}));

jest.mock('@/components/atoms/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div>
        <h3>{title}</h3>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/atoms/Button', () => {
  return function MockButton({ children, onClick }) {
    return <button onClick={onClick}>{children}</button>;
  };
});

describe('LeaderboardModal', () => {
  const mockOnClose = jest.fn();

  const mockLeaderboardData = [
    { name: 'Sultan A', totalAmount: 500000 },
    { name: 'Sultan B', totalAmount: 300000 },
    { name: 'Sultan C', totalAmount: 200000 },
    { name: 'Sultan D', totalAmount: 100000 },
    { name: 'Sultan E', totalAmount: 50000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal with title', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  test('renders subtitle text', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText('Sultan bulan ini')).toBeInTheDocument();
  });

  test('renders all leaderboard entries', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText('Sultan A')).toBeInTheDocument();
    expect(screen.getByText('Sultan B')).toBeInTheDocument();
    expect(screen.getByText('Sultan C')).toBeInTheDocument();
    expect(screen.getByText('Sultan D')).toBeInTheDocument();
    expect(screen.getByText('Sultan E')).toBeInTheDocument();
  });

  test('renders formatted amounts', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText(/Rp 500.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp 300.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp 200.000/)).toBeInTheDocument();
  });

  test('displays rank numbers', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('calculates and displays total amount', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    const total = 500000 + 300000 + 200000 + 100000 + 50000;
    expect(screen.getByText(new RegExp(`Rp ${total.toLocaleString('id-ID')}`))).toBeInTheDocument();
  });

  test('displays total donor count', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText(/5 donatur/)).toBeInTheDocument();
  });

  test('renders empty state when no data', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={[]}
      />
    );

    expect(screen.getByText('Belum ada donasi bulan ini')).toBeInTheDocument();
  });

  test('renders Top Donatur header when data exists', () => {
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={mockLeaderboardData}
      />
    );

    expect(screen.getByText('Top Donatur')).toBeInTheDocument();
  });

  test('handles single donor correctly', () => {
    const singleDonor = [{ name: 'Solo Sultan', totalAmount: 1000000 }];
    
    render(
      <LeaderboardModal 
        onClose={mockOnClose}
        leaderboardData={singleDonor}
      />
    );

    expect(screen.getByText('Solo Sultan')).toBeInTheDocument();
    expect(screen.getByText(/1 donatur/)).toBeInTheDocument();
    expect(screen.getAllByText(/Rp 1.000.000/).length).toBeGreaterThan(0);
  });
});
