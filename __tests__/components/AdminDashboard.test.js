import { render, screen } from '@testing-library/react';

// Mock Chart.js BEFORE importing component
jest.mock('chart.js', () => {
  const mockChart = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
  }));
  mockChart.register = jest.fn();
  
  return {
    Chart: mockChart,
    registerables: [],
  };
});

import AdminDashboard from '@/components/organisms/AdminDashboard';

// Mock StatsCard
jest.mock('@/components/StatsCard', () => {
  return function MockStatsCard({ title, value }) {
    return (
      <div>
        <div>{title}</div>
        <div>{value}</div>
      </div>
    );
  };
});

describe('AdminDashboard', () => {
  const mockCreators = [
    { username: 'creator1', displayName: 'Creator One' },
    { username: 'creator2', displayName: 'Creator Two' },
    { username: 'creator3', displayName: 'Creator Three' }
  ];

  const mockPayouts = [
    { id: '1', status: 'PROCESSED' },
    { id: '2', status: 'PROCESSED' },
    { id: '3', status: 'PENDING' }
  ];

  const mockDonations = [
    { createdByUsername: 'creator1', amount: 100000 },
    { createdByUsername: 'creator1', amount: 50000 },
    { createdByUsername: 'creator2', amount: 75000 },
    { createdByUsername: 'creator3', amount: 200000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard title', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
  });

  test('renders welcome message', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText(/Selamat datang di panel admin Nyumbangin/)).toBeInTheDocument();
  });

  test('renders total creator stats', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Total Creator')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  test('renders total payout stats', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Total Payout')).toBeInTheDocument();
  });

  test('renders processed payout stats', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Payout Selesai')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('handles empty creators array', () => {
    render(
      <AdminDashboard 
        creators={[]}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Total Creator')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('handles null creators', () => {
    render(
      <AdminDashboard 
        creators={null}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('handles empty payouts array', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={[]}
        donations={mockDonations}
      />
    );

    const payoutElements = screen.getAllByText('0');
    expect(payoutElements.length).toBeGreaterThan(0);
  });

  test('handles null payouts', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={null}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
  });

  test('shows empty state when no top creators', () => {
    render(
      <AdminDashboard 
        creators={[]}
        payouts={mockPayouts}
        donations={[]}
      />
    );

    expect(screen.getByText('Belum ada data donasi untuk ditampilkan')).toBeInTheDocument();
  });

  test('shows empty state message', () => {
    render(
      <AdminDashboard 
        creators={[]}
        payouts={mockPayouts}
        donations={[]}
      />
    );

    expect(screen.getByText(/Grafik akan muncul setelah ada donasi dari creator/)).toBeInTheDocument();
  });

  test('renders canvas when donations exist', () => {
    const { container } = render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('does not render canvas when no top creators', () => {
    const { container } = render(
      <AdminDashboard 
        creators={[]}
        payouts={mockPayouts}
        donations={[]}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeInTheDocument();
  });

  test('calculates top creators correctly', () => {
    const { Chart } = require('chart.js');
    
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    // Chart should be called with top creators data
    expect(Chart).toHaveBeenCalled();
  });

  test('handles donations without amount', () => {
    const donationsNoAmount = [
      { createdByUsername: 'creator1' },
      { createdByUsername: 'creator2', amount: 100000 }
    ];

    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={donationsNoAmount}
      />
    );

    expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
  });

  test('limits top creators to 5', () => {
    const manyCreators = Array.from({ length: 10 }, (_, i) => ({
      username: `creator${i}`,
      displayName: `Creator ${i}`
    }));

    const manyDonations = manyCreators.map(c => ({
      createdByUsername: c.username,
      amount: 100000
    }));

    const { Chart } = require('chart.js');
    
    render(
      <AdminDashboard 
        creators={manyCreators}
        payouts={mockPayouts}
        donations={manyDonations}
      />
    );

    expect(Chart).toHaveBeenCalled();
    const chartCall = Chart.mock.calls[0];
    const labels = chartCall[1].data.labels;
    expect(labels.length).toBeLessThanOrEqual(5);
  });

  test('uses displayName over username for chart labels', () => {
    const { Chart } = require('chart.js');
    
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    const chartCall = Chart.mock.calls[0];
    const labels = chartCall[1].data.labels;
    expect(labels).toContain('Creator One');
  });

  test('falls back to username when no displayName', () => {
    const creatorsNoDisplay = [
      { username: 'creator1' },
      { username: 'creator2' }
    ];

    const { Chart } = require('chart.js');
    
    render(
      <AdminDashboard 
        creators={creatorsNoDisplay}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    const chartCall = Chart.mock.calls[0];
    const labels = chartCall[1].data.labels;
    expect(labels).toContain('creator1');
  });

  test('sorts creators by total donation descending', () => {
    const { Chart } = require('chart.js');
    
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    const chartCall = Chart.mock.calls[0];
    const data = chartCall[1].data.datasets[0].data;
    
    // Check that data is sorted descending
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i]).toBeGreaterThanOrEqual(data[i + 1]);
    }
  });

  test('handles multiple donations from same creator', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    // creator1 has 2 donations (100000 + 50000 = 150000)
    const { Chart } = require('chart.js');
    expect(Chart).toHaveBeenCalled();
  });

  test('renders all three StatsCards', () => {
    render(
      <AdminDashboard 
        creators={mockCreators}
        payouts={mockPayouts}
        donations={mockDonations}
      />
    );

    expect(screen.getByText('Total Creator')).toBeInTheDocument();
    expect(screen.getByText('Total Payout')).toBeInTheDocument();
    expect(screen.getByText('Payout Selesai')).toBeInTheDocument();
  });
});
