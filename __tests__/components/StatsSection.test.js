import { render, screen, fireEvent } from '@testing-library/react';
import StatsSection from '@/components/organisms/StatsSection';

// Mock formatRupiah
jest.mock('@/utils/format', () => ({
  formatRupiah: jest.fn((value) => `Rp ${value.toLocaleString('id-ID')}`),
}));

describe('StatsSection', () => {
  const mockStats = {
    totalDonations: 50,
    totalAmount: 1500000,
  };

  test('renders nothing when stats is null', () => {
    const { container } = render(
      <StatsSection 
        stats={null} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders all stats cards', () => {
    render(
      <StatsSection 
        stats={mockStats} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Total Donasi')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    
    expect(screen.getByText('Total Terkumpul')).toBeInTheDocument();
    expect(screen.getByText('Rp 1.500.000')).toBeInTheDocument();
  });

  test('renders history button', () => {
    render(
      <StatsSection 
        stats={mockStats} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Riwayat Harian')).toBeInTheDocument();
    expect(screen.getAllByText('Klik untuk lihat')).toHaveLength(2);
  });

  test('renders leaderboard button', () => {
    render(
      <StatsSection 
        stats={mockStats} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Leaderboard Bulanan')).toBeInTheDocument();
  });

  test('calls onHistoryClick when history card clicked', () => {
    const mockHistoryClick = jest.fn();
    
    render(
      <StatsSection 
        stats={mockStats} 
        onHistoryClick={mockHistoryClick} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    const historyCard = screen.getByText('Riwayat Harian').closest('div').parentElement;
    fireEvent.click(historyCard);
    
    expect(mockHistoryClick).toHaveBeenCalled();
  });

  test('calls onLeaderboardClick when leaderboard card clicked', () => {
    const mockLeaderboardClick = jest.fn();
    
    render(
      <StatsSection 
        stats={mockStats} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={mockLeaderboardClick} 
      />
    );
    
    const leaderboardCard = screen.getByText('Leaderboard Bulanan').closest('div').parentElement;
    fireEvent.click(leaderboardCard);
    
    expect(mockLeaderboardClick).toHaveBeenCalled();
  });

  test('handles zero stats gracefully', () => {
    const zeroStats = {
      totalDonations: 0,
      totalAmount: 0,
    };
    
    render(
      <StatsSection 
        stats={zeroStats} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Rp 0')).toBeInTheDocument();
  });

  test('handles missing stats properties', () => {
    const emptyStats = {};
    
    render(
      <StatsSection 
        stats={emptyStats} 
        onHistoryClick={jest.fn()} 
        onLeaderboardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
